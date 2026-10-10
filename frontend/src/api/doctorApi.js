import axiosClient from "./axiosClient";

export const getDoctors = () => axiosClient.get("/doctors");