import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, MenuItem } from "@mui/material";
import { bookConsultation } from "../api/consultationApi";
import { toast } from "react-toastify";

function BookingModal({ open, onClose, doctor }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [symptoms, setSymptoms] = useState(sessionStorage.getItem("pendingSymptoms") || "");

  const handleBook = async () => {
    if (!date || !slot) {
      toast.error("Please pick date and time slot");
      return;
    }
    try {
      await bookConsultation({ doctorId: doctor._id, date, slot, symptoms });
      toast.success("Consultation booked!");
      sessionStorage.removeItem("pendingSymptoms");
      sessionStorage.removeItem("pendingUrgency");
      onClose();
    } catch (err) {
      toast.error("Booking failed");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Book with {doctor.name}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 1 }}>
        <TextField
          label="Date"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <TextField select label="Time Slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
          {(doctor.availability || []).flatMap((a) =>
            a.slots.map((s) => (
              <MenuItem key={`${a.day}-${s}`} value={s}>{a.day} — {s}</MenuItem>
            ))
          )}
        </TextField>
        <TextField
          label="Describe your symptoms (optional)"
          multiline
          rows={3}
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <Button variant="contained" onClick={handleBook}>Confirm Booking</Button>
      </DialogContent>
    </Dialog>
  );
}
export default BookingModal;