import { Box, Button, Chip, Typography, IconButton } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import FormatSizeIcon from "@mui/icons-material/FormatSize";
import TranslateIcon from "@mui/icons-material/Translate";
import { useAccessibility } from "../context/AccessibilityContext";

export default function AccessibilityBar() {
  const { lang, setLang, fontSize, setFontSize, speak, stopSpeaking, isSpeaking, t } = useAccessibility();

  const handleAudioGuide = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      if (lang === "hi") {
        speak("टेलीहेल्थ ब्रिज में आपका स्वागत है। यहां आप डॉक्टर खोज सकते हैं, अपनी बीमारी के लक्षण जांच सकते हैं, और अपनी पुरानी पर्ची देख सकते हैं। किसी भी समय सहायता के लिए 108 पर संपर्क करें।");
      } else if (lang === "or") {
        speak("ଟେଲିହେଲ୍ଥ ବ୍ରିଜ୍ କୁ ସ୍ୱାଗତ। ଏଠାରେ ଆପଣ ଡାକ୍ତର ଖୋଜିପାରିବେ, ରୋଗ ପରୀକ୍ଷା କରିପାରିବେ ଏବଂ ପୂର୍ବ ପ୍ରେସକ୍ରିପସନ୍ ଦେଖିପାରିବେ।");
      } else {
        speak("Welcome to Telehealth Bridge. Here you can find doctors, check your symptoms, and view your patient history and prescriptions. For emergency dial 108.");
      }
    }
  };

  return (
    <Box className="accessibility-bar" role="region" aria-label="Accessibility and Quick Help">
      <Box className="accessibility-bar-inner">
        {/* Left: Emergency Helpline */}
        <Box className="access-emergency-wrap">
          <Button
            href="tel:108"
            className="access-emergency-btn"
            startIcon={<PhoneInTalkIcon className="emergency-ring-icon" />}
            size="small"
          >
            <strong>108</strong>
            <span>{lang === "hi" ? "आपातकालीन नंबर" : lang === "or" ? "ଜରୁରୀ କଲ୍" : "Emergency Helpline"}</span>
          </Button>
        </Box>

        {/* Center: Audio Guide Assistance */}
        <Box className="access-audio-wrap">
          <Button
            onClick={handleAudioGuide}
            className={`access-audio-btn ${isSpeaking ? "is-speaking" : ""}`}
            startIcon={isSpeaking ? <StopCircleIcon /> : <VolumeUpIcon />}
            size="small"
          >
            {isSpeaking
              ? t("stopAudio", "Stop Audio")
              : (lang === "hi" ? "🔊 आवाज़ में सुनें (Audio Guide)" : lang === "or" ? "🔊 ଶୁଣନ୍ତୁ (Audio Guide)" : "🔊 Listen to Guide")}
          </Button>
        </Box>

        {/* Right: Language Switcher and Font Size */}
        <Box className="access-controls-right">
          {/* Language Selector */}
          <Box className="access-lang-group" aria-label="Select Language">
            <TranslateIcon fontSize="small" sx={{ color: "var(--accent)", display: { xs: "none", sm: "block" } }} />
            <button
              type="button"
              className={`access-lang-chip ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
              title="English"
            >
              English
            </button>
            <button
              type="button"
              className={`access-lang-chip ${lang === "hi" ? "active" : ""}`}
              onClick={() => setLang("hi")}
              title="हिंदी"
            >
              हिन्दी
            </button>
            <button
              type="button"
              className={`access-lang-chip ${lang === "or" ? "active" : ""}`}
              onClick={() => setLang("or")}
              title="ଓଡ଼ିଆ"
            >
              ଓଡ଼ିଆ
            </button>
          </Box>

          {/* Font Size Adjuster */}
          <Box className="access-font-group" sx={{ display: { xs: "none", md: "flex" } }}>
            <span className="access-font-label">
              <FormatSizeIcon fontSize="inherit" sx={{ verticalAlign: "middle", mr: 0.5 }} />
              Size:
            </span>
            <button
              type="button"
              className={`access-size-btn ${fontSize === "normal" ? "active" : ""}`}
              onClick={() => setFontSize("normal")}
              title="Normal text size"
            >
              A
            </button>
            <button
              type="button"
              className={`access-size-btn ${fontSize === "large" ? "active" : ""}`}
              onClick={() => setFontSize("large")}
              title="Large text size"
            >
              A+
            </button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
