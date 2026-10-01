if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cors = require("cors");//for react request
const session = require("express-session");
const MongoStore = require('connect-mongo').default;;
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { isLoggedIn } = require("./middleware.js");
const Fuse = require("fuse.js");


const port = 5000;

app.use(express.static(path.join(__dirname,"public/css")));
app.use(express.static(path.join(__dirname,"public/js")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));


app.set("view engine","ejs");
app.set("views", path.join(__dirname,"/views"));

const Patient = require("./models/patient.js");
const Doctor = require("./models/doctor.js");
const Pharmacy = require("./models/pharmacy.js");
const User = require("./models/user.js");
const Consultation = require("./models/consultation.js");

const dbUrl = "mongodb://127.0.0.1:27017/Health-Tech";
main()
.then(()=>{
    console.log("connection sucessfull");

    app.listen(port,()=>{
    console.log(`app is listening on port ${port}`);
})
}).catch(err => console.log(err));
async function main(){
    await mongoose.connect(dbUrl);
}

const sessionOptions  = {
  secret: process.env.SECRET, 
  resave:false,
  saveUninitialized:true,
  cookie:{
      expires:Date.now() + 7*24*60*60*1000,
      maxAge: 7*24*60*60*1000,
      httpOnly:true,
      sameSite: "lax"
  }
}

app.use(cors({ 
  origin: "http://localhost:5173",   // no trailing slash
  credentials: true 
}));
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//====================================================
// SEARCH HELPERS (used by both doctors and pharmacies)
//====================================================
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const getTerms = (search) => search.trim().split(/\s+/).filter(Boolean);

const PHARMACY_FIELDS = [
  "name", "location.village", "location.city", "location.district",
  "location.state", "medicineStock.medicineName",
];
const DOCTOR_FIELDS = [
  "name", "specialty", "hospital", "location.city",
  "location.district", "location.state", "languages",
];

// every word must match at least one field
function buildSearchFilter(terms, fields) {
  if (terms.length === 0) return {};
  return {
    $and: terms.map((t) => {
      const rx = { $regex: escapeRegex(t), $options: "i" };
      return { $or: fields.map((f) => ({ [f]: rx })) };
    }),
  };
}

// spelling-mistake fallback
function fuzzySearch(list, search, fields) {
  const fuse = new Fuse(list, { keys: fields, threshold: 0.3 });
  return fuse.search(search).map((r) => r.item);
}

// which searched medicines this pharmacy has (for the green/red chips)
function addMatchedMedicines(list, terms) {
  if (terms.length === 0) return list;
  return list.map((p) => ({
    ...p,
    matchedMedicines: (p.medicineStock || []).filter((m) =>
      terms.some((t) => m.medicineName?.toLowerCase().includes(t.toLowerCase()))
    ),
  }));
}

//signup:
app.post("/signup", async (req, res, next) => {
  try {
    let { email, role, password } = req.body;
    const newUser = new User({ email, role });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      res.status(200).json({
        message: "Signup successful",
        role: registeredUser.role,
        userId: registeredUser._id
      });
    });
  } catch (e) {
    console.error("SIGNUP ERROR:", e); 
    res.status(500).json({ error: e.message });
  }
});

//login:
app.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || "Login failed" });
    req.login(user, async (err) => {
      if (err) return next(err);

      let profileExists = false;
      if (user.role === "doctor") profileExists = !!(await Doctor.findOne({ user: user._id }));
      if (user.role === "patient") profileExists = !!(await Patient.findOne({ user: user._id }));
      if (user.role === "pharmacy") profileExists = !!(await Pharmacy.findOne({ user: user._id }));

      res.status(200).json({
        message: "Login successful",
        role: user.role,
        userId: user._id,
        profileExists
      });
    });
  })(req, res, next);
});

//logout
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ message: "Logged out successfully" });
  });
});

//curr-user
app.get("/current-user", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({
      loggedIn: true,
      role: req.user.role,
      userId: req.user._id
    });
  } else {
    res.status(200).json({ loggedIn: false });
  }
});

//====================================================
// DOCTORS
//====================================================

//all doctors (+ search):
app.get("/doctors", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const terms = getTerms(search);

    let results = await Doctor.find(buildSearchFilter(terms, DOCTOR_FIELDS)).lean();

    if (terms.length > 0 && results.length === 0) {
      const all = await Doctor.find({}).lean();
      results = fuzzySearch(all, search, DOCTOR_FIELDS);
    }

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//nearby doctors (+ search) -- MUST stay above /doctors/:id
app.get("/doctors/nearby", async (req, res) => {
  try {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const maxDistance = parseInt(req.query.maxDistance) || 20000;
    const search = (req.query.search || "").trim();
    const terms = getTerms(search);

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ error: "lng and lat are required" });
    }

    const geoStage = (query) => ({
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distance",
        maxDistance,
        spherical: true,
        query,
      },
    });

    let results = await Doctor.aggregate([geoStage(buildSearchFilter(terms, DOCTOR_FIELDS))]);

    if (terms.length > 0 && results.length === 0) {
      const all = await Doctor.aggregate([geoStage({})]);
      results = fuzzySearch(all, search, DOCTOR_FIELDS);
    }

    res.status(200).json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//show doctor:
app.get("/doctors/:id",async(req,res)=>{
  try{
    let {id} = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.status(200).json(doctor);
  }catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//====================================================
// PHARMACIES
//====================================================

//all pharmacies (+ search):
app.get("/pharmacies", async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const terms = getTerms(search);

    let results = await Pharmacy.find(buildSearchFilter(terms, PHARMACY_FIELDS)).lean();

    if (terms.length > 0 && results.length === 0) {
      const all = await Pharmacy.find({}).lean();
      results = fuzzySearch(all, search, PHARMACY_FIELDS);
    }

    res.status(200).json(addMatchedMedicines(results, terms));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//nearby pharmacies (+ search) -- MUST stay above /pharmacies/:id
app.get("/pharmacies/nearby", async (req, res) => {
  try {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const maxDistance = parseInt(req.query.maxDistance) || 20000;
    const search = (req.query.search || "").trim();
    const terms = getTerms(search);

    if (isNaN(lng) || isNaN(lat)) {
      return res.status(400).json({ error: "lng and lat are required" });
    }

    const geoStage = (query) => ({
      $geoNear: {
        near: { type: "Point", coordinates: [lng, lat] },
        distanceField: "distance",
        maxDistance,
        spherical: true,
        query,
      },
    });

    let results = await Pharmacy.aggregate([geoStage(buildSearchFilter(terms, PHARMACY_FIELDS))]);

    if (terms.length > 0 && results.length === 0) {
      const all = await Pharmacy.aggregate([geoStage({})]);
      results = fuzzySearch(all, search, PHARMACY_FIELDS);
    }

    res.status(200).json(addMatchedMedicines(results, terms));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//show pharmacy:
app.get("/pharmacies/:id", async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });
    res.status(200).json(pharmacy);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//====================================================
// DOCTOR PROFILE CRUD
//====================================================
app.get("/doctor/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    const profile = await Doctor.findOne({ user: req.user._id });
    res.status(200).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/doctor/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    const profile = await Doctor.create({ user: req.user._id, ...req.body });
    res.status(201).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/doctor/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    const profile = await Doctor.findOneAndUpdate({ user: req.user._id }, req.body, { new: true });
    res.status(200).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/doctor/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    await Doctor.deleteOne({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.status(200).json({ message: "Account deleted" });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//====================================================
// PATIENT PROFILE CRUD
//====================================================
app.get("/patient/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "patient") return res.status(403).json({ error: "Not authorized" });
    const profile = await Patient.findOne({ user: req.user._id });
    res.status(200).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/patient/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "patient") return res.status(403).json({ error: "Not authorized" });
    const profile = await Patient.create({ user: req.user._id, ...req.body });
    res.status(201).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/patient/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "patient") return res.status(403).json({ error: "Not authorized" });
    const profile = await Patient.findOneAndUpdate({ user: req.user._id }, req.body, { new: true });
    res.status(200).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/patient/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "patient") return res.status(403).json({ error: "Not authorized" });
    await Patient.deleteOne({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.status(200).json({ message: "Account deleted" });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//====================================================
// PHARMACY PROFILE CRUD
//====================================================
app.get("/pharmacy/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") return res.status(403).json({ error: "Not authorized" });
    const profile = await Pharmacy.findOne({ user: req.user._id });
    res.status(200).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/pharmacy/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") return res.status(403).json({ error: "Not authorized" });
    const profile = await Pharmacy.create({ user: req.user._id, ...req.body });
    res.status(201).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/pharmacy/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") return res.status(403).json({ error: "Not authorized" });
    const profile = await Pharmacy.findOneAndUpdate({ user: req.user._id }, req.body, { new: true });
    res.status(200).json(profile);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/pharmacy/profile", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "pharmacy") return res.status(403).json({ error: "Not authorized" });
    await Pharmacy.deleteOne({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.status(200).json({ message: "Account deleted" });
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//====================================================
// CONSULTATIONS
//====================================================

// PATIENT books a consultation
app.post("/consultations", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "patient") return res.status(403).json({ error: "Only patients can book" });
    const { doctorId, date, slot, symptoms } = req.body;
    const consultation = await Consultation.create({
      patient: req.user._id,
      doctor: doctorId,
      date,
      slot,
      symptoms
    });
    res.status(201).json(consultation);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PATIENT - my bookings
app.get("/patient/consultations", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "patient") return res.status(403).json({ error: "Not authorized" });
    const list = await Consultation.find({ patient: req.user._id })
      .populate("doctor", "name specialty image")
      .sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DOCTOR - my appointments
app.get("/doctor/consultations", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    const list = await Consultation.find({ doctor: doctorProfile._id })
      .populate("patient", "email")
      .sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DOCTOR - confirm / cancel / complete
app.put("/consultations/:id/status", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    const { status } = req.body; // "confirmed" | "cancelled" | "completed"
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    // if call finished/cancelled, doctor becomes available again
    if (status === "completed" || status === "cancelled") {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      await Doctor.findByIdAndUpdate(doctorProfile._id, { isAvailableNow: true });
    }

    res.status(200).json(consultation);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DOCTOR - start video call
app.post("/consultations/:id/start-call", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    const roomId = `room-${req.params.id}-${Date.now()}`;

    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status: "ongoing", roomId },
      { new: true }
    );

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    await Doctor.findByIdAndUpdate(doctorProfile._id, { isAvailableNow: false });

    res.status(200).json(consultation);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DOCTOR - end video call
app.post("/consultations/:id/end-call", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    await Doctor.findByIdAndUpdate(doctorProfile._id, { isAvailableNow: true });

    res.status(200).json(consultation);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DOCTOR - add prescription
app.put("/consultations/:id/prescription", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "doctor") return res.status(403).json({ error: "Not authorized" });
    const { notes, medicines } = req.body;
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { prescription: { notes, medicines } },
      { new: true }
    );
    res.status(200).json(consultation);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


//====================================================
// SYMPTOM CHECKER
//====================================================

// Emergency keywords -> always force High urgency, no matter what AI says later
const EMERGENCY_KEYWORDS = [
  "chest pain", "difficulty breathing", "breathless", "unconscious",
  "severe bleeding", "seizure", "stroke", "paralysis", "suicidal",
  "no pulse", "not breathing", "blue lips", "severe burn"
];

app.post("/symptom-check", isLoggedIn, async (req, res) => {
  try {
    if (req.user.role !== "patient") return res.status(403).json({ error: "Not authorized" });

    const { symptoms } = req.body; // array of strings, e.g. ["Fever", "Cough", "chest pain"]
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ error: "Please select at least one symptom" });
    }

    const text = symptoms.join(" ").toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some((k) => text.includes(k));

    // TODO: replace this mock block with Tusar's real AI API call
    let possibleCondition = "General illness - consult a doctor for accurate diagnosis";
    let urgencyLevel = "low";
    let confidence = 0.5;

    if (symptoms.length >= 3) {
      urgencyLevel = "medium";
      confidence = 0.65;
    }
    if (isEmergency) {
      possibleCondition = "Potential medical emergency";
      urgencyLevel = "high";
      confidence = 0.95;
    }

    res.status(200).json({
      possibleCondition,
      urgencyLevel,       // "low" | "medium" | "high"
      confidence,
      forcedByRule: isEmergency  // true if our safety rule overrode the AI
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});