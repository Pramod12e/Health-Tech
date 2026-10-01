import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  IconButton,
  Alert,
  Avatar
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import PrintIcon from "@mui/icons-material/Print";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MedicationIcon from "@mui/icons-material/Medication";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import { getPatientConsultations } from "../api/consultationApi";
import "./PatientHistory.css";

export default function PatientHistory() {
  const { user } = useAuth();
  const { lang, speak, stopSpeaking, isSpeaking } = useAccessibility();
  const navigate = useNavigate();

  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsultationId, setActiveConsultationId] = useState(null);

  useEffect(() => {
    getPatientConsultations()
      .then((data) => {
        setConsultations(data);
        if (data.length > 0) {
          setActiveConsultationId(data[0]._id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeRecord = consultations.find((c) => c._id === activeConsultationId) || consultations[0];

  // Read prescription aloud in simple speech
  const handleReadPrescription = (record) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!record) return;

    const docName = record.doctor?.name || "डॉक्टर";
    const condition = record.aiSuggestion?.possibleCondition || "सामान्य परामर्श";
    const medicinesList = record.prescription?.medicines?.map(m => `${m.name}, ${m.dosage}`).join("। ") || "कोई दवा दर्ज नहीं है";
    const advice = record.prescription?.notes || "पर्याप्त आराम करें और पानी पिएं।";

    const speechText = lang === "hi"
      ? `${docName} द्वारा परामर्श। तारीख: ${record.date}। बीमारी: ${condition}। दवाइयां इस प्रकार हैं: ${medicinesList}। डॉक्टर की सलाह: ${advice}`
      : `Consultation with ${docName}. Date: ${record.date}. Condition: ${condition}. Medicines: ${medicinesList}. Doctor advice: ${advice}`;

    speak(speechText);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box className="history-page">
      {/* Top Banner */}
      <Box className="history-hero">
        <Container maxWidth="lg">
          <Box className="history-hero-content">
            <Box className="history-badge">
              <AssignmentIcon sx={{ fontSize: 20 }} />
              <span>{lang === "hi" ? "स्वास्थ्य रिकॉर्ड व पर्चियां" : lang === "or" ? "ସ୍ୱାସ୍ଥ୍ୟ ରେକର୍ଡ" : "Digital Health Records"}</span>
            </Box>

            <Typography component="h1" className="history-page-title">
              {lang === "hi" ? "पुरानी पर्चियां और इलाज का इतिहास" : lang === "or" ? "ପୂର୍ବ ପ୍ରେସକ୍ରିପସନ୍ ଏବଂ ରେକର୍ଡ" : "Patient History & Prescriptions"}
            </Typography>

            <Typography className="history-page-subtitle">
              {lang === "hi"
                ? "आपकी सभी पुरानी दवाइयां, डॉक्टर की सलाह और जांच रिपोर्ट एक सुरक्षित जगह पर। बिना पढ़े समझने के लिए आवाज़ में भी सुन सकते हैं।"
                : "Easily view your past doctor consultations, medicine timings with visual icons, and doctor advice anytime."}
            </Typography>

            {/* Read aloud guide button */}
            <Button
              variant="outlined"
              className={`history-audio-btn ${isSpeaking ? "active-audio" : ""}`}
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speak(
                    lang === "hi"
                      ? "यह आपका स्वास्थ्य इतिहास पृष्ठ है। यहां आपकी पिछली सभी डॉक्टर मुलाकातों और दवाइयों की पर्चियां मौजूद हैं। किसी भी पर्ची को चुनने पर आप दवा खाने का सही समय देख सकते हैं।"
                      : "This is your patient history page. You can view all your past doctor visits and digital prescriptions with visual dosage timings."
                  );
                }
              }}
              startIcon={isSpeaking ? <StopCircleIcon /> : <VolumeUpIcon />}
            >
              {isSpeaking ? (lang === "hi" ? "आवाज़ रोकें" : "Stop Audio") : (lang === "hi" ? "🔊 पेज का विवरण सुनें" : "🔊 Listen Page Guide")}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Container */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Guest / Demo Notice if user not logged in */}
        {!user && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
            <strong>{lang === "hi" ? "डेमो रिकॉर्ड दृश्य:" : "Demo Records View:"}</strong>{" "}
            {lang === "hi"
              ? "आप अभी डेमो पर्चियां देख रहे हैं। अपने व्यक्तिगत स्वास्थ्य रिकॉर्ड सुरक्षित रखने और नए परामर्श जोड़ने के लिए कृपया लॉगिन करें।"
              : "Showing sample family health records. Please login to save and view your personal consultations securely."}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* =========================================================
              LEFT COLUMN: LIST OF VISITS / DATES
          ========================================================= */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box className="visits-sidebar-header">
              <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--primary)" }}>
                {lang === "hi" ? "पिछली मुलाकातें (Past Visits)" : "Consultation Visits"}
              </Typography>
              <Chip
                label={`${consultations.length} ${lang === "hi" ? "रिकॉर्ड" : "Records"}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            <Box className="visits-list">
              {consultations.map((item, index) => {
                const isSelected = item._id === activeRecord?._id;
                return (
                  <button
                    key={item._id}
                    type="button"
                    className={`visit-item-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => {
                      setActiveConsultationId(item._id);
                      stopSpeaking();
                    }}
                  >
                    <Box className="visit-item-avatar">
                      {item.doctor?.image ? (
                        <img src={item.doctor.image} alt={item.doctor.name} />
                      ) : (
                        <LocalHospitalIcon />
                      )}
                    </Box>

                    <Box className="visit-item-info">
                      <Typography className="visit-doc-name">
                        {item.doctor?.name || "Doctor"}
                      </Typography>
                      <Typography className="visit-specialty">
                        {item.doctor?.specialty || "Specialist"}
                      </Typography>
                      <Box className="visit-meta">
                        <span><CalendarTodayIcon fontSize="inherit" /> {item.date}</span>
                        <span><AccessTimeIcon fontSize="inherit" /> {item.slot}</span>
                      </Box>
                    </Box>
                  </button>
                );
              })}
            </Box>

            {/* Quick Action: Book New Doctor */}
            <Box className="history-cta-card">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                {lang === "hi" ? "नया परामर्श चाहिए?" : "Need a new consultation?"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {lang === "hi" ? "सत्यापित डॉक्टरों से तुरंत वीडियो कॉल पर बात करें।" : "Connect with verified doctors anytime."}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/doctors")}
                endIcon={<ArrowForwardIcon />}
                className="cta-book-btn"
              >
                {lang === "hi" ? "डॉक्टर से मिलें" : "Find Doctor"}
              </Button>
            </Box>
          </Grid>

          {/* =========================================================
              RIGHT COLUMN: DETAILED PRESCRIPTION & NOTES
          ========================================================= */}
          <Grid size={{ xs: 12, md: 8 }}>
            {activeRecord ? (
              <Card className="prescription-detail-card" elevation={3}>
                <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                  {/* Top Bar of Prescription */}
                  <Box className="prescription-topbar">
                    <Box>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={lang === "hi" ? "सत्यापित पर्ची (Verified Prescription)" : "Verified Medical Record"}
                        color="success"
                        variant="filled"
                        sx={{ fontWeight: 700, mb: 1 }}
                      />
                      <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--primary)" }}>
                        {activeRecord.doctor?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activeRecord.doctor?.specialty} • {activeRecord.doctor?.hospital}
                      </Typography>
                    </Box>

                    {/* Actions: Audio Readout & Print */}
                    <Box className="presc-actions">
                      <Button
                        variant="contained"
                        className={`action-audio-btn ${isSpeaking ? "is-speaking" : ""}`}
                        onClick={() => handleReadPrescription(activeRecord)}
                        startIcon={isSpeaking ? <StopCircleIcon /> : <VolumeUpIcon />}
                      >
                        {isSpeaking ? (lang === "hi" ? "आवाज़ रोकें" : "Stop") : (lang === "hi" ? "🔊 पर्ची सुनें" : "🔊 Listen")}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handlePrint}
                        startIcon={<PrintIcon />}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                      >
                        {lang === "hi" ? "प्रिंट / सेव" : "Print / PDF"}
                      </Button>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Visit Summary Grid */}
                  <Grid container spacing={2} className="presc-meta-grid">
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <span className="meta-label">{lang === "hi" ? "तारीख:" : "Date:"}</span>
                      <strong className="meta-val">{activeRecord.date}</strong>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <span className="meta-label">{lang === "hi" ? "समय:" : "Time:"}</span>
                      <strong className="meta-val">{activeRecord.slot}</strong>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <span className="meta-label">{lang === "hi" ? "पहचानी गई बीमारी:" : "Diagnosed Condition:"}</span>
                      <strong className="meta-val highlight-condition">
                        {activeRecord.aiSuggestion?.possibleCondition || "General Consultation"}
                      </strong>
                    </Grid>
                  </Grid>

                  {/* Patient Symptoms */}
                  <Box className="presc-box symptoms-box">
                    <Typography variant="subtitle2" className="box-header-title">
                      📝 {lang === "hi" ? "मरीज के लक्षण (Reported Symptoms):" : "Reported Symptoms:"}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#334155" }}>
                      {activeRecord.symptoms}
                    </Typography>
                  </Box>

                  {/* Visual Medicine Timing Guide (Key for Low Literacy) */}
                  <Box className="medicines-section">
                    <Typography variant="h6" className="medicines-heading">
                      <MedicationIcon sx={{ color: "var(--secondary)", mr: 1, verticalAlign: "middle" }} />
                      {lang === "hi" ? "दवाइयां और खाने का समय (Medicines & Schedule)" : "Prescribed Medicines & Timings"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {lang === "hi"
                        ? "सूरज और चांद के चिन्ह देखकर समझें कि कौन सी दवा कब खानी है:"
                        : "Visual icons indicate morning, afternoon, and night dosages clearly:"}
                    </Typography>

                    <Box className="medicines-table-wrap">
                      {(activeRecord.prescription?.medicines || []).map((med, idx) => (
                        <Box className="medicine-row-card" key={idx}>
                          <Box className="med-info">
                            <Box className="med-number">{idx + 1}</Box>
                            <Box>
                              <Typography className="med-name">{med.name}</Typography>
                              <Typography className="med-duration">
                                ⏱️ {lang === "hi" ? "अवधि:" : "Duration:"} {med.duration}
                              </Typography>
                              <Typography className="med-dosage-note">{med.dosage}</Typography>
                            </Box>
                          </Box>

                          {/* Visual Timing Badges */}
                          <Box className="med-timing-badges">
                            <span className={`timing-chip morning ${med.timing?.morning !== false ? "active" : ""}`}>
                              <WbSunnyIcon fontSize="inherit" />
                              <span>{lang === "hi" ? "सुबह" : "Morning"}</span>
                            </span>
                            <span className={`timing-chip afternoon ${med.timing?.afternoon ? "active" : ""}`}>
                              <WbSunnyIcon fontSize="inherit" />
                              <span>{lang === "hi" ? "दोपहर" : "Noon"}</span>
                            </span>
                            <span className={`timing-chip night ${med.timing?.night !== false ? "active" : ""}`}>
                              <BedtimeIcon fontSize="inherit" />
                              <span>{lang === "hi" ? "रात" : "Night"}</span>
                            </span>
                            <span className="timing-chip food-rule active">
                              <RestaurantIcon fontSize="inherit" />
                              <span>{lang === "hi" ? "भोजन बाद" : "After Food"}</span>
                            </span>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Doctor Notes & Advice */}
                  <Box className="presc-box doctor-notes-box">
                    <Typography variant="subtitle2" className="box-header-title">
                      🩺 {lang === "hi" ? "डॉक्टर की विशेष सलाह (Doctor's Advice):" : "Doctor's Advice & Care:"}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#064e3b", fontWeight: 500 }}>
                      {activeRecord.prescription?.notes || "Take proper rest and stay hydrated."}
                    </Typography>
                  </Box>

                  {/* Follow-up Alert if needed */}
                  {activeRecord.followUpNeeded && (
                    <Box className="follow-up-banner">
                      <NotificationsActiveIcon sx={{ color: "#d97706", fontSize: 28 }} />
                      <Box>
                        <strong style={{ color: "#92400e" }}>
                          {lang === "hi" ? "फॉलो-अप परामर्श आवश्यक है" : "Follow-up Consultation Advised"}
                        </strong>
                        <Typography variant="body2" sx={{ color: "#b45309" }}>
                          {lang === "hi"
                            ? "कृप्या सुधार न होने पर 10-15 दिनों के भीतर डॉक्टर से दोबारा संपर्क करें।"
                            : "Please reconnect with the doctor after completion of medicine course."}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Box className="history-empty-state">
                <Typography variant="h6">
                  {lang === "hi" ? "कोई परामर्श रिकॉर्ड उपलब्ध नहीं है।" : "No consultation records found."}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
