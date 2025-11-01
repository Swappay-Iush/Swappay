// Hooks de React para manejar estado local y efectos
import { useState, useEffect } from "react";
// Estilos del listado de usuarios del chat
import "./UsersChat.css";

// Store de chat (Zustand) desde el que obtenemos las conversaciones
import { useChatUser } from "../../../App/stores/StoreChat"; // Importamos el store de chat.
// Avatar de MUI para mostrar foto o iniciales del usuario
import Avatar from '@mui/material/Avatar'; //Componente para el perfil del usuario

const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

// Listado de conversaciones: al hacer click, avisamos al padre qué chat abrir
const UsersChat = ({setInfoUser}) => { //Recibimos por props la función para establecer la información del usuario seleccionado.

    const { conversations_users } = useChatUser(); //Obtenemos las conversaciones de los usuarios desde el store.
    const [chatsUsers, setChatsUsers] = useState(conversations_users || []); //Estado para almacenar los usuarios con los que se tiene conversación.

    useEffect(() => { // Efecto para actualizar la lista de chats cuando cambian las conversaciones en el store.
        setChatsUsers(conversations_users); // Sincroniza el estado local con el store persistente
    }, [conversations_users]);

    
    const userSelected = (info) => { // Cuando el usuario hace clic en una conversación
        setInfoUser({ // Enviamos al componente padre la info necesaria para abrir el chat
            userImage: info.userImage, // Imagen del otro usuario (si existe)
            username: info.username, // Nombre del otro usuario
            salaID: info.chat_id, // Id de la sala de chat (room)
            userId: info.userId // Id del otro usuario (destinatario)
        });
    }

    const stringAvatar = (name) => { // Función para calcular iniciales (1 o 2 letras)
        if (!name || typeof name !== "string") return { children: "?" }; // Fallback si no hay nombre
        const parts = name.trim().split(/\s+/); // Separamos por espacios múltiples
        const first = parts[0]?.[0] || ""; // Inicial del primer nombre
        const second = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : ""; // Inicial del último apellido
        const initials = `${first}${second}`.toUpperCase(); // Componemos y normalizamos a mayúsculas
        return { children: initials }; // MUI Avatar renderiza este texto dentro del círculo
    };
    
    return (
        <div className="usersChat-container"> {/* Contenedor del listado de conversaciones */}
            {chatsUsers.map((value, index) => (
                <div key={index} className="userChat-item" onClick={() => userSelected(value)}> {/* Item clickeable */}
                <Avatar
                    className="userChat-avatar"
                    src={value?.userImage ? `${API_URL}/uploads/${value.userImage}` : undefined} // Usamos imagen si existe
                    alt={value?.username || "Usuario"} // Texto alternativo para accesibilidad
                    {...stringAvatar(value?.username)} // Fallback: iniciales cuando no hay imagen
                    style={{ cursor: "pointer" }}
                />

                <div className="userChat-info"> {/* Nombre del otro usuario */}
                    <h4>{value.username}</h4>
                </div>
                </div>
            ))}
        </div>
    );
};

export default UsersChat;
