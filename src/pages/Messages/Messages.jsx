// Hooks de React para manejar estado y efectos
import { useState, useEffect } from "react";
// Estilos de la página de Mensajes
import "./Messages.css"
// Componentes del módulo de chat: listado y chat en vivo
import LiveChat from "../../modules/Messages/LiveChat/LiveChat";
import UsersChat from "../../modules/Messages/UsersChat/UsersChat";
// Store de chat (Zustand) para acceder a conversaciones y acciones
import { useChatUser } from "../../App/stores/StoreChat";
// Store de sesión/usuario para obtener el id del usuario autenticado
import { useUserStore } from "../../App/stores/Store";

const Messages = () => {

    const [infoUser, setInfoUser] = useState(null); // Info del chat seleccionado (otro usuario + sala)
    const { conversations_users, getChatRoom } = useChatUser(); // Lista de salas y acción para cargarlas
    const { id } = useUserStore(); // Id del usuario autenticado

    // Cargar las salas de chat desde el backend cuando cambia el id (usuario autenticado)
    useEffect(() => {
        if (id) { // Solo si tenemos el id del usuario
            getChatRoom(id); // Pide las salas al backend y las guarda en el store
        }
    }, [id]);

    const noChats = !conversations_users || conversations_users.length === 0; // Flag: no hay salas disponibles
     
    return(
        <div className="container_general_chats_users"> {/* Layout de dos columnas: listado + chat */}
            <div className="container_chats_users"> 
                {/* Si hay chats, mostramos el listado; si no, mensaje informativo */}
                {!noChats ? (
                   <UsersChat setInfoUser={setInfoUser}/>
                ) : (
                    <div className="usersChat-container" id="info_no_chats">No hay chats disponibles por el momento.</div>
                )}
                {/* Panel derecho: muestra el LiveChat si se seleccionó una conversación */}
                {infoUser ? (
                    <LiveChat infoUser={infoUser} />
                ) : (
                    <div className="info_select_chat">Selecciona un chat para comenzar una conversación.</div>
                )}
            </div>
        </div>
    )
}

export default Messages;
