import axiosClient from "./axiosClient";

export const checkSymptoms = (symptoms) => axiosClient.post("/symptom-check", { symptoms });