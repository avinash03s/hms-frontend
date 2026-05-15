import axios from "axios";

const PROFILE_URL = "http://localhost:9100/profile";
const APPOINTMENT_URL = "http://localhost:9200/appointment";

export const getAllDoctors = async () => {
  return axios.get(`${PROFILE_URL}/doctor/all`);
};

export const deleteDoctor = async (doctorId: number) => {
  return axios.delete(`${PROFILE_URL}/doctor/delete/${doctorId}`);
};

export const getAllPatients = async () => {
  return axios.get(`${PROFILE_URL}/patient/all`);
};

export const deletePatient = async (patientId: number) => {
  return axios.delete(`${PROFILE_URL}/patient/delete/${patientId}`);
};

export const getAllAppointments = async () => {
  return axios.get(`${APPOINTMENT_URL}/all/details`);
};