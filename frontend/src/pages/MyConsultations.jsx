import { useEffect, useState } from "react";
import { getPatientConsultations } from "../api/consultationApi";
import { Container, Typography, Paper, Box, Chip, Avatar, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const STATUS_COLOR = {
  pending: "warning",
  confirmed: "info",
  ongoing: "secondary",
  completed: "success",
  cancelled: "error"
};

const STATUS_LABEL = {
  pending: "Waiting for doctor to confirm",
  confirmed: "Confirmed — wait for doctor to start the call",
  ongoing: "Call in progress",
  completed: "Completed",
  cancelled: "Cancelled"
};

function MyConsultations() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getPatientConsultations()
      .then((res) => setList(res.data))
      .catch(() => toast.error("Failed to load your consultations"));
  }, []);

  const handleJoinCall = (consultation) => {
    navigate(`/call/${consultation.roomId}`, {
      state: { consultationId: consultation._id, role: "patient" }
    });
  };

  if (list.length === 0) {
    return (
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <Typography variant="h5" gutterBottom>My Consultations</Typography>
        <Typography color="text.secondary">You haven't booked any consultation yet.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Typography variant="h5" gutterBottom>My Consultations</Typography>

      {list.map((c) => (
        <Paper key={c._id} sx={{ padding: 2, marginBottom: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar src={c.doctor?.image} sx={{ width: 56, height: 56 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">{c.doctor?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{c.doctor?.specialty}</Typography>
            </Box>
            <Chip label={c.status} color={STATUS_COLOR[c.status]} size="small" />
          </Box>

          <Typography sx={{ marginTop: 1 }}>Date: {c.date} — Slot: {c.slot}</Typography>
          {c.symptoms && <Typography color="text.secondary">Your symptoms: {c.symptoms}</Typography>}

          <Typography variant="body2" sx={{ marginTop: 1, fontStyle: "italic" }}>
            {STATUS_LABEL[c.status]}
          </Typography>

          {c.status === "ongoing" && (
            <Button
              variant="contained"
              color="secondary"
              sx={{ marginTop: 2 }}
              onClick={() => handleJoinCall(c)}
            >
              Join Video Call
            </Button>
          )}

          {c.status === "completed" && c.prescription?.notes && (
            <Paper variant="outlined" sx={{ padding: 2, marginTop: 2, backgroundColor: "#f9f9f9" }}>
              <Typography variant="subtitle2">Prescription</Typography>
              <Typography variant="body2" sx={{ marginTop: 1 }}>{c.prescription.notes}</Typography>
              {c.prescription.medicines?.map((m, i) => (
                <Typography key={i} variant="body2">- {m.name} ({m.dosage}, {m.duration})</Typography>
              ))}
            </Paper>
          )}
        </Paper>
      ))}
    </Container>
  );
}
export default MyConsultations;