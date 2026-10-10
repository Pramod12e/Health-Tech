import { useEffect, useState } from "react";
import { getDoctorConsultations, updateConsultationStatus, startCall, endCall, addPrescription } from "../api/consultationApi";
import { Container, Typography, Paper, Box, Chip, Button, Tabs, Tab, Dialog, DialogTitle, DialogContent, TextField, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";


const STATUS_COLOR = {
  pending: "warning",
  confirmed: "info",
  ongoing: "secondary",
  completed: "success",
  cancelled: "error"
};

function MyAppointments() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState("pending");
  const [presOpen, setPresOpen] = useState(false);
  const [activeConsult, setActiveConsult] = useState(null);
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([{ name: "", dosage: "", duration: "" }]);
  const navigate = useNavigate();
  
  const load = () => {
    getDoctorConsultations().then((res) => setList(res.data)).catch(() => toast.error("Failed to load"));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateConsultationStatus(id, status);
      toast.success(`Marked as ${status}`);
      load();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleStartCall = async (id) => {
    try {
      const res = await startCall(id);
      navigate(`/call/${res.data.roomId}`, { state: { consultationId: id, role: "doctor" } });
    } catch {
      toast.error("Could not start call");
    }
  };

  const handleEndCall = async (id) => {
    try {
      await endCall(id);
      toast.success("Call ended");
      load();
    } catch {
      toast.error("Could not end call");
    }
  };

  const openPrescription = (consult) => {
    setActiveConsult(consult);
    setNotes(consult.prescription?.notes || "");
    setMedicines(consult.prescription?.medicines?.length ? consult.prescription.medicines : [{ name: "", dosage: "", duration: "" }]);
    setPresOpen(true);
  };

  const addMedicineRow = () => setMedicines([...medicines, { name: "", dosage: "", duration: "" }]);
  const updateMedicineRow = (i, field, value) => {
    const updated = [...medicines];
    updated[i][field] = value;
    setMedicines(updated);
  };
  const removeMedicineRow = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));

  const savePrescription = async () => {
    try {
      await addPrescription(activeConsult._id, { notes, medicines });
      toast.success("Prescription saved");
      setPresOpen(false);
      load();
    } catch {
      toast.error("Failed to save prescription");
    }
  };

  const filtered = list.filter((c) => c.status === tab);

  return (
    <Container maxWidth="md" sx={{ marginTop: 4, marginBottom: 4 }}>
      <Typography variant="h5" gutterBottom>My Appointments</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ marginBottom: 2 }}>
        <Tab label="Pending" value="pending" />
        <Tab label="Confirmed" value="confirmed" />
        <Tab label="Ongoing" value="ongoing" />
        <Tab label="Completed" value="completed" />
        <Tab label="Cancelled" value="cancelled" />
      </Tabs>

      {filtered.length === 0 && <Typography color="text.secondary">No appointments here.</Typography>}

      {filtered.map((c) => (
        <Paper key={c._id} sx={{ padding: 2, marginBottom: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="subtitle1">{c.patient?.email}</Typography>
            <Chip label={c.status} color={STATUS_COLOR[c.status]} size="small" />
          </Box>
          <Typography sx={{ marginTop: 1 }}>Date: {c.date} — Slot: {c.slot}</Typography>
          {c.symptoms && <Typography color="text.secondary">Symptoms: {c.symptoms}</Typography>}

          <Box sx={{ marginTop: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {c.status === "pending" && (
              <>
                <Button size="small" variant="contained" onClick={() => handleStatus(c._id, "confirmed")}>Confirm</Button>
                <Button size="small" color="error" onClick={() => handleStatus(c._id, "cancelled")}>Cancel</Button>
              </>
            )}
            {c.status === "confirmed" && (
              <Button size="small" variant="contained" onClick={() => handleStartCall(c._id)}>Start Video Call</Button>
            )}
            {c.status === "ongoing" && (
              <>
                <Button size="small" variant="contained" color="secondary" onClick={() => handleEndCall(c._id)}>End Call</Button>
                <Button size="small" variant="outlined" onClick={() => openPrescription(c)}>Write Prescription</Button>
              </>
            )}
            {c.status === "completed" && (
              <Button size="small" variant="outlined" onClick={() => openPrescription(c)}>
                {c.prescription?.notes ? "Edit Prescription" : "Add Prescription"}
              </Button>
            )}
          </Box>
        </Paper>
      ))}

      <Dialog open={presOpen} onClose={() => setPresOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Prescription</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 1 }}>
          <TextField
            label="Notes / Advice"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Typography variant="subtitle2">Medicines</Typography>
          {medicines.map((m, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField size="small" label="Name" value={m.name}
                onChange={(e) => updateMedicineRow(i, "name", e.target.value)} />
              <TextField size="small" label="Dosage" value={m.dosage}
                onChange={(e) => updateMedicineRow(i, "dosage", e.target.value)} />
              <TextField size="small" label="Duration" value={m.duration}
                onChange={(e) => updateMedicineRow(i, "duration", e.target.value)} />
              <IconButton color="error" onClick={() => removeMedicineRow(i)}><DeleteIcon /></IconButton>
            </Box>
          ))}
          <Button onClick={addMedicineRow}>+ Add Medicine</Button>

          <Button variant="contained" onClick={savePrescription}>Save Prescription</Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
export default MyAppointments;