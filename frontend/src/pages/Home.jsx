import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from "@mui/material";

import {
  ArrowForward,
  CheckCircle,
  ExpandMore,
  HealthAndSafety,
  MedicalServices,
  Healing,
  Assignment,
  LocalPharmacy,
  PhoneInTalk,
  VolumeUp,
  StopCircle,
  Mic,
  VideoCall,
  CalendarMonth,
  ReceiptLong,
  LocationOn
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDoctors } from "../api/doctorApi";
import { useAccessibility } from "../context/AccessibilityContext";
import "./Home.css";

// Fallback doctors in case server or DB is initializing
const fallbackDoctors = [
  {
    _id: "doc-f1",
    name: "Dr. Rajesh Kumar",
    specialty: "General Physician",
    hospital: "AIIMS Community Care Center",
    experience: 12,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&h=800&q=80",
    languages: ["Hindi", "English", "Odia"],
    isAvailableNow: true
  },
  {
    _id: "doc-f2",
    name: "Dr. Neha Patel",
    specialty: "Pediatrics",
    hospital: "Care Children's Hospital",
    experience: 10,
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=600&h=800&q=80",
    languages: ["Hindi", "English"],
    isAvailableNow: true
  },
  {
    _id: "doc-f3",
    name: "Dr. Sandeep Mohanty",
    specialty: "Orthopedics",
    hospital: "AMRI Hospital",
    experience: 15,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&h=800&q=80",
    languages: ["Odia", "Hindi", "English"],
    isAvailableNow: false
  },
  {
    _id: "doc-f4",
    name: "Dr. Sneha Mishra",
    specialty: "Gynecology",
    hospital: "KIMS Hospital",
    experience: 11,
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&h=800&q=80",
    languages: ["Hindi", "Odia", "English"],
    isAvailableNow: true
  }
];

const quickSymptoms = [
  {
    id: "fever",
    icon: "🌡️",
    name: "Fever & Chills",
    nameHi: "बुखार और ठंड",
    nameOr: "ଜ୍ୱର ଏବଂ ଥଣ୍ଡା",
    specialist: "General Physician",
    advice: "Drink plenty of water and consult a general doctor."
  },
  {
    id: "headache",
    icon: "🤕",
    name: "Headache",
    nameHi: "सिरदर्द व चक्कर",
    nameOr: "ମୁଣ୍ଡବିନ୍ଧା",
    specialist: "General Physician",
    advice: "Rest in a quiet space and get your blood pressure checked."
  },
  {
    id: "cough",
    icon: "🤧",
    name: "Cough & Cold",
    nameHi: "खांसी और जुकाम",
    nameOr: "କାଶ ଏବଂ ଥଣ୍ଡା",
    specialist: "General Physician",
    advice: "Steam inhalation and warm water gargle are recommended."
  },
  {
    id: "stomach_ache",
    icon: "🤢",
    name: "Stomach Ache",
    nameHi: "पेट दर्द और उल्टी",
    nameOr: "ପେଟ ଯନ୍ତ୍ରଣା",
    specialist: "General Physician",
    advice: "Avoid spicy food, drink ORS solution and consult a doctor."
  },
  {
    id: "knee_pain",
    icon: "🦵",
    name: "Joint / Knee Pain",
    nameHi: "घुटने व जोड़ों का दर्द",
    nameOr: "ଗଣ୍ଠି ଯନ୍ତ୍ରଣା",
    specialist: "Orthopedics",
    advice: "Orthopedic specialist consultation advised for joint stiffness."
  },
  {
    id: "skin_rash",
    icon: "🧴",
    name: "Skin Itching & Rash",
    nameHi: "त्वचा पर लाल दाने",
    nameOr: "ଚର୍ମ କୁଣ୍ଡାଇବା",
    specialist: "Dermatology",
    advice: "Keep skin dry and do not scratch. Consult a skin specialist."
  }
];

const specialtiesList = [
  { id: "all", label: "All Doctors", labelHi: "सभी डॉक्टर", labelOr: "ସମସ୍ତ ଡାକ୍ତର", icon: "👨‍⚕️" },
  { id: "General Physician", label: "General Physician", labelHi: "सामान्य रोग (बुखार/कमजोरी)", labelOr: "ସାଧାରଣ ରୋଗ", icon: "🩺" },
  { id: "Pediatrics", label: "Children (Pediatrics)", labelHi: "शिशु व बाल रोग", labelOr: "ଶିଶୁ ରୋଗ", icon: "👶" },
  { id: "Orthopedics", label: "Bones & Joints", labelHi: "हड्डी व जोड़", labelOr: "ହାଡ ଓ ଗଣ୍ଠି", icon: "🦴" },
  { id: "Gynecology", label: "Women's Health", labelHi: "महिला रोग व प्रसूति", labelOr: "ମହିଳା ସ୍ୱାସ୍ଥ୍ୟ", icon: "🌸" },
  { id: "Neurology", label: "Nerves & Brain", labelHi: "सिरदर्द व नसें", labelOr: "ସ୍ନାୟୁ ରୋଗ", icon: "🧠" },
  { id: "ENT", label: "Ear, Nose, Throat", labelHi: "कान, नाक, गला", labelOr: "କାନ, ନାକ, ଗଳା", icon: "👂" }
];

const steps = [
  {
    number: "1",
    icon: "🩺",
    title: "Choose a Doctor",
    titleHi: "डॉक्टर चुनें",
    text: "Browse verified doctors by photo, language and specialty.",
    textHi: "अपनी भाषा और समस्या के अनुसार डॉक्टर की फोटो देखकर चुनें।"
  },
  {
    number: "2",
    icon: "⏰",
    title: "Pick Free Time",
    titleHi: "समय तय करें",
    text: "Select a comfortable time slot with a single tap.",
    textHi: "अपनी सुविधा अनुसार एक क्लिक में समय तय करें।"
  },
  {
    number: "3",
    icon: "📱",
    title: "Speak on Video Call",
    titleHi: "फोन पर बात करें",
    text: "Talk directly to the doctor from home on your smartphone.",
    textHi: "घर बैठे फोन या वीडियो कॉल पर डॉक्टर को अपनी बीमारी बताएं।"
  },
  {
    number: "4",
    icon: "📄",
    title: "Get Prescription",
    titleHi: "पर्ची प्राप्त करें",
    text: "Receive digital prescription with sunrise & moon medicine timings.",
    textHi: "मोबाइल पर सूरज-चांद के चिन्ह वाली आसान पर्ची पाएं।"
  }
];

const faqs = [
  {
    question: "क्या मुझे पढ़ने-लिखने की ज्यादा जरूरत पड़ेगी? (Do I need high literacy?)",
    questionEn: "Do I need high literacy to use this service?",
    answer: "बिल्कुल नहीं! पूरा ऐप सरल चिन्हों, तस्वीरों और सूरज-चांद के संकेतों पर आधारित है। आप हर चीज़ को माइक का बटन दबाकर सुन भी सकते हैं और बोलकर भी बता सकते हैं।"
  },
  {
    question: "डॉक्टर से बात करने के लिए क्या करना होगा? (How to consult a doctor?)",
    questionEn: "How do I consult a doctor?",
    answer: "बस 'डॉक्टर सूची' में जाएं, अपनी भाषा (हिंदी, उड़िया, अंग्रेजी) बोलने वाले डॉक्टर को चुनें और 'बात करें' पर दबाएं। आपके फोन पर वीडियो कॉल जुड़ जाएगी।"
  },
  {
    question: "दवाइयां कब खानी हैं, यह कैसे पता चलेगा? (How will I know medicine timings?)",
    questionEn: "How will I know my medicine schedule?",
    answer: "हमारी पर्ची में सुबह के लिए उगता सूरज 🌅, दोपहर के लिए पूरा सूरज ☀️, और रात के लिए चांद 🌙 का निशान बना होता है। आप 'पर्ची सुनें' दबाकर आवाज़ में भी सुन सकते हैं।"
  },
  {
    question: "क्या यह सेवा आपातकाल के लिए है? (What to do in an emergency?)",
    questionEn: "What should I do in a medical emergency?",
    answer: "गंभीर आपातकाल में तुरंत शीर्ष पर दिए गए लाल बटन '108' पर कॉल करें। 108 पर सरकार द्वारा मुफ्त एम्बुलेंस और आपातकालीन सहायता तुरंत मिलती है।"
  }
];

export default function Home() {
  const navigate = useNavigate();
  const { lang, speak, stopSpeaking, isSpeaking } = useAccessibility();

  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [activeSymptom, setActiveSymptom] = useState(null);

  useEffect(() => {
    getDoctors()
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setDoctorsList(res.data);
        } else {
          setDoctorsList(fallbackDoctors);
        }
      })
      .catch(() => {
        setDoctorsList(fallbackDoctors);
      });
  }, []);

  // Filter doctors by selected specialty
  const filteredDoctors = selectedSpecialty === "all"
    ? doctorsList
    : doctorsList.filter((doc) => doc.specialty?.toLowerCase().includes(selectedSpecialty.toLowerCase()));

  const handleHeroAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(
        lang === "hi"
          ? "टेलीहेल्थ ब्रिज में आपका स्वागत है। यहां आप आसानी से डॉक्टर से बात कर सकते हैं, बीमारी की जांच कर सकते हैं, और पुरानी पर्ची देख सकते हैं। नीचे दिए गए बड़े कार्ड पर क्लिक करें।"
          : "Welcome to Telehealth Bridge. Easily consult verified doctors from home, check your symptoms, and review your prescriptions."
      );
    }
  };

  return (
    <Box className="home-page">
      {/* =====================================================
          1. HERO SECTION WITH 4 GIANT ACCESSIBILITY ACTION CARDS
      ===================================================== */}
      <section className="home-hero-v2">
        <Container maxWidth="xl">
          <Box className="hero-v2-header">
            <Box className="hero-v2-badge">
              <HealthAndSafety sx={{ fontSize: 22, color: "#10b981" }} />
              <span>
                {lang === "hi" ? "सत्यापित डॉक्टर • आसान व सुरक्षित सेवा" : lang === "or" ? "ବିଶ୍ୱାସଯୋଗ୍ୟ ଡାକ୍ତର ସେବା" : "Trusted Healthcare From Home"}
              </span>
            </Box>

            <Typography component="h1" className="hero-v2-title">
              {lang === "hi" ? (
                <>
                  घर बैठे डॉक्टर से बात करें,
                  <span> पूरी तरह आसान।</span>
                </>
              ) : lang === "or" ? (
                <>
                  ଘରେ ବସି ଡାକ୍ତରଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ,
                  <span> ସହଜ ଓ ସରଳ।</span>
                </>
              ) : (
                <>
                  Healthcare Made Simple,
                  <span> for Every Family.</span>
                </>
              )}
            </Typography>

            <Typography className="hero-v2-desc">
              {lang === "hi"
                ? "शहर जाने की जरूरत नहीं। अपनी भाषा में डॉक्टर से सलाह लें, बीमारी के लक्षण समझें और पुरानी पर्चियां एक जगह पाएं।"
                : "No long travels to the city. Consult verified doctors in your language, check symptoms easily, and access prescriptions anytime."}
            </Typography>

            {/* Read Aloud Hero Button */}
            <Box sx={{ mt: 2, mb: 4 }}>
              <Button
                variant="outlined"
                onClick={handleHeroAudio}
                className={`hero-audio-btn ${isSpeaking ? "is-speaking" : ""}`}
                startIcon={isSpeaking ? <StopCircle /> : <VolumeUp />}
              >
                {isSpeaking ? (lang === "hi" ? "आवाज़ रोकें" : "Stop Audio") : (lang === "hi" ? "🔊 पूरी जानकारी आवाज़ में सुनें" : "🔊 Listen to Guide")}
              </Button>
            </Box>
          </Box>

          {/* =====================================================
              THE 4 ESSENTIAL ACTION TILES (PROMINENTLY SIZED)
          ===================================================== */}
          <Box className="essential-actions-container">
            <Typography variant="subtitle2" className="actions-section-label">
              ⭐ {lang === "hi" ? "मुख्य सुविधाएं (Tap to open feature):" : "Essential Quick Actions:"}
            </Typography>

            <Grid container spacing={2.5}>
              {/* Card 1: Find Doctor */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <button
                  type="button"
                  className="essential-action-tile tile-doctor"
                  onClick={() => {
                    document.getElementById("doctors-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Box className="tile-icon-wrap icon-doctor">
                    <MedicalServices sx={{ fontSize: 38 }} />
                  </Box>
                  <Box className="tile-text-wrap">
                    <Typography className="tile-title">
                      {lang === "hi" ? "1. डॉक्टर सूची देखें" : "1. Find Doctors"}
                    </Typography>
                    <Typography className="tile-sub">
                      {lang === "hi" ? "विशेषज्ञ डॉक्टर व परामर्श" : "Verified Specialists Online"}
                    </Typography>
                    <span className="tile-action-chip">
                      {lang === "hi" ? "डॉक्टर देखें ➡️" : "Browse Doctors ➡️"}
                    </span>
                  </Box>
                </button>
              </Grid>

              {/* Card 2: Symptom Checker */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <button
                  type="button"
                  className="essential-action-tile tile-symptom highlighted-tile"
                  onClick={() => navigate("/symptom-checker")}
                >
                  <Box className="tile-icon-wrap icon-symptom">
                    <Healing sx={{ fontSize: 38 }} />
                  </Box>
                  <Box className="tile-text-wrap">
                    <Typography className="tile-title">
                      {lang === "hi" ? "2. बीमारी जांचें" : "2. Symptom Checker"}
                    </Typography>
                    <Typography className="tile-sub">
                      {lang === "hi" ? "बोलकर या चुनकर समझें" : "Check by Voice or Touch"}
                    </Typography>
                    <span className="tile-action-chip action-pulse">
                      {lang === "hi" ? "जांच शुरू करें ➡️" : "Start Check ➡️"}
                    </span>
                  </Box>
                </button>
              </Grid>

              {/* Card 3: Patient History */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <button
                  type="button"
                  className="essential-action-tile tile-history"
                  onClick={() => navigate("/patient-history")}
                >
                  <Box className="tile-icon-wrap icon-history">
                    <Assignment sx={{ fontSize: 38 }} />
                  </Box>
                  <Box className="tile-text-wrap">
                    <Typography className="tile-title">
                      {lang === "hi" ? "3. पुरानी पर्ची व इतिहास" : "3. Patient History"}
                    </Typography>
                    <Typography className="tile-sub">
                      {lang === "hi" ? "दवाइयों का समय व रिकॉर्ड" : "Prescriptions & Timings"}
                    </Typography>
                    <span className="tile-action-chip">
                      {lang === "hi" ? "पर्ची देखें ➡️" : "View Records ➡️"}
                    </span>
                  </Box>
                </button>
              </Grid>

              {/* Card 4: Pharmacies */}
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <button
                  type="button"
                  className="essential-action-tile tile-pharmacy"
                  onClick={() => navigate("/pharmacies")}
                >
                  <Box className="tile-icon-wrap icon-pharmacy">
                    <LocalPharmacy sx={{ fontSize: 38 }} />
                  </Box>
                  <Box className="tile-text-wrap">
                    <Typography className="tile-title">
                      {lang === "hi" ? "4. दवा दुकान खोजें" : "4. Find Medicines"}
                    </Typography>
                    <Typography className="tile-sub">
                      {lang === "hi" ? "नजदीकी मेडिकल स्टोर" : "Nearby Pharmacies"}
                    </Typography>
                    <span className="tile-action-chip">
                      {lang === "hi" ? "दवा खोजें ➡️" : "Search Store ➡️"}
                    </span>
                  </Box>
                </button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </section>

      {/* =====================================================
          2. SYMPTOM CHECKER SPOTLIGHT (PROMINENTLY SIZED & PLACED)
      ===================================================== */}
      <section className="symptom-spotlight-section">
        <Container maxWidth="xl">
          <Card className="symptom-spotlight-card" elevation={3}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Box className="spotlight-top">
                <Box>
                  <Box className="spotlight-eyebrow">
                    <Healing sx={{ fontSize: 18 }} />
                    <span>{lang === "hi" ? "1 मिनट में स्वास्थ्य जांच" : "Instant Health Check"}</span>
                  </Box>
                  <Typography variant="h3" className="spotlight-title">
                    {lang === "hi" ? "क्या तकलीफ महसूस हो रही है?" : "What symptoms are you feeling?"}
                  </Typography>
                  <Typography className="spotlight-sub">
                    {lang === "hi"
                      ? "नीचे दिए गए किसी भी लक्षण पर टैप करें या पूरा लक्षण जांचने के लिए मुख्य पृष्ठ पर जाएं।"
                      : "Tap a common symptom below to see quick guidance, or open the full voice-assisted checker."}
                  </Typography>
                </Box>

                {/* Primary Button to Full View */}
                <Box className="spotlight-btn-group">
                  <Button
                    variant="contained"
                    size="large"
                    className="open-full-checker-btn"
                    onClick={() => navigate("/symptom-checker")}
                    endIcon={<ArrowForward />}
                  >
                    {lang === "hi" ? "पूरा लक्षण जांच खोलें (बोलकर बताएं)" : "Open Full Symptom Checker"}
                  </Button>
                </Box>
              </Box>

              {/* 6 Visual Quick-Touch Symptom Tiles */}
              <Box className="quick-symptoms-grid">
                {quickSymptoms.map((sym) => {
                  const isActive = activeSymptom?.id === sym.id;
                  return (
                    <button
                      key={sym.id}
                      type="button"
                      className={`quick-sym-chip ${isActive ? "active" : ""}`}
                      onClick={() => setActiveSymptom(sym)}
                    >
                      <span className="sym-chip-emoji">{sym.icon}</span>
                      <span className="sym-chip-text">
                        {lang === "hi" ? sym.nameHi : lang === "or" ? sym.nameOr : sym.name}
                      </span>
                    </button>
                  );
                })}
              </Box>

              {/* Live interactive preview banner if symptom clicked */}
              {activeSymptom && (
                <Box className="spotlight-preview-banner">
                  <Box className="preview-info">
                    <span className="preview-icon">{activeSymptom.icon}</span>
                    <Box>
                      <Typography className="preview-title">
                        {lang === "hi" ? activeSymptom.nameHi : activeSymptom.name}
                      </Typography>
                      <Typography className="preview-advice">
                        💡 {activeSymptom.advice}
                      </Typography>
                      <Typography className="preview-doc-note">
                        🩺 <strong>{lang === "hi" ? "सुझाए गए विशेषज्ञ:" : "Recommended Specialist:"}</strong> {activeSymptom.specialist}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className="preview-action">
                    <Button
                      variant="contained"
                      className="preview-doc-btn"
                      onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(activeSymptom.specialist)}`)}
                      endIcon={<ArrowForward />}
                    >
                      {lang === "hi" ? `${activeSymptom.specialist} खोजें` : `Find ${activeSymptom.specialist}`}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/symptom-checker?symptom=${activeSymptom.id}`)}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      {lang === "hi" ? "विस्तार से जांचें" : "Detailed Check"}
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* =====================================================
          3. DOCTORS LIST SECTION (FRONT & CENTER, WELL PLACED)
      ===================================================== */}
      <section className="doctors-section-v2" id="doctors-section">
        <Container maxWidth="xl">
          <Box className="doctors-section-header">
            <Box>
              <Box className="section-eyebrow-pill">
                <MedicalServices sx={{ fontSize: 18 }} />
                <span>{lang === "hi" ? "हमारे सत्यापित चिकित्सक" : "Verified Medical Experts"}</span>
              </Box>
              <Typography component="h2" className="doctors-main-title">
                {lang === "hi" ? "अनुभवी डॉक्टरों से परामर्श लें" : "Consult Experienced Doctors"}
              </Typography>
              <Typography className="doctors-main-desc">
                {lang === "hi"
                  ? "सभी डॉक्टर सरकार द्वारा सत्यापित हैं। अपनी भाषा बोलने वाले डॉक्टर को चुनें और तुरंत वीडियो पर बात करें।"
                  : "All doctors are background-verified. Choose based on language and hospital experience."}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="large"
              className="view-all-docs-btn"
              onClick={() => navigate("/doctors")}
              endIcon={<ArrowForward />}
            >
              {lang === "hi" ? "सभी डॉक्टर देखें (All Doctors)" : "See All Doctors"}
            </Button>
          </Box>

          {/* Specialty Filter Buttons with Visual Icons */}
          <Box className="specialty-filter-bar">
            {specialtiesList.map((spec) => {
              const isSelected = selectedSpecialty === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  className={`specialty-pill-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedSpecialty(spec.id)}
                >
                  <span className="spec-pill-icon">{spec.icon}</span>
                  <span className="spec-pill-text">
                    {lang === "hi" ? spec.labelHi : lang === "or" ? spec.labelOr : spec.label}
                  </span>
                </button>
              );
            })}
          </Box>

          {/* Grid of Doctor Cards */}
          <Grid container spacing={3} className="doctor-cards-grid">
            {filteredDoctors.slice(0, 8).map((doc) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={doc._id}>
                <Card className="accessible-doctor-card" elevation={2}>
                  {/* Doctor Image & Availability */}
                  <Box className="doc-card-image-wrap">
                    <img
                      src={doc.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80"}
                      alt={doc.name}
                      loading="lazy"
                    />
                    <Box className={`doc-avail-badge ${doc.isAvailableNow !== false ? "online" : "offline"}`}>
                      <span className="avail-dot" />
                      <span>
                        {doc.isAvailableNow !== false
                          ? (lang === "hi" ? "आज उपलब्ध" : "Available Today")
                          : (lang === "hi" ? "अपॉइंटमेंट आवश्यक" : "By Appointment")}
                      </span>
                    </Box>
                  </Box>

                  <CardContent className="doc-card-content">
                    <Typography className="doc-card-name">
                      {doc.name}
                    </Typography>

                    <Typography className="doc-card-specialty">
                      🩺 {doc.specialty}
                    </Typography>

                    <Typography className="doc-card-hospital">
                      <LocationOn fontSize="inherit" sx={{ mr: 0.5, verticalAlign: "middle", color: "var(--accent)" }} />
                      {doc.hospital || "Community Healthcare Center"}
                    </Typography>

                    <Box className="doc-card-experience">
                      ⏱️ {doc.experience} {lang === "hi" ? "वर्ष का अनुभव" : "Years Experience"}
                    </Box>

                    {/* Languages Spoken Chips */}
                    <Box className="doc-languages-box">
                      <span className="lang-label">{lang === "hi" ? "भाषाएं:" : "Speaks:"}</span>
                      {(doc.languages || ["Hindi", "English"]).map((l) => (
                        <span key={l} className="lang-tag">{l}</span>
                      ))}
                    </Box>

                    {/* Action Buttons */}
                    <Box className="doc-card-actions">
                      <Button
                        variant="contained"
                        fullWidth
                        className="doc-book-btn"
                        onClick={() => navigate(`/doctors/${doc._id}`)}
                        startIcon={<VideoCall />}
                      >
                        {lang === "hi" ? "बात करें / बुक करें" : "Book Call"}
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        className="doc-details-btn"
                        onClick={() => navigate(`/doctors/${doc._id}`)}
                      >
                        {lang === "hi" ? "विवरण देखें" : "View Profile"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* =====================================================
          4. HOW IT WORKS (SIMPLE PICTORIAL 4 STEPS)
      ===================================================== */}
      <section className="how-it-works-v2" id="how-it-works">
        <Container maxWidth="xl">
          <Box className="how-header-v2">
            <Box className="section-eyebrow-pill">
              <CheckCircle sx={{ fontSize: 18 }} />
              <span>{lang === "hi" ? "४ आसान चरण" : "4 Simple Steps"}</span>
            </Box>
            <Typography component="h2" className="how-title-v2">
              {lang === "hi" ? "डॉक्टर से मिलने का बेहद आसान तरीका" : "How to Consult a Doctor"}
            </Typography>
            <Typography className="how-desc-v2">
              {lang === "hi"
                ? "किसी भी तकनीकी ज्ञान की आवश्यकता नहीं। सिर्फ ४ आसान चरणों में इलाज शुरू करें।"
                : "No complex digital knowledge required. Get medical care in 4 easy steps."}
            </Typography>
          </Box>

          <Grid container spacing={3} className="how-steps-grid">
            {steps.map((step) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={step.number}>
                <Box className="accessible-step-card">
                  <Box className="step-number-bubble">{step.number}</Box>
                  <Box className="step-icon-large">{step.icon}</Box>
                  <Typography className="step-card-title">
                    {lang === "hi" ? step.titleHi : step.title}
                  </Typography>
                  <Typography className="step-card-text">
                    {lang === "hi" ? step.textHi : step.text}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* =====================================================
          5. EMERGENCY CALLOUT RIBBON (108 HELPLINE)
      ===================================================== */}
      <section className="emergency-ribbon-section">
        <Container maxWidth="lg">
          <Box className="emergency-ribbon-card">
            <Box className="emergency-ribbon-icon">
              <PhoneInTalk sx={{ fontSize: 48, color: "#ffffff" }} />
            </Box>
            <Box className="emergency-ribbon-info">
              <Typography variant="h5" sx={{ fontWeight: 800, color: "#ffffff" }}>
                {lang === "hi" ? "गंभीर आपातकाल? तुरंत 108 पर कॉल करें" : "Medical Emergency? Dial 108 Immediately"}
              </Typography>
              <Typography sx={{ color: "rgba(255, 255, 255, 0.9)", mt: 0.5, fontSize: "15px" }}>
                {lang === "hi"
                  ? "सरकारी 108 हेल्पलाइन पर मुफ्त एम्बुलेंस और 24 घंटे आपातकालीन सहायता मिलती है।"
                  : "Free 24/7 government emergency medical and ambulance dispatch service."}
              </Typography>
            </Box>
            <Button
              href="tel:108"
              variant="contained"
              className="emergency-ribbon-btn"
              startIcon={<PhoneInTalk />}
            >
              {lang === "hi" ? "108 पर डायल करें" : "Call 108 Now"}
            </Button>
          </Box>
        </Container>
      </section>

      {/* =====================================================
          6. COMMON QUESTIONS (FAQ WITH SIMPLE ANSWERS)
      ===================================================== */}
      <section className="faq-section-v2">
        <Container maxWidth="md">
          <Box className="faq-header-v2">
            <Typography className="section-eyebrow-pill">
              <span>{lang === "hi" ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}</span>
            </Typography>
            <Typography component="h2" className="faq-title-v2">
              {lang === "hi" ? "आपके सभी सवालों के सीधे जवाब" : "Clear Answers to Common Questions"}
            </Typography>
          </Box>

          <Box className="faq-accordion-wrap">
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                className="accessible-faq-item"
                disableGutters
                elevation={0}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "var(--primary)" }} />}
                  className="faq-summary"
                >
                  <Typography className="faq-q-text">
                    {lang === "hi" ? faq.question : faq.questionEn}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className="faq-details">
                  <Typography className="faq-a-text">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </section>
    </Box>
  );
}