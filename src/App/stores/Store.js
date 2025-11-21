import { create } from "zustand";  
import api from "../../service/axiosConfig"; //Importamos API para comunicarnos con el backend.

const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

//Estado global para manejar la información del usuario en toda la aplicación
export const useUserStore = create((set) => ({
    id: null,  //ID del usuario
    username: null, //Nombre del usuario
    rol: null, //Rol del usuario.
    country: null, //Pais del usuario
    email: null, //Email del usuario
    isVerified: false,  //Si el usuario esta verificado con el token.
    profileImageUser: null, //Imagen del usuario
    userInfo: {}, //Objeto que almacena toda la información del usuario y tiene campos como: phone, country, address, etc.
    swappcoins: 0, //Saldo de SwappCoins del usuario
    completedTrades: 0, //Número de intercambios completados
    profileCompletedReward: false, //Indica si ya recibió el bonus de completar perfil
    
    setUserInfo: (infoUser) => set({ userInfo: infoUser }), //Función para actualizar userInfo con todo el objeto del usuario.
    setUser: (user) => set(user), //Función para actualizar datos del usuario  

    // Función para actualizar solo los swappcoins desde el servidor
    updateSwappcoins: async (userId) => {
        try {
            const { data } = await api.get(`/users/${userId}/swappcoins`);
            set({ 
                swappcoins: data.swappcoins,
                completedTrades: data.completedTrades,
                profileCompletedReward: data.profileCompletedReward
            });
            return data;
        } catch (error) {
            console.error("Error al actualizar swappcoins", error);
            throw error;
        }
    },

    logout: async() => { //Cierra la sesión del usuario.
        try {
            await api.post('/auth/logout'); //Endpoint para cerrar sesión y quitar el token.
        
            set({id: null, username: null, rol: null, country: null, email: null, isVerified: false, profileImageUser:null, swappcoins: 0, completedTrades: 0, profileCompletedReward: false}); //Valores pro defecto.

        } catch (error) {
            console.error("Error al cerrar sesión", error)
        }
    },

    initializeUser: async ()=> { //Verifica el token y actualiza estado
        try {
            const {data} = await api.post('/verification/verificationToken') //Endpoint para validar si el token sigue siendo valido.

            //En caso de ser valido, traemos todos los datos del usuario.
            set({
                id: data.id, 
                username: data.username, 
                rol: data.rol, 
                country: data.country, 
                email: data.email, 
                isVerified: true,
                userInfo: data, 
                profileImageUser: `${API_URL}/uploads/${data.profileImage}`,
                swappcoins: data.swappcoins || 0,
                completedTrades: data.completedTrades || 0,
                profileCompletedReward: data.profileCompletedReward || false
            })

        } catch (error) {
            set({username: null, rol: null, country: null, email:null, isVerified: false, profileImageUser:null, swappcoins: 0, completedTrades: 0, profileCompletedReward: false})
        }
    }
}))