import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.cloud-ai.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
