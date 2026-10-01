import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import DoctorListing from "./pages/DoctorListing";
import DoctorDetail from "./pages/DoctorDetail";
import Home from "./pages/Home.jsx";
import SymptomChecker from "./pages/SymptomChecker.jsx";
import PatientHistory from "./pages/PatientHistory.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import CreateProfile from "./pages/CreateProfile";
import ProfileView from "./pages/ProfileView";
import ProfileEdit from "./pages/ProfileEdit";
import ManageMedicine from "./pages/ManageMedicine";
import PharmacyListing from "./pages/PharmacyListing";
import PharmacyDetail from "./pages/PharmacyDetail";

import Navbar from "./components/Navbar.jsx";
import AccessibilityBar from "./components/AccessibilityBar.jsx";
import Footer from "./components/Footer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";

function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <AccessibilityBar />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/patient-history" element={<PatientHistory />} />
            <Route path="/history" element={<PatientHistory />} />

            <Route path="/doctors" element={<DoctorListing />} />
            <Route path="/doctors/:id" element={<DoctorDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pharmacies" element={<PharmacyListing />} />
            <Route path="/pharmacies/:id" element={<PharmacyDetail />} />

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
          </Routes>
          <Footer />
          <ToastContainer />
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;