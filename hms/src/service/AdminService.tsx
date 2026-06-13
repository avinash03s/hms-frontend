import axiosInstance from "../interceptor/AxiosInterceptor";

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

export const setDoctorSchedule = async (data: any) => {
    return axiosInstance.post('/appointment/schedule/set', data);
};

export const getDoctorSchedule = async (doctorId: number) => {
    return axiosInstance.get(`/appointment/schedule/doctor/${doctorId}`);
};