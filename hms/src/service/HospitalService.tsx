import axiosInstance from "../interceptor/AxiosInterceptor";

const getHospitalDropdown = async () => {
    return axiosInstance.get("/hospital/dropdown")
        .then((res: any) => res.data)
        .catch((err: any) => { throw err; });
};

export {
    getHospitalDropdown
};