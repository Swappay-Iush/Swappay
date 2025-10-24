import { create } from "zustand"; // Importamos zustand para la creación del store.
import api from "../../service/axiosConfig"; //Importamos el servicio para comunicarnos con el backend.

// Store para manejar las conversaciones de los usuarios.
export const useChatUser = create((set) => ({ 
    id_user_sesion: null, // ID del usuario en sesión.
    conversations_users: [], // Arreglo para almacenar las conversaciones de los usuarios.

    setChat: (infoUsers) => set((state) => { // Función para agregar una nueva conversación de usuario.
        const exists = state.conversations_users.some((user) => user.userId === infoUsers.userId ); // Verificamos si la conversación ya existe.
        if (exists) {return {};} // Si ya existe, no hacemos nada.
        return {conversations_users: [...state.conversations_users, infoUsers]}; // Si no existe, agregamos la nueva conversación.
    }),

    getChatRoom: async () => { // Función para obtener las salas de chat.
        try {
            //Futura lógica para traer las salas en las que el usuario en sesión tiene conversaciones.
        } catch (error) {
            
        }
    },

    deleteChatRoom: async () => { // Función para eliminar una sala de chat.
        try {
            //Futura lógica para eliminar las salas de chat.
        } catch (error) {
            
        }
    }

}))