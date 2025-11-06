// Import de la función para crear un store con Zustand
import { create } from "zustand";
// Middleware de persistencia para guardar el estado en localStorage
import { persist } from "zustand/middleware";
// Cliente Axios configurado para llamar al backend
import api from "../../service/axiosConfig";

// Definimos el store principal de chat (usuarios y salas)
export const useChatUser = create(
    // Envolvemos el store con persist para que sobreviva a recargas (localStorage)
    persist(
        (set) => ({ 
            // Lista de conversaciones (cada elemento representa una sala y el otro usuario)
            conversations_users: [],

            // Agrega una conversación al listado si no existe ya un chat con ese usuario
            setChat: (infoUsers) => set((state) => {
                // Verifica si ya existe una conversación con ese userId para evitar duplicados
                const exists = state.conversations_users.some((user) => user.userId === infoUsers.userId);
                // Si existe, no hacemos cambios en el estado
                if (exists) {return {};}
                // Si no, anexamos la nueva conversación al arreglo existente
                return {conversations_users: [...state.conversations_users, infoUsers]};
            }),

            // Carga todas las salas de chat en las que participa el usuario actual
            getChatRoom: async (userId) => { // Cargar salas de chat del usuario actual
                try {
                    // Petición al backend para obtener salas por usuario
                    const { data } = await api.get(`/chat/user/${userId}`);
                    // Diagnósticos para verificar datos recibidos y el id actual

                    
                    // Si no hay datos, salimos sin modificar estado
                    if (!data || data.length === 0) {
                        return;
                    }
                    
                    // Normalizamos cada registro de sala al formato que consume la UI
                    const formattedChats = data.map(room => {
                        // Logs de apoyo para validar estructura de cada sala
                        console.log("🔍 Procesando sala:", room);
                        console.log("   - room.user1Id:", room.user1Id);
                        console.log("   - room.user2Id:", room.user2Id);
                        console.log("   - User1:", room.User1);
                        console.log("   - User2:", room.User2);
                        
                        // Si faltan las asociaciones de usuario, no podemos identificar al otro participante
                        if (!room.User1 || !room.User2) {
                            return null;
                        }
                        
                        // Forzamos a número para evitar bugs por tipos (string vs number)
                        const idActual = Number(userId); // Id del usuario autenticado
                        let otherUser; // Aquí guardaremos al "otro" participante
                        if (Number(room.user1Id) === idActual) { // Si soy user1 -> el otro es user2
                            otherUser = room.User2;
                        } else { // Si no soy user1 -> el otro es user1
                            otherUser = room.User1;
                        }
                        // Salvaguarda extra: si por algún motivo el "otro" coincide con mi id, invertimos
                        if (otherUser && Number(otherUser.id) === idActual) {
                            otherUser = Number(room.user1Id) === idActual ? room.User1 : room.User2; // Intercambio
                        }
                        // Logs para verificar la selección del otro usuario
                        console.log("   - Otro usuario seleccionado:", otherUser);
                        console.log(`   - Usuario actual: ${idActual}, Nombre del otro usuario: ${otherUser.username}`);
                        
                        // Formato final que entiende la UI (lista de chats y LiveChat)
                        return {
                            userId: otherUser.id, // Id del otro usuario (destinatario)
                            userImage: otherUser.profileImage, // Avatar del otro usuario (si existe)
                            username: otherUser.username, // Nombre visible del otro usuario
                            chat_id: room.id // Id de la sala (para historial y room de socket)
                        };
                    }).filter(chat => chat !== null);

                    // Eliminamos duplicados por chat_id para que la lista no repita salas
                    const uniqueChats = []; // Contendrá el resultado sin duplicados
                    const seenIds = new Set(); // Registro de ids ya procesados
                    for (const chat of formattedChats) { // Recorremos la lista normalizada
                        if (!seenIds.has(chat.chat_id)) { // Si aún no agregamos este chat_id
                            uniqueChats.push(chat); // lo agregamos
                            seenIds.add(chat.chat_id); // marcamos como visto
                        }
                    }
                    // Persistimos el resultado en el store (y localStorage por persist)
                    set({ conversations_users: uniqueChats });
                    
                } catch (error) {
                    // Manejo de errores de red/servidor
                    console.error("Error:", error.response?.data);
                }
            },

            // Placeholder para eliminar una sala de chat (pendiente de implementación)
            deleteChatRoom: async () => {
                try {
                    // Futura lógica para eliminar las salas de chat.
                } catch (error) {
                    
                }
            }
        }),
        {
            // Clave única para guardar el estado del store en localStorage
            name: 'chat-storage',
        }
    )
)