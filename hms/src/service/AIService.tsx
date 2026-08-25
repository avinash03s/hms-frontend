import { jwtDecode } from "jwt-decode";
import axiosInstance from "../interceptor/AxiosInterceptor";


// export const askAI = async (question: string) => {
//   const res = await fetch("http://localhost:9500/api/ai/ask", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({ question })
//   });

//   return await res.text();
// };

export const askAI = async (question: string) => {
    const response = await axiosInstance.post("/api/ai/ask", {
        question,
    });

    return response.data;
};


export const askPatientAI = async (question: string) => {
    const token = localStorage.getItem("token");
    let userId = "";

    if (token) {
        const decoded: any = jwtDecode(token);
        userId = decoded.id; // this token uses "id", confirmed from your payload
    }

    const response = await axiosInstance.post(
        "/api/patient-ai/chat",
        { question },
        { headers: { userId: String(userId) } }
    );

    return response.data;
};