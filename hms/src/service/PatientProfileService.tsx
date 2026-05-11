import axios from "axios";
import axiosInstance from "../interceptor/AxiosInterceptor"

const getPatient = async (id: any) => {
  return axiosInstance.get('/profile/patient/get/' + id)
    .then((response: any) => response.data)
    .catch((error: any) => { throw error; })
}

const updatePatient = async (patient: any) => {
  return axiosInstance.put('/profile/patient/update', patient)
    .then((response: any) => response.data)
    .catch((error: any) => { throw error; })
}

const uploadProfilePhoto = async (file: File, oldFileId?: number) => {
  const formData = new FormData();
  formData.append("file", file);
  if (oldFileId) {
    formData.append("oldFileId", oldFileId.toString());
  }
  const response = await axios.post(
    "http://localhost:9100/profile/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export { getPatient, updatePatient, uploadProfilePhoto }