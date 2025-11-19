import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

const api = axios.create({
    baseURL: API_URL, // URL DEL BACKEND
    withCredentials: true
})

export default api;

//URL LOCAL: http://localhost:3000 