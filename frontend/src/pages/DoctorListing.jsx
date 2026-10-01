import { useEffect, useState } from "react";
import { getDoctors } from "../api/doctorApi";
import DoctorCard from "../components/DoctorCard";
import {
  Grid,
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import { useLocation } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";

const specialtiesList = [
  { id: "all", label: "All Doctors", labelHi: "सभी डॉक्टर", icon: "👨‍⚕️" },
  { id: "General Physician", label: "General Physician", labelHi: "सामान्य रोग", icon: "🩺" },
  { id: "Pediatrics", label: "Children (Pediatrics)", labelHi: "शिशु रोग", icon: "👶" },
  { id: "Orthopedics", label: "Bones & Joints", labelHi: "हड्डी व जोड़", icon: "🦴" },
  { id: "Gynecology", label: "Women's Health", labelHi: "महिला रोग", icon: "🌸" },
  { id: "Neurology", label: "Nerves & Brain", labelHi: "नसें व सिरदर्द", icon: "🧠" },
  { id: "ENT", label: "Ear, Nose, Throat", labelHi: "कान, नाक, गला", icon: "👂" }
];

function DoctorListing() {
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const { lang, speak, stopSpeaking, isSpeaking } = useAccessibility();

  // Read URL query param e.g. /doctors?specialty=Orthopedics
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const spec = params.get("specialty");
    if (spec) {
      setSelectedSpecialty(spec);
    }
  }, [location.search]);

  useEffect(() => {
    getDoctors()
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setDoctors(res.data);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === "all" || doc.specialty?.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesSearch = !searchQuery.trim() ||
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpec && matchesSearch;
  });

  const handleAudioGuide = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak(
        lang === "hi"
          ? `डॉक्टर सूची। कुल ${filteredDoctors.length} डॉक्टर उपलब्ध हैं। अपनी पसंद के डॉक्टर की फोटो देखकर परामर्श के लिए बुक करें बटन दबाएं।`
          : `Doctor directory. There are ${filteredDoctors.length} specialists available. Tap on any doctor card to consult or book appointment.`
      );
    }
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh", pb: 8 }}>
      {/* Top Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #073f52 0%, #0a566f 60%, #059669 100%)",
          color: "#ffffff",
          py: 5
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 0.6, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 999, mb: 2 }}>
            <MedicalServicesIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {lang === "hi" ? "सत्यापित चिकित्सक सूची" : "Verified Doctor Directory"}
            </Typography>
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, fontSize: { xs: "2rem", md: "2.5rem" } }}>
            {lang === "hi" ? "विशेषज्ञ डॉक्टर खोजें" : "Find Your Doctor"}
          </Typography>

          <Typography sx={{ color: "#e2e8f0", maxWidth: 650, mb: 3 }}>
            {lang === "hi"
              ? "अपनी भाषा और समस्या के अनुसार डॉक्टर चुनें। तुरंत वीडियो या फोन कॉल पर परामर्श लें।"
              : "Search doctors by specialty, language, or hospital. Connect instantly via secure video consultation."}
          </Typography>

          <Button
            variant="outlined"
            onClick={handleAudioGuide}
            startIcon={isSpeaking ? <StopCircleIcon /> : <VolumeUpIcon />}
            sx={{
              color: "#ffffff",
              borderColor: "rgba(255,255,255,0.6)",
              bgcolor: isSpeaking ? "#ffffff" : "rgba(255,255,255,0.15)",
              color: isSpeaking ? "#073f52" : "#ffffff",
              borderRadius: 3,
              fontWeight: 700,
              textTransform: "none",
              px: 2.5
            }}
          >
            {isSpeaking ? (lang === "hi" ? "आवाज़ रोकें" : "Stop Audio") : (lang === "hi" ? "🔊 सूची सुनें" : "🔊 Listen Guide")}
          </Button>
        </Container>
      </Box>

      {/* Main Content Area */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Search & Filter Bar */}
        <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Search Box */}
          <TextField
            fullWidth
            placeholder={lang === "hi" ? "डॉक्टर का नाम, अस्पताल या बीमारी खोजें..." : "Search by doctor name, hospital, or condition..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "var(--accent)" }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: "#ffffff",
                borderRadius: 3,
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
              }
            }}
          />

          {/* Specialty Filter Horizontal Scroll */}
          <Box sx={{ display: "flex", gap: 1.2, overflowX: "auto", pb: 1, scrollbarWidth: "thin" }}>
            {specialtiesList.map((spec) => {
              const isSelected = selectedSpecialty === spec.id;
              return (
                <Button
                  key={spec.id}
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => setSelectedSpecialty(spec.id)}
                  sx={{
                    whiteSpace: "nowrap",
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.2,
                    py: 1,
                    bgcolor: isSelected ? "#073f52" : "#ffffff",
                    borderColor: isSelected ? "#073f52" : "#cbd5e1",
                    color: isSelected ? "#ffffff" : "#1e293b",
                    "&:hover": {
                      bgcolor: isSelected ? "#052f3d" : "#f0fdfa",
                      borderColor: "#0b8fa3"
                    }
                  }}
                >
                  <span style={{ marginRight: 6 }}>{spec.icon}</span>
                  {lang === "hi" ? spec.labelHi : spec.label}
                </Button>
              );
            })}
          </Box>
        </Box>

        {/* Results Count */}
        <Typography variant="body2" sx={{ color: "#64748b", mb: 3, fontWeight: 600 }}>
          {lang === "hi" ? `दिखाए जा रहे हैं: ${filteredDoctors.length} डॉक्टर` : `Showing ${filteredDoctors.length} doctors`}
        </Typography>

        {/* Doctor Grid */}
        <Grid container spacing={3}>
          {filteredDoctors.map((doc) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={doc._id}>
              <DoctorCard doctor={doc} />
            </Grid>
          ))}
        </Grid>

        {filteredDoctors.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              {lang === "hi" ? "कोई डॉक्टर नहीं मिला। कृपया दूसरा फिल्टर चुनें।" : "No doctors found matching your criteria."}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default DoctorListing;