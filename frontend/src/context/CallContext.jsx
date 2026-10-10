import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io as ioClient } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography } from "@mui/material";

const CallContext = createContext();

function playRingtone(audioCtxRef) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  audioCtxRef.current = ctx;
  const beep = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  };
  beep();
  const interval = setInterval(beep, 1000);
  return () => { clearInterval(interval); ctx.close(); };
}

export function CallProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const stopRingRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const socket = ioClient("http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;
    socket.emit("register-user", user.userId);
    console.log("Registered as user:", user.userId);

    socket.on("incoming-call", (data) => {
      setIncomingCall(data);
      stopRingRef.current = playRingtone({ current: null });
    });

    return () => {
      socket.disconnect();
      if (stopRingRef.current) stopRingRef.current();
    };
  }, [user]);

  const handleAccept = () => {
    if (stopRingRef.current) stopRingRef.current();
    navigate(`/call/${incomingCall.roomId}`, {
      state: { consultationId: incomingCall.consultationId, role: "patient" }
    });
    setIncomingCall(null);
  };

  const handleDecline = () => {
    if (stopRingRef.current) stopRingRef.current();
    setIncomingCall(null);
  };

  return (
    <CallContext.Provider value={{}}>
      {children}
      <Dialog open={!!incomingCall} onClose={handleDecline}>
        <DialogTitle>Incoming Call</DialogTitle>
        <DialogContent sx={{ textAlign: "center", padding: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dr. {incomingCall?.doctorName} is calling you
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 2 }}>
            <Button variant="contained" color="success" onClick={handleAccept}>Accept</Button>
            <Button variant="contained" color="error" onClick={handleDecline}>Decline</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </CallContext.Provider>
  );
}

export const useCall = () => useContext(CallContext);