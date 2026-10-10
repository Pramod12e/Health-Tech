import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { endCall } from "../api/consultationApi";

const ICE_SERVERS = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

function VideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { consultationId, role } = location.state || {};

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const containerRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const pendingCandidates = useRef([]); // queue for early ICE candidates
  const remoteDescSet = useRef(false);

  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let socket;
    let pc;

    const init = async () => {
      socket = io("http://localhost:5000", { withCredentials: true });
      socketRef.current = socket;

      pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      pc.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setConnected(true);
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) setConnected(false);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", { roomId, candidate: event.candidate });
        }
      };

      const flushPendingCandidates = async () => {
        for (const c of pendingCandidates.current) {
          try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch (e) { console.error(e); }
        }
        pendingCandidates.current = [];
      };

      // Wait for camera/mic BEFORE doing anything with the call —
      // this is the fix: both sides must have tracks attached before any offer/answer is created
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      } catch (err) {
        console.error("Could not access camera/mic", err);
      }

      socket.on("user-joined", async () => {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
      });

      socket.on("offer", async ({ offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        remoteDescSet.current = true;
        await flushPendingCandidates();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { roomId, answer });
      });

      socket.on("answer", async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSet.current = true;
        await flushPendingCandidates();
      });

      socket.on("ice-candidate", async ({ candidate }) => {
        if (remoteDescSet.current) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { console.error(e); }
        } else {
          pendingCandidates.current.push(candidate);
        }
      });

      socket.on("user-left", () => {
        setConnected(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      });

      // only join the room AFTER our own camera/mic is ready
      socket.emit("join-room", roomId);
    };

    init();

    return () => {
      if (pc) pc.close();
      if (socket) {
        socket.emit("leave-room", roomId);
        socket.disconnect();
      }
    };
  }, [roomId]);

  const toggleMic = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    const stream = localVideoRef.current?.srcObject;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn(!camOn);
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  const handleLeave = async () => {
    if (role === "doctor" && consultationId) {
      try { await endCall(consultationId); } catch (e) { console.error(e); }
    }
    navigate(role === "doctor" ? "/doctor/appointments" : "/my-consultations");
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: "relative",
        width: "70vw",
        height: "70vh",
        margin: "5vh auto",
        backgroundColor: "#000",
        overflow: "hidden",
        borderRadius: 2
      }}
    >
      {/* Remote video - large, fills screen (Zoom-style main view) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {!connected && (
        <Typography
          sx={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            color: "white", fontSize: 18
          }}
        >
          Waiting for the other person to join...
        </Typography>
      )}

      {/* Local video - small, bottom-right corner (Zoom-style self-view) */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: "absolute", bottom: 100, right: 24,
          width: 160, height: 120, objectFit: "cover",
          borderRadius: 8, border: "2px solid white", backgroundColor: "#111"
        }}
      />

      {/* Control bar */}
      <Box
        sx={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 2, backgroundColor: "rgba(0,0,0,0.6)",
          padding: "10px 20px", borderRadius: 50
        }}
      >
        <Tooltip title={micOn ? "Mute" : "Unmute"}>
          <IconButton onClick={toggleMic} sx={{ color: "white", backgroundColor: micOn ? "transparent" : "error.main" }}>
            {micOn ? <MicIcon /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={camOn ? "Turn off camera" : "Turn on camera"}>
          <IconButton onClick={toggleCam} sx={{ color: "white", backgroundColor: camOn ? "transparent" : "error.main" }}>
            {camOn ? <VideocamIcon /> : <VideocamOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={fullscreen ? "Exit fullscreen" : "Fullscreen"}>
          <IconButton onClick={toggleFullscreen} sx={{ color: "white" }}>
            {fullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Leave call">
          <IconButton onClick={handleLeave} sx={{ color: "white", backgroundColor: "error.main" }}>
            <CallEndIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
export default VideoCall;