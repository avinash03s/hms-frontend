import axiosInstance from "../interceptor/AxiosInterceptor"

const scheduleAppointment = async (data: any) => {
    return axiosInstance.post('/appointment/schedule', data)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const cancelAppointment = async (id: any) => {
    return axiosInstance.put('/appointment/cancel/' + id)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}   

const getAppointment = async (id: any) => {
    return axiosInstance.get('/appointment/get/' + id)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const getAppointmentDetails = async (id: any) => {
    return axiosInstance.get('/appointment/get/details/' + id)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const getAppointmentsByPatient = async (patientId: any) => {
    return axiosInstance.get('/appointment/getAllByPatient/' + patientId)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const getAppointmentsByDoctor = async (doctorId: any) => {
    return axiosInstance.get('/appointment/getAllByDoctor/' + doctorId)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const createAppointmentReport = (data: any) => {
    return axiosInstance.post('/appointment/report/create', data)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

// CREATE PRESCRIPTION
const createPrescription = async (data: any) => {
    return axiosInstance.post('/api/prescriptions', data)
        .then((res: any) => res.data)
        .catch((err: any) => { throw err; });
}

// GET BY DOCTOR (REPORTS PAGE)
const getPrescriptionsByDoctor = async (doctorId: any) => {
    return axiosInstance.get('/api/prescriptions/doctor/' + doctorId)
        .then((res: any) => res.data)
        .catch((err: any) => { throw err; });
}

// GET BY APPOINTMENT
const getPrescriptionByAppointment = async (appointmentId: any) => {
    return axiosInstance.get('/api/prescriptions/appointment/' + appointmentId)
        .then((res: any) => res.data)
        .catch((err: any) => { throw err; });
}

// GET BY ID
const getPrescriptionById = async (id: any) => {
    return axiosInstance.get('/api/prescriptions/' + id)
        .then((res: any) => res.data)
        .catch((err: any) => { throw err; });
}

const getPrescriptionsByPatient = async (patientId: any) => {
    return axiosInstance.get('/api/prescriptions/patient/' + patientId)
        .then((res: any) => res.data)
        .catch((err: any) => { throw err; });
}


export {
    scheduleAppointment, cancelAppointment, getAppointment,
    getAppointmentDetails, getAppointmentsByPatient, getAppointmentsByDoctor,
    createAppointmentReport, createPrescription,
    getPrescriptionsByDoctor,
    getPrescriptionByAppointment,
    getPrescriptionById, getPrescriptionsByPatient
}