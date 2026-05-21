import axiosInstance from "../interceptor/AxiosInterceptor"

const addStock = async (data: any) => {
    return axiosInstance.post('/pharmacy/inventory/add', data)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const getStock = async (id: any) => {
    return axiosInstance.get('/pharmacy/inventory/get/' + id)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const getAllStock = async () => {
    return axiosInstance.get('/pharmacy/inventory/getAll')
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

const updateStock = async (data: any) => {
    return axiosInstance.put('/pharmacy/inventory/update', data)
        .then((response: any) => response.data)
        .catch((error: any) => { throw error; })
}

// const deleteStock = async (id: number) => {
//     return axiosInstance.delete('/pharmacy/inventory/delete/' + id)
//         .then((response: any) => response.data)
//         .catch((error: any) => { throw error; })
// }

export { addStock, getAllStock, getStock, updateStock };