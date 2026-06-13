import axiosInstance from "../interceptor/AxiosInterceptor"

const getDoctor = async (id: any) => {
    return axiosInstance.get('/profile/doctor/get/' + id)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const updateDoctor = async (doctor: any) => {
    return axiosInstance.put('/profile/doctor/update', doctor)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const getDoctorDropdown = async () => {
    return axiosInstance.get('/profile/doctor/dropdowns')
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const uploadProfilePhoto = async (
    file: File,
    oldFileId?: number
) => {
    const formData = new FormData();
    formData.append("file", file);
    if (oldFileId) {
        formData.append(
            "oldFileId",
            oldFileId.toString()
        );
    }
    return axiosInstance.post(
        '/profile/files/upload',
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    )
        .then((response: any) => response.data)
        .catch((error: any) => {
            throw error;
        });
}
const getAllDoctors = async () => {
    return axiosInstance.get('/profile/doctor/all')
        .then((res: any) => res.data)
        .catch((err: any) => { throw err; });
}

export { getDoctor, updateDoctor, getDoctorDropdown, uploadProfilePhoto, getAllDoctors }