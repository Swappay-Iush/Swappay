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
    const [isMobileView, setIsMobileView] = useState(false);
    const [activePanel, setActivePanel] = useState("split");
    const { conversations_users, getChatRoom } = useChatUser(); // Lista de salas y acción para cargarlas
    const { id } = useUserStore(); // Id del usuario autenticado

    // Cargar las salas de chat desde el backend cuando cambia el id (usuario autenticado)
    useEffect(() => {
        if (id) { // Solo si tenemos el id del usuario
            getChatRoom(id); // Pide las salas al backend y las guarda en el store
        }
    }, [id, getChatRoom]);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
            return;
        }

        const mediaQuery = window.matchMedia("(max-width: 768px)");

        const handleViewportChange = (event) => {
            setIsMobileView(event.matches);
        };

        handleViewportChange(mediaQuery);

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", handleViewportChange);
        } else if (typeof mediaQuery.addListener === "function") {
            mediaQuery.addListener(handleViewportChange);
        }

        return () => {
            if (typeof mediaQuery.removeEventListener === "function") {
                mediaQuery.removeEventListener("change", handleViewportChange);
            } else if (typeof mediaQuery.removeListener === "function") {
                mediaQuery.removeListener(handleViewportChange);
            }
        };
    }, []);

    useEffect(() => {
        if (!isMobileView) {
            setActivePanel("split");
            return;
        }

        if (!infoUser) {
            setActivePanel("list");
        }
    }, [isMobileView, infoUser]);

    const handleChatSelected = (info) => {
        setInfoUser(info);

        if (isMobileView) {
            setActivePanel("chat");
        }
    };

    const handleBackToList = () => {
        if (isMobileView) {
            setActivePanel("list");
        }
    };

    const handleChatDeleted = () => {
        setInfoUser(null);

        if (isMobileView) {
            setActivePanel("list");
        }
    };

    const noChats = !conversations_users || conversations_users.length === 0; // Flag: no hay salas disponibles
    const showListPanel = !isMobileView || activePanel === "list" || activePanel === "split";
    const showChatPanel = !isMobileView || activePanel === "chat" || activePanel === "split";
     
    return(
        <div className="container_general_chats_users"> {/* Layout de dos columnas: listado + chat */}
            <div
                className="container_chats_users"
                data-panel={isMobileView ? activePanel : "split"}
            > 
                {/* Si hay chats, mostramos el listado; si no, mensaje informativo */}
                <div className="chat_list_panel" data-visible={showListPanel}>
                    {!noChats ? (
                        <UsersChat
                            setInfoUser={handleChatSelected}
                            activeChatId={infoUser?.salaID}
                        />
                    ) : (
                        <div className="usersChat-container" id="info_no_chats">No hay chats disponibles por el momento.</div>
                    )}
                </div>
                {/* Panel derecho: muestra el LiveChat si se seleccionó una conversación */}
                <div className="chat_detail_panel" data-visible={showChatPanel}>
                    {infoUser ? (
                        <LiveChat
                            infoUser={infoUser}
                            onChatDeleted={handleChatDeleted}
                            onBackToList={handleBackToList}
                            showBackButton={isMobileView}
                        />
                    ) : (
                        <div className="info_select_chat">Selecciona un chat para comenzar una conversación.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Messages;
