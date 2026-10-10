import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

axios.defaults.withCredentials = true; 
const axiosClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true
});

export default axiosClient;
export const bookConsultation = (data) => axiosClient.post("/consultations", data);
export const getPatientConsultations = () => axiosClient.get("/patient/consultations");
export const getDoctorConsultations = () => axiosClient.get("/doctor/consultations");
export const updateConsultationStatus = (id, status) => axiosClient.put(`/consultations/${id}/status`, { status });
export const startCall = (id) => axiosClient.post(`/consultations/${id}/start-call`);
export const endCall = (id) => axiosClient.post(`/consultations/${id}/end-call`);
export const addPrescription = (id, data) => axiosClient.put(`/consultations/${id}/prescription`, data);