import { createContext, useContext, useState, useEffect } from "react";

const AccessibilityContext = createContext();

export const translations = {
  // Navigation
  home: { en: "Home", hi: "होम", or: "ମୂଳପୃଷ୍ଠା" },
  doctors: { en: "Doctors", hi: "डॉक्टर", or: "ଡାକ୍ତର" },
  symptomChecker: { en: "Symptom Checker", hi: "बीमारी जांचें", or: "ରୋଗ ପରୀକ୍ଷା" },
  patientHistory: { en: "Patient History", hi: "पुरानी पर्ची / इतिहास", or: "ପୂର୍ବ ରେକର୍ଡ" },
  pharmacies: { en: "Pharmacies", hi: "दवा दुकान", or: "ଔଷଧ ଦୋକାନ" },
  manageMedicine: { en: "Manage Medicine", hi: "दवा प्रबंधन", or: "ଔଷଧ ପରିଚାଳନା" },
  login: { en: "Login", hi: "लॉगिन करें", or: "ଲଗଇନ୍" },
  myProfile: { en: "My Profile", hi: "मेरी प्रोफाइल", or: "ମୋ ପ୍ରୋଫାଇଲ୍" },
  emergency: { en: "Emergency: Call 108", hi: "आपातकाल: 108 पर कॉल करें", or: "ଜରୁରୀ: 108 କଲ୍ କରନ୍ତୁ" },
  listenGuide: { en: "Listen to Guide", hi: "आवाज़ में सुनें", or: "ଶୁଣନ୍ତୁ" },
  stopAudio: { en: "Stop Audio", hi: "आवाज़ रोकें", or: "ଅଟକାନ୍ତୁ" },
  textSize: { en: "Text Size", hi: "अक्षर आकार", or: "ଅକ୍ଷର ଆକାର" }
};

export function AccessibilityProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("preferred_lang") || "hi");
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("preferred_fontsize") || "normal");
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    localStorage.setItem("preferred_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("preferred_fontsize", fontSize);
    document.documentElement.setAttribute("data-fontsize", fontSize);
  }, [fontSize]);

  const t = (key, fallbackEn = "") => {
    if (translations[key]) {
      return translations[key][lang] || translations[key].en || fallbackEn;
    }
    return fallbackEn;
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      alert("Voice playback is not supported on this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    if (!text || text.trim() === "") return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88; // slightly slower for high clarity & comprehension
    utterance.pitch = 1.0;

    if (lang === "hi") {
      utterance.lang = "hi-IN";
    } else if (lang === "or") {
      utterance.lang = "hi-IN"; // fallback to Indian voice
    } else {
      utterance.lang = "en-IN";
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        lang,
        setLang,
        fontSize,
        setFontSize,
        t,
        speak,
        stopSpeaking,
        isSpeaking
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
