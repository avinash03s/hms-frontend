import axiosInstance from "../interceptor/AxiosInterceptor"

const addMedicine = async (data: any) => {
    return axiosInstance.post('/pharmacy/medicines/add', data)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const getMedicine = async (id: any) => {
    return axiosInstance.get('/pharmacy/medicines/get/' + id)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const getAllMedicines = async () => {
    return axiosInstance.get('/pharmacy/medicines/getAll')
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const updateMedicine = async (data: any) => {
    return axiosInstance.put('/pharmacy/medicines/update', data)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const deleteMedicine = async (id: number) => {
    return axiosInstance.delete('/pharmacy/medicines/delete/' + id)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

export { addMedicine, getMedicine, getAllMedicines, updateMedicine,deleteMedicine };