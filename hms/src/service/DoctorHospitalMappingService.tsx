import axiosInstance from "../interceptor/AxiosInterceptor";

const getDoctorsByHospital = async (hospitalId: any) => {
    return axiosInstance.get("/doctor-hospital-mapping/hospital/" + hospitalId)
        .then((res: any) => res.data)
        .catch((err: any) => { throw err; });
};

export {
    getDoctorsByHospital
};