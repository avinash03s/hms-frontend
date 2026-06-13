import axiosInstance from "../interceptor/AxiosInterceptor";

const getAllPackages = async (params?: any) => {
  return axiosInstance
    .get("/api/packages", { params })
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const getPackageById = async (id: number) => {
  return axiosInstance
    .get("/api/packages/" + id)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const getPopularPackages = async () => {
  return axiosInstance
    .get("/api/packages/popular")
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const getCategories = async () => {
  return axiosInstance
    .get("/api/packages/categories")
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const searchPackages = async (query: string) => {
  return axiosInstance
    .get("/api/packages/search?query=" + query)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

// admin management
const createPackage = async (data: any) => {
  return axiosInstance
    .post("/api/packages", data)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const updatePackage = async (id: number, data: any) => {
  return axiosInstance
    .put("/api/packages/" + id, data)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const deletePackage = async (id: number) => {
  return axiosInstance
    .delete("/api/packages/" + id)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

//booking api
const bookPackage = async (data: any) => {
  return axiosInstance
    .post("/api/bookings", data)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const getMyBookings = async () => {
  return axiosInstance
    .get("/api/bookings/my")
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const getAllBookings = async () => {
  return axiosInstance
    .get("/api/bookings/all")
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const getBookingById = async (id: number) => {
  return axiosInstance
    .get("/api/bookings/" + id)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

//status api 
const updateBookingStatus = async (id: number, status: string) => {
  return axiosInstance
    .patch(`/api/bookings/${id}/status?status=${status}`)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};

const cancelBooking = async (id: number) => {
  return axiosInstance
    .patch(`/api/bookings/${id}/cancel`)
    .then((res: any) => res.data)
    .catch((err: any) => { throw err; });
};


export {
  getAllPackages,
  getPackageById,
  getPopularPackages,
  getCategories,
  searchPackages,

  createPackage,
  updatePackage,
  deletePackage,

  bookPackage,
  getMyBookings,
  getAllBookings,
  getBookingById,

  updateBookingStatus,
  cancelBooking,
};