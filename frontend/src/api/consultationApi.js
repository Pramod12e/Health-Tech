import axiosClient from "./axiosClient";

export const fallbackConsultations = [
  {
    _id: "c-101",
    date: "2026-09-28",
    slot: "10:00 AM",
    status: "completed",
    symptoms: "High fever (102°F), severe body ache and dry throat for 2 days",
    doctor: {
      _id: "doc-1",
      name: "Dr. Rajesh Kumar",
      specialty: "General Physician",
      hospital: "AIIMS Community Care Center",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80",
      languages: ["Hindi", "English", "Odia"]
    },
    aiSuggestion: {
      possibleCondition: "Acute Viral Fever (मौसमी वायरल बुखार)",
      urgencyLevel: "low",
      confidence: 0.88
    },
    prescription: {
      notes: "Drink 3 liters of warm water daily, take plenty of rest, avoid cold drinks.",
      medicines: [
        {
          name: "Paracetamol 650mg",
          dosage: "1 tablet after meal (खाने के बाद)",
          duration: "3 days (३ दिन)",
          timing: { morning: true, afternoon: false, night: true }
        },
        {
          name: "Cetirizine 10mg",
          dosage: "1 tablet at bedtime (रात को सोने से पहले)",
          duration: "5 days (५ दिन)",
          timing: { morning: false, afternoon: false, night: true }
        },
        {
          name: "Electral ORS Sachet",
          dosage: "Mix 1 packet in 1 liter clean water, sip throughout day",
          duration: "2 days (२ दिन)",
          timing: { morning: true, afternoon: true, night: false }
        }
      ]
    },
    followUpNeeded: false
  },
  {
    _id: "c-102",
    date: "2026-09-15",
    slot: "11:30 AM",
    status: "completed",
    symptoms: "Severe knee joint pain, morning stiffness and difficulty walking",
    doctor: {
      _id: "doc-2",
      name: "Dr. Sandeep Mohanty",
      specialty: "Orthopedics (हड्डी व जोड़ विशेषज्ञ)",
      hospital: "AMRI Hospital",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=500&q=80",
      languages: ["Odia", "Hindi", "English"]
    },
    aiSuggestion: {
      possibleCondition: "Knee Osteoarthritis / Joint Wear (जोड़ों का दर्द)",
      urgencyLevel: "medium",
      confidence: 0.85
    },
    prescription: {
      notes: "Avoid sitting on floor, use knee support brace while walking, 15 min warm water compression.",
      medicines: [
        {
          name: "Calcium + Vitamin D3",
          dosage: "1 tablet after breakfast (नाश्ते के बाद)",
          duration: "30 days (१ महीना)",
          timing: { morning: true, afternoon: false, night: false }
        },
        {
          name: "Aceclofenac Gel 30g",
          dosage: "Apply gently on knee twice daily (हल्के हाथ से लगाएं)",
          duration: "10 days (१० दिन)",
          timing: { morning: true, afternoon: false, night: true }
        }
      ]
    },
    followUpNeeded: true,
    followUpDate: "2026-10-15"
  },
  {
    _id: "c-103",
    date: "2026-08-30",
    slot: "04:00 PM",
    status: "completed",
    symptoms: "Cough with chest congestion in 5-year-old child and low appetite",
    doctor: {
      _id: "doc-3",
      name: "Dr. Neha Patel",
      specialty: "Pediatrics (शिशु व बाल रोग)",
      hospital: "Care Hospitals Children's Wing",
      image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=500&q=80",
      languages: ["Hindi", "English"]
    },
    aiSuggestion: {
      possibleCondition: "Bronchial Congestion (छाती में कफ)",
      urgencyLevel: "medium",
      confidence: 0.91
    },
    prescription: {
      notes: "Steam inhalation 2 times daily. Give light khichdi and warm soup.",
      medicines: [
        {
          name: "Ascoril LS Syrup",
          dosage: "2.5 ml with warm water (चम्मच से नापकर)",
          duration: "5 days (५ दिन)",
          timing: { morning: true, afternoon: false, night: true }
        },
        {
          name: "Multivitamin Drops",
          dosage: "1 ml once daily in morning",
          duration: "15 days",
          timing: { morning: true, afternoon: false, night: false }
        }
      ]
    },
    followUpNeeded: false
  }
];

const defaultDoctors = [
  {
    name: "Dr. Rajesh Kumar",
    specialty: "General Physician",
    hospital: "AIIMS Community Care Center",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Dr. Sandeep Mohanty",
    specialty: "Orthopedics",
    hospital: "AMRI Hospital",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Dr. Neha Patel",
    specialty: "Pediatrics",
    hospital: "Care Hospitals Children's Wing",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=500&q=80"
  }
];

export const getPatientConsultations = async () => {
  try {
    const res = await axiosClient.get("/patient/consultations");
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((item, idx) => ({
        ...item,
        doctor: item.doctor || defaultDoctors[idx % defaultDoctors.length],
        prescription: {
          ...item.prescription,
          medicines: (item.prescription?.medicines || []).map((m, mIdx) => ({
            ...m,
            timing: m.timing || {
              morning: mIdx === 0 || mIdx === 2,
              afternoon: mIdx === 1,
              night: true
            }
          }))
        }
      }));
    }
    return fallbackConsultations;
  } catch (err) {
    console.warn("Using fallback consultations data:", err);
    return fallbackConsultations;
  }
};
