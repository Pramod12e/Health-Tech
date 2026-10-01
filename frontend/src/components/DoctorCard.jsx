import { Card, CardContent, CardActions, Typography, Button, Box, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useAccessibility } from "../context/AccessibilityContext";

function DoctorCard({ doctor }) {
  const navigate = useNavigate();
  const { lang } = useAccessibility();

  if (!doctor) return null;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        border: "1.5px solid #dceced",
        boxShadow: "0 4px 18px rgba(7, 63, 82, 0.06)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 14px 30px rgba(7, 63, 82, 0.12)",
          borderColor: "#99f6e4"
        }
      }}
    >
      {/* Doctor Image with Availability Badge */}
      <Box sx={{ position: "relative", height: 230, overflow: "hidden", background: "#e2e8f0" }}>
        <Box
          component="img"
          src={doctor.image || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=500&q=80"}
          alt={doctor.name}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.8,
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            fontSize: "12px",
            fontWeight: 800,
            background: doctor.isAvailableNow !== false ? "rgba(220, 252, 231, 0.95)" : "rgba(241, 245, 249, 0.95)",
            color: doctor.isAvailableNow !== false ? "#15803d" : "#475569",
            backdropFilter: "blur(6px)",
            border: doctor.isAvailableNow !== false ? "1px solid #86efac" : "1px solid #cbd5e1"
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: doctor.isAvailableNow !== false ? "#16a34a" : "#94a3b8"
            }}
          />
          <span>
            {doctor.isAvailableNow !== false
              ? (lang === "hi" ? "उपलब्ध" : "Available")
              : (lang === "hi" ? "समय तय करें" : "Book Slot")}
          </span>
        </Box>
      </Box>

      <CardContent sx={{ flex: 1, p: 2.5, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.15rem" }}>
          {doctor.name}
        </Typography>

        <Typography sx={{ fontWeight: 700, color: "#0d9488", fontSize: "0.95rem", mt: 0.5 }}>
          🩺 {doctor.specialty}
        </Typography>

        <Typography variant="body2" sx={{ color: "#64748b", mt: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
          <LocationOnIcon fontSize="small" sx={{ color: "var(--accent)" }} />
          {doctor.hospital || "Medical Center"}
        </Typography>

        {doctor.experience && (
          <Typography variant="caption" sx={{ color: "#334155", fontWeight: 600, mt: 1 }}>
            ⏱️ {doctor.experience} {lang === "hi" ? "वर्ष का अनुभव" : "Years Experience"}
          </Typography>
        )}

        {/* Languages Spoken */}
        {doctor.languages?.length > 0 && (
          <Box sx={{ mt: 1.5, display: "flex", gap: 0.8, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
              {lang === "hi" ? "भाषा:" : "Speaks:"}
            </Typography>
            {doctor.languages.map((l) => (
              <Chip
                key={l}
                label={l}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "11px",
                  fontWeight: 700,
                  bgcolor: "#f1f5f9",
                  color: "#334155"
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(`/doctors/${doctor._id}`)}
          startIcon={<VideoCallIcon />}
          sx={{
            bgcolor: "#073f52",
            color: "#ffffff",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2.5,
            py: 1,
            "&:hover": { bgcolor: "#052f3d" }
          }}
        >
          {lang === "hi" ? "परामर्श करें (Book Call)" : "Consult Doctor"}
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate(`/doctors/${doctor._id}`)}
          sx={{
            borderColor: "#cbd5e1",
            color: "#334155",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2.5,
            py: 0.8
          }}
        >
          {lang === "hi" ? "प्रोफाइल विवरण देखें" : "View Profile"}
        </Button>
      </CardActions>
    </Card>
  );
}

export default DoctorCard;
