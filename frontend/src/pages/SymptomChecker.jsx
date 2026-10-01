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
  Alert,
  IconButton,
  Tooltip
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RefreshIcon from "@mui/icons-material/Refresh";
import HealingIcon from "@mui/icons-material/Healing";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import { useNavigate, useLocation } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";
import "./SymptomChecker.css";

const bodyAreas = [
  { id: "head", icon: "🧠", label: "Head & Eyes", labelHi: "सिर और आंखें", labelOr: "ମୁଣ୍ଡ ଏବଂ ଆଖି" },
  { id: "throat", icon: "🫁", label: "Throat & Chest", labelHi: "गला और छाती", labelOr: "ଗଳା ଏବଂ ଛାତି" },
  { id: "stomach", icon: "🫄", label: "Stomach & Digestion", labelHi: "पेट और पाचन", labelOr: "ପେଟ ଏବଂ ହଜମ" },
  { id: "joints", icon: "🦵", label: "Joints & Bones", labelHi: "हड्डी और जोड़", labelOr: "ହାଡ ଏବଂ ଗଣ୍ଠି" },
  { id: "skin", icon: "🧴", label: "Skin & Rashes", labelHi: "त्वचा और खुजली", labelOr: "ଚର୍ମ ଏବଂ କୁଣ୍ଡାଇବା" },
  { id: "general", icon: "🌡️", label: "Fever & Weakness", labelHi: "बुखार और कमजोरी", labelOr: "ଜ୍ୱର ଏବଂ ଦୁର୍ବଳତା" }
];

const symptomsByArea = {
  head: [
    { id: "headache", icon: "🤕", label: "Severe Headache", labelHi: "तेज सिरदर्द", labelOr: "ମୁଣ୍ଡବିନ୍ଧା", specialty: "General Physician" },
    { id: "dizziness", icon: "💫", label: "Dizziness / Giddiness", labelHi: "चक्कर आना", labelOr: "ମୁଣ୍ଡ ବୁଲାଇବା", specialty: "Neurology" },
    { id: "eye_strain", icon: "👁️", label: "Eye Redness / Pain", labelHi: "आंखों में जलन / दर्द", labelOr: "ଆଖି ଲାଲ୍", specialty: "General Physician" }
  ],
  throat: [
    { id: "cough", icon: "🤧", label: "Dry Cough / Phlegm", labelHi: "खांसी / कफ", labelOr: "କାଶ", specialty: "General Physician" },
    { id: "sore_throat", icon: "🗣️", label: "Throat Pain / Tonsils", labelHi: "गले में खराश / दर्द", labelOr: "ଗଳା ଦରଜ", specialty: "ENT" },
    { id: "breathing", icon: "🫁", label: "Difficulty in Breathing", labelHi: "सांस लेने में तकलीफ", labelOr: "ନିଶ୍ୱାସ କଷ୍ଟ", specialty: "General Physician", urgent: true }
  ],
  stomach: [
    { id: "stomach_ache", icon: "🤢", label: "Stomach Pain / Cramps", labelHi: "पेट में तेज दर्द", labelOr: "ପେଟ ଯନ୍ତ୍ରଣା", specialty: "General Physician" },
    { id: "acidity", icon: "🔥", label: "Gas & Acidity", labelHi: "खट्टी डकार और गैस", labelOr: "ଗ୍ୟାସ୍ ଏବଂ ଏସିଡିଟି", specialty: "General Physician" },
    { id: "vomiting", icon: "🤮", label: "Vomiting / Loose Motion", labelHi: "उल्टी या दस्त", labelOr: "ବାନ୍ତି ଏବଂ ଝାଡ଼ା", specialty: "General Physician" }
  ],
  joints: [
    { id: "knee_pain", icon: "🦵", label: "Knee / Leg Pain", labelHi: "घुटने और पैर का दर्द", labelOr: "ଆଣ୍ଠୁ ଯନ୍ତ୍ରଣା", specialty: "Orthopedics" },
    { id: "back_pain", icon: "🦴", label: "Lower Back Pain", labelHi: "कमर और रीढ़ का दर्द", labelOr: "କମର ବିନ୍ଧା", specialty: "Orthopedics" },
    { id: "joint_stiff", icon: "🩹", label: "Morning Stiffness", labelHi: "सुबह जोड़ों में अकड़न", labelOr: "ଗଣ୍ଠି ଟାଣ", specialty: "Orthopedics" }
  ],
  skin: [
    { id: "skin_rash", icon: "🔴", label: "Red Itchy Rash", labelHi: "लाल दाने और खुजली", labelOr: "ଲାଲ୍ ଚିହ୍ନ ଏବଂ କୁଣ୍ଡାଇବା", specialty: "Dermatology" },
    { id: "skin_allergy", icon: "🧴", label: "Allergy / Swelling", labelHi: "एलर्जी या सूजन", labelOr: "ଆଲର୍ଜି", specialty: "Dermatology" }
  ],
  general: [
    { id: "fever", icon: "🌡️", label: "High Fever / Shivering", labelHi: "तेज बुखार और कंपकंपी", labelOr: "ପ୍ରବଳ ଜ୍ୱର", specialty: "General Physician" },
    { id: "body_weakness", icon: "🛌", label: "Extreme Fatigue", labelHi: "बहुत ज्यादा कमजोरी", labelOr: "ଅତ୍ୟଧିକ ଦୁର୍ବଳତା", specialty: "General Physician" }
  ]
};

export default function SymptomChecker() {
  const { lang, speak, stopSpeaking, isSpeaking } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedArea, setSelectedArea] = useState("general");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState("few_days");
  const [severity, setSeverity] = useState("mild");
  const [voiceText, setVoiceText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Check if a symptom was pre-passed from homepage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const preSymptom = params.get("symptom");
    if (preSymptom) {
      setSelectedSymptoms([preSymptom]);
      setAnalyzed(true);
    }
  }, [location.search]);

  // Toggle symptom selection
  const toggleSymptom = (symId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symId) ? prev.filter((id) => id !== symId) : [...prev, symId]
    );
    setAnalyzed(false);
  };

  // Speech Recognition for users who can't type
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === "hi" ? "hi-IN" : lang === "or" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setVoiceText(transcript);
      setIsListening(false);

      // Auto-detect common symptoms from voice
      const lower = transcript.toLowerCase();
      const detected = [];
      if (lower.includes("बुखार") || lower.includes("fever") || lower.includes("tapa")) detected.push("fever");
      if (lower.includes("सिर") || lower.includes("head") || lower.includes("matha")) detected.push("headache");
      if (lower.includes("खांसी") || lower.includes("cough") || lower.includes("kasa")) detected.push("cough");
      if (lower.includes("पेट") || lower.includes("stomach") || lower.includes("peta")) detected.push("stomach_ache");
      if (lower.includes("जोड़") || lower.includes("घुटने") || lower.includes("joint") || lower.includes("ganti")) detected.push("knee_pain");
      if (lower.includes("सांस") || lower.includes("breath")) detected.push("breathing");

      if (detected.length > 0) {
        setSelectedSymptoms((prev) => Array.from(new Set([...prev, ...detected])));
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Run analysis
  const handleAnalyze = () => {
    if (selectedSymptoms.length === 0 && !voiceText.trim()) {
      alert(lang === "hi" ? "कृपया कम से कम एक लक्षण चुनें या बोलकर बताएं।" : "Please select or speak at least one symptom.");
      return;
    }
    setAnalyzed(true);

    // Auto audio guidance for low literacy
    setTimeout(() => {
      const adviceText = getAudioAdvice();
      speak(adviceText);
    }, 400);
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setVoiceText("");
    setAnalyzed(false);
    stopSpeaking();
  };

  // Determine triage result
  const hasUrgent = selectedSymptoms.includes("breathing") || severity === "severe";
  const recommendedSpecialty = selectedSymptoms.includes("knee_pain") || selectedSymptoms.includes("back_pain")
    ? "Orthopedics"
    : selectedSymptoms.includes("skin_rash") || selectedSymptoms.includes("skin_allergy")
    ? "Dermatology"
    : selectedSymptoms.includes("sore_throat")
    ? "ENT"
    : selectedSymptoms.includes("dizziness")
    ? "Neurology"
    : "General Physician";

  const getAudioAdvice = () => {
    if (hasUrgent) {
      return lang === "hi"
        ? "सावधान! आपके लक्षण गंभीर हो सकते हैं। कृपया तुरंत नजदीकी अस्पताल जाएं या 108 नंबर पर आपातकालीन कॉल करें।"
        : "Warning! Your symptoms require urgent attention. Please visit the nearest hospital immediately or call emergency 108.";
    }
    return lang === "hi"
      ? `आपकी समस्या के अनुसार, आपको ${recommendedSpecialty} डॉक्टर से परामर्श लेना चाहिए। भरपूर पानी पिएं और आराम करें।`
      : `Based on your symptoms, we advise consulting a ${recommendedSpecialty}. Stay hydrated and take proper rest.`;
  };

  return (
    <Box className="symptom-page">
      {/* Header Banner */}
      <Box className="symptom-hero">
        <Container maxWidth="lg">
          <Box className="symptom-hero-content">
            <Box className="symptom-badge">
              <HealingIcon sx={{ fontSize: 20 }} />
              <span>{lang === "hi" ? "आसान व निःशुल्क जांच" : lang === "or" ? "ମାଗଣା ପରୀକ୍ଷା" : "Easy & Free Self-Check"}</span>
            </Box>

            <Typography component="h1" className="symptom-page-title">
              {lang === "hi" ? "क्या तकलीफ है? 1 मिनट में समझें" : lang === "or" ? "କଣ ଅସୁବିଧା ହେଉଛି? ପରୀକ୍ଷା କରନ୍ତୁ" : "Check Your Symptoms Simply"}
            </Typography>

            <Typography className="symptom-page-subtitle">
              {lang === "hi"
                ? "बिना पढ़े भी समझें। शरीर का हिस्सा चुनें या माइक दबाकर बोलें। हम बताएंगे किस डॉक्टर से मिलना सही रहेगा।"
                : "Designed for everyone. Choose body area, tap your symptoms, or just speak into the microphone."}
            </Typography>

            {/* Read Aloud Button */}
            <Button
              variant="outlined"
              className={`symptom-audio-btn ${isSpeaking ? "active-audio" : ""}`}
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  speak(
                    lang === "hi"
                      ? "लक्षण जांचने के लिए, पहले नीचे दिए गए शरीर के हिस्सों में से चुनें, या माइक का बटन दबाकर अपनी बीमारी बोलकर बताएं।"
                      : "To check symptoms, select a body area below, or tap the microphone button to speak your symptoms clearly."
                  );
                }
              }}
              startIcon={isSpeaking ? <StopCircleIcon /> : <VolumeUpIcon />}
            >
              {isSpeaking ? (lang === "hi" ? "आवाज़ रोकें" : "Stop Audio") : (lang === "hi" ? "🔊 निर्देश सुनें" : "🔊 Listen Instructions")}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* =========================================================
              LEFT COLUMN: SYMPTOM SELECTION / VOICE
          ========================================================= */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* Step 1: Voice Input Card */}
            <Card className="symptom-card voice-card" elevation={2}>
              <CardContent>
                <Box className="card-section-header">
                  <span className="step-tag">Step 1</span>
                  <Typography variant="h6" className="card-title">
                    {lang === "hi" ? "बोलकर बताएं (Speak Symptoms)" : "Speak your symptoms"}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lang === "hi"
                    ? "टाइप करने की जरूरत नहीं है। माइक पर दबाएं और बोलें:"
                    : "No typing required. Tap the mic and speak naturally:"}
                </Typography>

                <Box className="voice-action-box">
                  <button
                    type="button"
                    className={`mic-button ${isListening ? "is-recording" : ""}`}
                    onClick={handleVoiceInput}
                    aria-label="Toggle voice input"
                  >
                    {isListening ? <MicOffIcon sx={{ fontSize: 36 }} /> : <MicIcon sx={{ fontSize: 36 }} />}
                  </button>
                  <Box className="mic-status-text">
                    <strong>
                      {isListening
                        ? (lang === "hi" ? "🎙️ सुन रहे हैं... बोलिए!" : "🎙️ Listening... speak now!")
                        : (lang === "hi" ? "माइक दबाकर बोलें" : "Tap Mic & Speak")}
                    </strong>
                    <span>
                      {isListening
                        ? (lang === "hi" ? "उदाहरण: 'मुझे 2 दिन से सिरदर्द और बुखार है'" : "e.g., 'I have fever and body pain'")
                        : (lang === "hi" ? "हिंदी, अंग्रेजी में बोल सकते हैं" : "Speak in Hindi, Odia, or English")}
                    </span>
                  </Box>
                </Box>

                {voiceText && (
                  <Box className="voice-transcript-bubble">
                    <strong>{lang === "hi" ? "आपने कहा:" : "You said:"}</strong> "{voiceText}"
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Body Area Selector */}
            <Card className="symptom-card body-area-card" elevation={2}>
              <CardContent>
                <Box className="card-section-header">
                  <span className="step-tag">Step 2</span>
                  <Typography variant="h6" className="card-title">
                    {lang === "hi" ? "तकलीफ कहां हो रही है? (Choose Area)" : "Where does it hurt?"}
                  </Typography>
                </Box>

                <Grid container spacing={1.5} className="body-areas-grid">
                  {bodyAreas.map((area) => {
                    const isSelected = selectedArea === area.id;
                    return (
                      <Grid size={{ xs: 6, sm: 4 }} key={area.id}>
                        <button
                          type="button"
                          className={`body-area-btn ${isSelected ? "selected" : ""}`}
                          onClick={() => setSelectedArea(area.id)}
                        >
                          <span className="area-icon">{area.icon}</span>
                          <span className="area-title">{lang === "hi" ? area.labelHi : lang === "or" ? area.labelOr : area.label}</span>
                        </button>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Specific Symptoms in Selected Area */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "var(--primary)" }}>
                    {lang === "hi" ? "इनमें से अपना लक्षण चुनें:" : "Select your matching symptom:"}
                  </Typography>

                  <Box className="symptom-chips-container">
                    {(symptomsByArea[selectedArea] || []).map((sym) => {
                      const isChecked = selectedSymptoms.includes(sym.id);
                      return (
                        <button
                          key={sym.id}
                          type="button"
                          className={`symptom-chip-btn ${isChecked ? "checked" : ""}`}
                          onClick={() => toggleSymptom(sym.id)}
                        >
                          <span className="sym-icon">{sym.icon}</span>
                          <span className="sym-text">{lang === "hi" ? sym.labelHi : lang === "or" ? sym.labelOr : sym.label}</span>
                          {isChecked && <CheckCircleIcon fontSize="small" className="sym-check" />}
                        </button>
                      );
                    })}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Step 3: Duration & Severity */}
            <Card className="symptom-card options-card" elevation={2}>
              <CardContent>
                <Box className="card-section-header">
                  <span className="step-tag">Step 3</span>
                  <Typography variant="h6" className="card-title">
                    {lang === "hi" ? "कब से और कितना दर्द है?" : "Since when and how severe?"}
                  </Typography>
                </Box>

                {/* Duration */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {lang === "hi" ? "कितने दिनों से है?" : "How long has it been?"}
                  </Typography>
                  <Box className="pill-selector">
                    <button
                      type="button"
                      className={`pill-btn ${duration === "today" ? "active" : ""}`}
                      onClick={() => setDuration("today")}
                    >
                      ⚡ {lang === "hi" ? "आज से (Today)" : "Today"}
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${duration === "few_days" ? "active" : ""}`}
                      onClick={() => setDuration("few_days")}
                    >
                      📅 {lang === "hi" ? "2-3 दिन (2-3 Days)" : "2-3 Days"}
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${duration === "week" ? "active" : ""}`}
                      onClick={() => setDuration("week")}
                    >
                      🗓️ {lang === "hi" ? "1 हफ्ते से अधिक (1+ Week)" : "1+ Week"}
                    </button>
                  </Box>
                </Box>

                {/* Severity */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    {lang === "hi" ? "तकलीफ कितनी है?" : "Severity level:"}
                  </Typography>
                  <Box className="pill-selector">
                    <button
                      type="button"
                      className={`pill-btn severity-mild ${severity === "mild" ? "active" : ""}`}
                      onClick={() => setSeverity("mild")}
                    >
                      🟢 {lang === "hi" ? "हल्का दर्द (Mild)" : "Mild"}
                    </button>
                    <button
                      type="button"
                      className={`pill-btn severity-medium ${severity === "medium" ? "active" : ""}`}
                      onClick={() => setSeverity("medium")}
                    >
                      🟡 {lang === "hi" ? "मध्यम (Moderate)" : "Moderate"}
                    </button>
                    <button
                      type="button"
                      className={`pill-btn severity-severe ${severity === "severe" ? "active" : ""}`}
                      onClick={() => setSeverity("severe")}
                    >
                      🔴 {lang === "hi" ? "बहुत तेज / असहनीय (Severe)" : "Severe"}
                    </button>
                  </Box>
                </Box>

                {/* Big Action Button */}
                <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    className="symptom-submit-btn"
                    onClick={handleAnalyze}
                    endIcon={<ArrowForwardIcon />}
                  >
                    {lang === "hi" ? "जांच परिणाम देखें (Check Result)" : "Check Health Result"}
                  </Button>
                  {(selectedSymptoms.length > 0 || voiceText) && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleReset}
                      title="Reset selections"
                    >
                      <RefreshIcon />
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* =========================================================
              RIGHT COLUMN: RESULT & DOCTOR RECOMMENDATION
          ========================================================= */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box className="symptom-result-sticky">
              {analyzed ? (
                <Card className={`symptom-result-card ${hasUrgent ? "urgent-card" : "safe-card"}`} elevation={3}>
                  <CardContent>
                    {/* Urgency Badge */}
                    <Box className="result-header">
                      {hasUrgent ? (
                        <Box className="urgency-badge red">
                          <WarningAmberIcon />
                          <span>{lang === "hi" ? "तुरंत ध्यान दें (High Attention)" : "High Attention Needed"}</span>
                        </Box>
                      ) : (
                        <Box className="urgency-badge green">
                          <CheckCircleIcon />
                          <span>{lang === "hi" ? "सामान्य देखभाल (Routine Care)" : "Routine Medical Care"}</span>
                        </Box>
                      )}

                      {/* Read aloud result */}
                      <IconButton
                        onClick={() => speak(getAudioAdvice())}
                        color="primary"
                        aria-label="Read advice aloud"
                        title="Listen to advice"
                      >
                        <VolumeUpIcon />
                      </IconButton>
                    </Box>

                    {/* Summary */}
                    <Typography variant="h5" className="result-title" sx={{ mt: 2 }}>
                      {hasUrgent
                        ? (lang === "hi" ? "चिकित्सक से तत्काल संपर्क आवश्यक" : "Urgent Doctor Consultation Advised")
                        : (lang === "hi" ? "प्राथमिक स्वास्थ्य सलाह" : "Primary Health Assessment")}
                    </Typography>

                    <Typography className="result-desc">
                      {hasUrgent
                        ? (lang === "hi"
                          ? "आपके लक्षणों में सांस की तकलीफ या तेज दर्द दर्ज हुआ है। घर पर इंतजार न करें।"
                          : "Your symptoms indicate potential high severity or breathing difficulty. Do not delay care.")
                        : (lang === "hi"
                          ? `आपके लक्षणों के आधार पर, यह मौसमी या सामान्य स्थिति हो सकती है। सही डॉक्टर से परामर्श लेकर तुरंत राहत पाएं।`
                          : `Based on your symptoms, early consultation helps quick recovery. We recommend speaking with a qualified specialist.`)}
                    </Typography>

                    {/* Emergency Call Box if urgent */}
                    {hasUrgent && (
                      <Box className="emergency-callout">
                        <PhoneInTalkIcon sx={{ fontSize: 32, color: "#dc2626" }} />
                        <Box>
                          <strong>{lang === "hi" ? "आपातकालीन नंबर: 108" : "Emergency Helpline: 108"}</strong>
                          <Typography variant="caption" display="block">
                            {lang === "hi" ? "मुफ्त एम्बुलेंस सेवा के लिए तुरंत कॉल करें" : "Toll-free emergency medical response"}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Recommended Doctor Card */}
                    <Box className="recommended-doctor-card">
                      <Box className="rec-doc-header">
                        <MedicalServicesIcon sx={{ color: "var(--secondary)" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {lang === "hi" ? "सलाहकार विशेषज्ञ:" : "Recommended Doctor Specialist:"}
                        </Typography>
                      </Box>

                      <Typography variant="h6" className="rec-specialty-name">
                        {recommendedSpecialty}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {lang === "hi"
                          ? "हमारे पास इस विशेषज्ञता के सत्यापित डॉक्टर ऑनलाइन उपलब्ध हैं।"
                          : "Verified doctors in this specialty are ready for video consultation."}
                      </Typography>

                      <Button
                        variant="contained"
                        fullWidth
                        className="connect-doc-btn"
                        onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(recommendedSpecialty)}`)}
                        startIcon={<LocalHospitalIcon />}
                      >
                        {lang === "hi"
                          ? `डॉक्टर खोजें (${recommendedSpecialty})`
                          : `Find ${recommendedSpecialty} Doctors`}
                      </Button>
                    </Box>

                    {/* Home Care Tips */}
                    <Box className="home-care-tips">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        💡 {lang === "hi" ? "घरेलू सावधानी और सुझाव:" : "Immediate Home Care Tips:"}
                      </Typography>
                      <ul>
                        <li>{lang === "hi" ? "पर्याप्त मात्रा में गुनगुना पानी पिएं।" : "Drink sufficient clean, warm water."}</li>
                        <li>{lang === "hi" ? "भारी व तला-भुना भोजन न करें।" : "Eat light, easily digestible food."}</li>
                        <li>{lang === "hi" ? "बिना डॉक्टर की सलाह के कोई तेज एंटीबायोटिक न लें।" : "Do not take strong medicines without prescription."}</li>
                      </ul>
                    </Box>
                  </CardContent>
                </Card>
              ) : (
                /* Default empty state card */
                <Card className="symptom-result-card placeholder-card" elevation={1}>
                  <CardContent sx={{ textAlign: "center", py: 5 }}>
                    <Box className="placeholder-icon">🩺</Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "var(--primary)" }}>
                      {lang === "hi" ? "जांच परिणाम यहां दिखेगा" : "Your Health Assessment"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: "auto", mb: 3 }}>
                      {lang === "hi"
                        ? "बाएं तरफ से अपने लक्षण चुनें या माइक पर बोलें, फिर 'जांच परिणाम देखें' दबाएं।"
                        : "Select your symptoms on the left or tap the microphone to speak. Your results and doctor recommendations will appear here."}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={handleVoiceInput}
                      startIcon={<MicIcon />}
                    >
                      {lang === "hi" ? "माइक से शुरू करें" : "Start With Voice"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
