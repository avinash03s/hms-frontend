// import axiosInstance from "../interceptor/AxiosInterceptor";

// const PROFILE_URL = "http://localhost:9100/profile";
// const APPOINTMENT_URL = "http://localhost:9200/appointment";
// const USER_URL = "http://localhost:8080/user";

// export const getAllDoctors = async () => {
//   return axiosInstance.get(`${PROFILE_URL}/doctor/all`);
// };

// export const deleteDoctor = async (doctorId: number) => {
//   return axiosInstance.delete(`${PROFILE_URL}/doctor/delete/${doctorId}`);
// };

// export const getAllPatients = async () => {
//   return axiosInstance.get(`${PROFILE_URL}/patient/all`);
// };

// export const deletePatient = async (patientId: number) => {
//   return axiosInstance.delete(`${PROFILE_URL}/patient/delete/${patientId}`);
// };

// export const getAllAppointments = async () => {
//   return axiosInstance.get(`${APPOINTMENT_URL}/all/details`);
// };

// export const registerDoctor = async (data: any) => {
//   return axiosInstance.post(`${USER_URL}/create-doctor`, data); // ✅ token automatically jayega
// };
// AdminService.ts
import axiosInstance from "../interceptor/AxiosInterceptor";

// ❌ Pehle — hardcoded direct ports (bypass karte the gateway + no JWT)
// const PROFILE_URL = "http://localhost:9100/profile";
// const APPOINTMENT_URL = "http://localhost:9200/appointment";  
// const USER_URL = "http://localhost:8080/user";

// ✅ Ab — sirf path, gateway handle karega routing + JWT automatically jayega

export const getAllDoctors = async () => {
    return axiosInstance.get('/profile/doctor/all');
};

export const deleteDoctor = async (doctorId: number) => {
    return axiosInstance.delete(`/profile/doctor/delete/${doctorId}`);
};

export const getAllPatients = async () => {
    return axiosInstance.get('/profile/patient/all');
};

export const deletePatient = async (patientId: number) => {
    return axiosInstance.delete(`/profile/patient/delete/${patientId}`);
};

export const getAllAppointments = async () => {
    return axiosInstance.get('/appointment/all/details');
};

export const registerDoctor = async (data: any) => {
    return axiosInstance.post('/user/create-doctor', data);
};