import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setupAutoSync } from "./offline/syncManager";

import DoctorListing from "./pages/DoctorListing";
import DoctorDetail from "./pages/DoctorDetail";
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import CreateProfile from "./pages/CreateProfile";
import ProfileView from "./pages/ProfileView";
import ProfileEdit from "./pages/ProfileEdit";
import ManageMedicine from "./pages/ManageMedicine";
import PharmacyListing from "./pages/PharmacyListing";
import PharmacyDetail from "./pages/PharmacyDetail";
import MyAppointments from "./pages/MyAppointments";
import MyConsultations from "./pages/MyConsultations";
import SymptomChecker from "./pages/SymptomChecker";
import VideoCall from "./pages/VideoCall";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import { AuthProvider } from "./context/AuthContext";
import { CallProvider } from "./context/CallContext";

function App() {
  
  useEffect(() => {
    setupAutoSync();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <CallProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<DoctorListing />} />
            <Route path="/doctors/:id" element={<DoctorDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pharmacies" element={<PharmacyListing />} />
            <Route path="/pharmacies/:id" element={<PharmacyDetail />} />
            <Route path="/doctor/appointments" element={
              <ProtectedRoute allowedRoles={["doctor"]}><MyAppointments /></ProtectedRoute>
            } />
            <Route path="/my-consultations" element={
              <ProtectedRoute allowedRoles={["patient"]}><MyConsultations /></ProtectedRoute>
            } />

            <Route path="/create-profile" element={
              <ProtectedRoute><CreateProfile /></ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute><ProfileView /></ProtectedRoute>
            } />

            <Route path="/profile/edit" element={
              <ProtectedRoute><ProfileEdit /></ProtectedRoute>
            } />

            <Route path="/pharmacy/medicine" element={
              <ProtectedRoute allowedRoles={["pharmacy"]}><ManageMedicine /></ProtectedRoute>
            } />

            <Route path="/symptom-checker" element={
              <ProtectedRoute allowedRoles={["patient"]}><SymptomChecker /></ProtectedRoute>
            } />

            <Route path="/call/:roomId" element={
              <ProtectedRoute><VideoCall /></ProtectedRoute>
            } />
            
          </Routes>
          <Footer />
          <ToastContainer />
         </CallProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;