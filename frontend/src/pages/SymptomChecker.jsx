import { useState } from "react";
import { Container, Paper, Typography, Checkbox, FormControlLabel, Button, TextField, Box, Grid } from "@mui/material";
import { checkSymptoms } from "../api/symptomApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const COMMON_SYMPTOMS = [
  "Fever", "Cough", "Headache", "Body pain", "Fatigue",
  "Vomiting", "Diarrhea", "Chest pain", "Difficulty breathing", "Dizziness"
];

const URGENCY_STYLE = {
  low: { bg: "#E8F5E9", color: "#2E9E5B", label: "Low Urgency" },
  medium: { bg: "#FFF8E1", color: "#B8860B", label: "Medium Urgency" },
  high: { bg: "#FDEAEA", color: "#C0392B", label: "High Urgency" },
};

function SymptomChecker() {
  const [selected, setSelected] = useState([]);
  const [otherText, setOtherText] = useState("");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const toggleSymptom = (s) => {
    setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSubmit = async () => {
    const allSymptoms = [...selected, ...(otherText.trim() ? [otherText.trim()] : [])];
    if (allSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }
    try {
      const res = await checkSymptoms(allSymptoms);
      setResult({ ...res.data, symptomsText: allSymptoms.join(", ") });
    } catch (err) {
      toast.error("Could not check symptoms. Try again.");
    }
  };

  const handleFindDoctor = () => {
    // carry symptoms + urgency into the booking flow
    sessionStorage.setItem("pendingSymptoms", result.symptomsText);
    sessionStorage.setItem("pendingUrgency", result.urgencyLevel);
    navigate("/doctors");
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h5" gutterBottom>How are you feeling?</Typography>
        <Typography color="text.secondary" sx={{ marginBottom: 2 }}>
          Select what you're experiencing before booking a doctor.
        </Typography>

        <Grid container>
          {COMMON_SYMPTOMS.map((s) => (
            <Grid size={{ xs: 6 }} key={s}>
              <FormControlLabel
                control={<Checkbox checked={selected.includes(s)} onChange={() => toggleSymptom(s)} />}
                label={s}
              />
            </Grid>
          ))}
        </Grid>

        <TextField
          fullWidth
          label="Anything else? (optional)"
          margin="normal"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
        />

        <Button fullWidth variant="contained" sx={{ marginTop: 2 }} onClick={handleSubmit}>
          Check Symptoms
        </Button>

        {result && (
          <Box
            sx={{
              marginTop: 3, padding: 2, borderRadius: 2,
              backgroundColor: URGENCY_STYLE[result.urgencyLevel].bg
            }}
          >
            <Typography variant="subtitle1" sx={{ color: URGENCY_STYLE[result.urgencyLevel].color, fontWeight: "bold" }}>
              {URGENCY_STYLE[result.urgencyLevel].label}
            </Typography>
            <Typography sx={{ marginTop: 1 }}>{result.possibleCondition}</Typography>
            {result.forcedByRule && (
              <Typography variant="body2" sx={{ marginTop: 1, fontStyle: "italic" }}>
                This alert was triggered by a safety rule due to a serious symptom you mentioned.
              </Typography>
            )}
            <Button
              fullWidth
              variant="contained"
              color={result.urgencyLevel === "high" ? "error" : "primary"}
              sx={{ marginTop: 2 }}
              onClick={handleFindDoctor}
            >
              {result.urgencyLevel === "high" ? "Connect to a Doctor Now" : "Find a Doctor"}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
export default SymptomChecker;