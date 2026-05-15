import axiosInstance from "../interceptor/AxiosInterceptor";

const BASE_URL = "/forgotPassword";

export const verifyEmail = (email: string): Promise<string> => {
  return axiosInstance
    .post<string>(`${BASE_URL}/verifyMail/${email}`)
    .then((res) => res.data);
};

export const verifyOtp = (otp: number, email: string): Promise<string> => {
  return axiosInstance
    .post<string>(`${BASE_URL}/verifyOtp/${otp}/${email}`)
    .then((res) => res.data);
};

export const changePassword = (
  email: string,
  password: string,
  confirmPassword: string
): Promise<string> => {
  return axiosInstance
    .post<string>(`${BASE_URL}/changePassword/${email}`, {
      password,
      confirmPassword,
    })
    .then((res) => res.data);
};