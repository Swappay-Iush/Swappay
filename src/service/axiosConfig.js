import axios from "axios";

const api = axios.create({
    baseURL: "https://swappay-backend-production.up.railway.app", // URL DEL BACKEND
    withCredentials: true
})

export default api;

//URL LOCAL: http://localhost:3000 