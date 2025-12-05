// Importamos hooks de React para efectos, estado y referencias
import { useEffect, useState, useRef, useMemo } from "react";
// Estilos específicos del componente de chat
import "./LiveChat.css";
// Cliente de Socket.IO para comunicación en tiempo real
import { io } from "socket.io-client";
// Cliente Axios configurado para llamadas al backend
import api from "../../../service/axiosConfig";
// Notificaciones amigables al usuario
import { toast } from "react-toastify";

// Icono de opciones del chat (no funcional aún)
// Componente Avatar de MUI para mostrar foto o iniciales
import Avatar from '@mui/material/Avatar';
// Store de sesión para obtener el id del usuario autenticado
import { useUserStore } from "../../../App/stores/Store";
import { useChatUser } from "../../../App/stores/StoreChat";

const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
const LiveChat = ({ infoUser, onChatDeleted, onBackToList, showBackButton }) => {
    // Estado controlado del input de mensaje
    const [message, setMessage] = useState("");
    // Estado con el historial y nuevos mensajes de la conversación
    const [messages, setMessages] = useState([]);
    // Mensajes administrativos provenientes del panel (messagesInfo)
    const [tradeMessages, setTradeMessages] = useState([]);
    // Mensajes informativos visibles dentro del chat (solo el más reciente relevante)
    const [systemMessages, setSystemMessages] = useState([]);
    // URL de la imagen del avatar (si no hay, se usan iniciales)
    const [avatarSrc, setAvatarSrc] = useState(null);
    // Estado del acuerdo de intercambio (trade agreement)
    const [tradeStatus, setTradeStatus] = useState(null);
    // Loading state para el botón de aceptar
    const [loadingTrade, setLoadingTrade] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    // Referencia estable a la conexión de socket (se mantiene entre renders)
    const socketRef = useRef(null);
    // Referencia al último elemento de la lista para auto-scroll
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const tradeStatusFetchLockRef = useRef(false);
    const localDeleteRef = useRef(false);
    const suppressedChatsRef = useRef(new Map());
    const adminMessagesSuppressedRef = useRef(false);
    const { id: currentUserId } = useUserStore();
    // Estado para el menú de opciones (tres puntitos)
    const [menuAnchor, setMenuAnchor] = useState(null);
    const deleteChatRoom = useChatUser((state) => state.deleteChatRoom);
    const removeChatRoomLocal = useChatUser((state) => state.removeChatRoomLocal);

    const relevantAdminMessages = useMemo(() => {
        if (!Array.isArray(tradeMessages)) return [];

        const roomId = Number(infoUser?.salaID);

        return tradeMessages.filter((msg) => {
            if (!msg || typeof msg.text !== "string") return false;

            const normalized = msg.text.trim().toLowerCase();
            if (!normalized) return false;
            if (normalized.includes("reinicio de intercambio")) return false;

            if (Object.prototype.hasOwnProperty.call(msg, "chatRoomId")) {
                const messageRoomId = Number(msg.chatRoomId);
                if (!Number.isNaN(messageRoomId) && !Number.isNaN(roomId) && messageRoomId !== roomId) {
                    return false;
                }
            }

            return true;
        });
    }, [tradeMessages, infoUser?.salaID]);

    const mapMessageFromBackend = (rawMessage) => {
        if (!rawMessage) return null;

        const chatRoomId = rawMessage.chatRoomId ?? infoUser?.salaID ?? null;
        const fallbackId = `${chatRoomId || 'chat'}-${rawMessage.createdAt || Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const messageId = rawMessage.id ?? rawMessage.messageId ?? fallbackId;
        const type = rawMessage.type === 'image' ? 'image' : 'text';
        const content = typeof rawMessage.content === "string" ? rawMessage.content : "";
        const mediaUrl = typeof rawMessage.mediaUrl === "string" ? rawMessage.mediaUrl : "";
        const mediaName = typeof rawMessage.mediaName === "string" ? rawMessage.mediaName : "";
        const mediaSize = typeof rawMessage.mediaSize === "number" ? rawMessage.mediaSize : null;
        const normalizeId = (value) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : null;
        };

        const currentId = normalizeId(currentUserId);
        const otherId = normalizeId(infoUser?.userId);

        const senderCandidates = [
            rawMessage.senderId,
            rawMessage.sender?.id,
            rawMessage.sender?.userId,
            rawMessage.createdBy
        ].map((value) => normalizeId(value));

        let resolvedSenderId = senderCandidates.find((value) => value !== null) ?? null;
        const recipientId = normalizeId(rawMessage.userId);

        let fromMeFinal;

        if (typeof rawMessage.fromMe === "boolean") {
            fromMeFinal = rawMessage.fromMe;
        } else if (resolvedSenderId !== null && currentId !== null && resolvedSenderId === currentId) {
            fromMeFinal = true;
        } else if (resolvedSenderId !== null && otherId !== null && resolvedSenderId === otherId) {
            fromMeFinal = false;
        } else if (recipientId !== null && currentId !== null) {
            fromMeFinal = recipientId === currentId;
        } else {
            fromMeFinal = false;
        }

        if (resolvedSenderId === null) {
            resolvedSenderId = fromMeFinal ? currentId : otherId;
        }

        return {
            id: messageId,
            chatRoomId,
            type,
            text: content,
            mediaUrl,
            mediaName,
            mediaSize,
            fromMe: fromMeFinal,
            senderId: resolvedSenderId,
            createdAt: rawMessage.createdAt ? new Date(rawMessage.createdAt) : new Date(),
        };
    };

    const appendMessage = (rawMessage) => {
        const shaped = mapMessageFromBackend(rawMessage);
        if (!shaped) return;

        const shapedWithTimestamp = shaped?.createdAt instanceof Date
            ? shaped
            : {
                ...shaped,
                createdAt: shaped?.createdAt ? new Date(shaped.createdAt) : new Date()
            };

        setMessages((prev) => {
            const next = [...prev];

            if (shapedWithTimestamp.type === 'image' && shapedWithTimestamp.mediaUrl) {
                const existingIndex = next.findIndex((msg) => (
                    msg.type === 'image' && msg.mediaUrl === shapedWithTimestamp.mediaUrl
                ));

                if (existingIndex !== -1) {
                    next[existingIndex] = { ...next[existingIndex], ...shapedWithTimestamp };
                    return next;
                }
            }

            if (shapedWithTimestamp.id && prev.some((msg) => msg.id === shapedWithTimestamp.id)) {
                return prev;
            }
            next.push(shapedWithTimestamp);
            return next;
        });

    };

    const applyTradeStatus = (status, { shouldUpdateMessages = true } = {}) => {
        setTradeStatus(status);

        if (!status || typeof status !== "object") return;

        const chatIdNumber = Number(status.chatRoomId || infoUser?.salaID);

        const releaseSuppression = Boolean(
            (status.user1Accepted && status.user2Accepted) ||
            status.tradeCompleted === 'en_proceso' ||
            status.tradeCompleted === 'completado'
        );

        if (releaseSuppression) {
            adminMessagesSuppressedRef.current = false;
            if (!Number.isNaN(chatIdNumber)) {
                suppressedChatsRef.current.delete(chatIdNumber);
            }
        } else {
            adminMessagesSuppressedRef.current = true;
            if (!Number.isNaN(chatIdNumber)) {
                suppressedChatsRef.current.set(chatIdNumber, true);
            }
        }

        if (!shouldUpdateMessages) return;

        if (adminMessagesSuppressedRef.current && !releaseSuppression) {
            setTradeMessages([]);
            setSystemMessages([]);
            return;
        }

        const hasMessagesInfo = Object.prototype.hasOwnProperty.call(status, "messagesInfo");
        if (!hasMessagesInfo) return;

        const infoArray = Array.isArray(status.messagesInfo)
            ? status.messagesInfo
            : (typeof status.messagesInfo === "string" && status.messagesInfo.trim() !== "")
                ? [status.messagesInfo]
                : [];
        const chatId = status.chatRoomId || infoUser?.salaID;
        const shaped = infoArray.map((msg, index) => ({
            id: `${chatId || 'trade'}-status-${index}`,
            text: typeof msg === "string" ? msg : String(msg ?? ""),
            chatRoomId: chatId
        }));
        setTradeMessages(shaped);
    };

    // Acción: iniciar un nuevo intercambio (resetea el acuerdo y actualiza messagesInfo)
    const handleNewExchange = async () => {
        if (!infoUser?.salaID) return;
        if (!currentUserId) {
            toast.error('No se pudo identificar al usuario. Intenta iniciar sesión nuevamente.');
            setMenuAnchor(null);
            return;
        }

        setMenuAnchor(null);
        try {
            await api.post('/chat/trade/reset', { chatRoomId: infoUser.salaID });
            await api.post(`/chat/trade/messages/${infoUser.salaID}`, {
                messagesInfo: []
            });
            setTradeStatus(null);
            setTradeMessages([]);
            setSystemMessages([]);
            adminMessagesSuppressedRef.current = true;
            suppressedChatsRef.current.set(Number(infoUser.salaID), true);
            if (socketRef.current) {
                socketRef.current.emit('tradeReset', {
                    chatRoomId: infoUser.salaID,
                    triggeredBy: Number(currentUserId)
                });
            }
            await fetchTradeStatus({ shouldUpdateMessages: false });
        } catch (err) {
            console.error('Error al iniciar nuevo intercambio:', err);
            toast.error('No se pudo iniciar nuevo intercambio.');
        }
    };

    const fetchTradeStatus = async ({ shouldUpdateMessages = true } = {}) => {
        if (!infoUser?.salaID) return;

        try {
            const response = await api.get(`/chat/trade/status/${infoUser.salaID}`);
            applyTradeStatus(response.data, { shouldUpdateMessages });
        } catch (error) {
            console.error("Error al cargar estado del intercambio:", error);
        }
    };

    // Conectar socket una sola vez al montar el componente
    useEffect(() => {
        // Si aún no existe una conexión, la creamos
        if (!socketRef.current) {
            // Inicializa el cliente Socket.IO apuntando al backend
            socketRef.current = io(API_URL, {
                transports: ['websocket', 'polling'], // Transportes permitidos
                withCredentials: true // Permitir cookies si aplica
            });
        }

        // Al desmontar el componente, cerramos la conexión para evitar fugas
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect(); // Cierra la conexión activa
                socketRef.current = null; // Limpia la referencia
            }
        };
    }, []);

    // Cargar historial y configurar listeners cuando cambie el usuario
    useEffect(() => {
        // Si no hay sala seleccionada, el socket no está listo o aún no conocemos el usuario actual, no hacemos nada
        if (!infoUser?.salaID || !socketRef.current || !currentUserId) return;

        // Unirse a la sala de Socket.IO para recibir eventos en tiempo real de esa conversación
        socketRef.current.emit("joinRoom", { chatRoomId: infoUser.salaID });

        // Cargar historial de mensajes desde el backend (REST)
        api.get(`/chat/messages/${infoUser.salaID}`)
            .then(res => {
                // Adaptamos cada mensaje al formato de la UI
                const formattedMessages = Array.isArray(res.data)
                    ? res.data.map((msg) => mapMessageFromBackend(msg)).filter(Boolean)
                    : [];
                // Guardamos el historial en estado local
                setMessages(formattedMessages);
            })
            .catch(err => {
                // Si falla la carga, dejamos la conversación vacía y registramos el error
                console.error("Error cargando historial:", err);
                setMessages([]);
            });

        // Handler: procesa mensajes entrantes por Socket.IO
        const handleNewMessage = (data) => {
            // Aseguramos que el mensaje corresponde a la sala visible
            if (Number(data?.chatRoomId) === Number(infoUser.salaID)) {
                appendMessage(data);
            }
        };

        // Suscribimos el handler al evento de nuevo mensaje
        socketRef.current.on("newMessage", handleNewMessage);

        // Handler: procesa actualizaciones del estado de intercambio por Socket.IO
        const handleTradeUpdate = (data) => {
            if (data?.chatRoomId && Number(data.chatRoomId) !== Number(infoUser.salaID)) return;
            const status = data?.tradeAgreement || data;
            if (status) applyTradeStatus(status);
        };

        const handleTradeResetNotification = (data) => {
            const chatRoomId = Number(data?.chatRoomId);
            if (!chatRoomId || Number(infoUser.salaID) !== chatRoomId) return;

            const initiatorId = Number(data?.triggeredBy);
            const initiatedByMe = !Number.isNaN(initiatorId) && Number(currentUserId) === initiatorId;

            adminMessagesSuppressedRef.current = true;
            suppressedChatsRef.current.set(chatRoomId, true);
            setTradeStatus(null);
            setTradeMessages([]);
            setSystemMessages([]);

            fetchTradeStatus({ shouldUpdateMessages: false });
        };

        const handleChatDeleted = (data) => {
            const deletedId = Number(data?.chatRoomId);
            if (!deletedId) return;

            if (typeof removeChatRoomLocal === "function") {
                removeChatRoomLocal(deletedId);
            }

            if (Number(infoUser.salaID) === deletedId) {
                const initiatedByMe = localDeleteRef.current;
                localDeleteRef.current = false;

                if (typeof onChatDeleted === "function") {
                    onChatDeleted();
                }
            }
        };

        // Suscribimos el handler al evento de estado de intercambio
        socketRef.current.on("tradeStatusUpdated", handleTradeUpdate);
        socketRef.current.on("tradeReset", handleTradeResetNotification);
        socketRef.current.on("chatDeleted", handleChatDeleted);

        // Cleanup: remover listener al cambiar de chat
        return () => {
            if (socketRef.current) {
                // Eliminamos los listeners para evitar duplicados si cambia la sala
                socketRef.current.off("newMessage", handleNewMessage);
                socketRef.current.off("tradeStatusUpdated", handleTradeUpdate);
                socketRef.current.off("tradeReset", handleTradeResetNotification);
                socketRef.current.off("chatDeleted", handleChatDeleted);
            }
        };
    }, [infoUser, removeChatRoomLocal, onChatDeleted, currentUserId]);

    // Auto-scroll al último mensaje
    useEffect(() => {
        // Cuando la lista de mensajes cambia, desplazamos al final suavemente
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Actualizar avatar
    useEffect(() => {
        // Si el usuario tiene imagen, armamos la URL del backend; si no, usamos iniciales
        if (infoUser?.userImage) {
            setAvatarSrc(`${API_URL}/uploads/${infoUser.userImage}`);
        } else {
            setAvatarSrc(null);
        }
    }, [infoUser]);

    // Cargar estado del intercambio cuando cambia la sala
    useEffect(() => {
        if (infoUser?.salaID) {
            fetchTradeStatus();
        }
    }, [infoUser?.salaID]);

    useEffect(() => {
        setTradeMessages([]);
        setSystemMessages([]);
        setTradeStatus(null);
        tradeStatusFetchLockRef.current = false;
        localDeleteRef.current = false;

        const chatId = Number(infoUser?.salaID);
        if (!Number.isNaN(chatId) && suppressedChatsRef.current.has(chatId)) {
            adminMessagesSuppressedRef.current = true;
        } else {
            adminMessagesSuppressedRef.current = false;
        }
    }, [infoUser?.salaID]);

    // Fallback: sondeo periódico para captar cambios aunque no haya eventos
    useEffect(() => {
        if (!infoUser?.salaID) return;

        const intervalId = setInterval(() => {
            fetchTradeStatus();
        }, 5000); // cada 5s

        return () => clearInterval(intervalId);
    }, [infoUser?.salaID]);

    useEffect(() => {
        if (!infoUser?.salaID) return;
        if (!tradeStatus) return;

        const bothAccepted = Boolean(tradeStatus.user1Accepted && tradeStatus.user2Accepted);
        const hasRelevantAdminMessage = relevantAdminMessages.length > 0;

        if (!bothAccepted || hasRelevantAdminMessage) return;
        if (tradeStatusFetchLockRef.current) return;

        tradeStatusFetchLockRef.current = true;
        fetchTradeStatus().finally(() => {
            tradeStatusFetchLockRef.current = false;
        });
    }, [tradeStatus?.user1Accepted, tradeStatus?.user2Accepted, relevantAdminMessages.length, infoUser?.salaID]);

    // Utilidad: obtiene iniciales a partir del nombre (ej: "Sindy Ospina" -> "SO")
    const getInitials = (name) => { // Calcula iniciales para el avatar (1 o 2 letras)
        if (!name || typeof name !== "string") return "?"; // Fallback cuando no hay nombre
        const parts = name.trim().split(/\s+/); // Divide por espacios múltiples
        const first = parts[0]?.[0] || ""; // Inicial del primer nombre
        const second = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : ""; // Inicial del último apellido
        return `${first}${second}`.toUpperCase(); // Retorna en mayúsculas (ej: "SO")
    };

    const chatDisabled = Boolean(
        tradeStatus && (
            (tradeStatus.user1Accepted && tradeStatus.user2Accepted) ||
            tradeStatus.tradeCompleted === 'en_proceso' ||
            tradeStatus.tradeCompleted === 'completado'
        )
    );

    const handleSend = () => {
        if (chatDisabled || !currentUserId) return;
        // Validación: evitar envíos vacíos o sin socket
        if (message.trim() === "" || !socketRef.current) return;

        // Cuerpo del mensaje que espera el backend/Socket.IO
        const payload = {
            chatRoomId: infoUser.salaID, // Sala a la que pertenece el mensaje
            senderId: currentUserId, // Mi ID como remitente
            content: message.trim() // Contenido del mensaje sin espacios extremos
        };

        socketRef.current.emit("sendMessage", payload); // Emitimos por Socket.IO
        setMessage(""); // Limpiamos el input
    };

    const handleImageButtonClick = () => {
        if (chatDisabled || uploadingImage) return;
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageSelected = async (event) => {
        const file = event.target?.files?.[0];

        if (!file || !infoUser?.salaID) {
            if (event.target) {
                event.target.value = "";
            }
            return;
        }

        setUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await api.post(
                `/chat/messages/${infoUser.salaID}/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            const savedMessage = response.data?.message || response.data;
            const normalizedMessage = {
                ...savedMessage,
                senderId: Number(infoUser?.userId),
                userId: Number(currentUserId),
                fromMe: true,
                createdAt: new Date()
            };

            appendMessage(normalizedMessage);
        } catch (error) {
            console.error('Error al subir imagen:', error);
            const apiMsg = error?.response?.data?.message || error?.response?.data?.error;
            toast.error(apiMsg || 'No se pudo enviar la imagen.');
        } finally {
            setUploadingImage(false);
            if (event.target) {
                event.target.value = "";
            }
        }
    };

    useEffect(() => {
        if(tradeStatus && tradeStatus.tradeCompleted === 'en_proceso'){
            const changeInfoExchange = async () => {
                try {
                    await api.post(`/chat/trade/messages/${tradeStatus.chatRoomId}`, {
                        messagesInfo: ["Solicitud de intercambio enviado"]
                    })
                } catch (error) {
                    console.log(error);
                }
            };

            changeInfoExchange();
        }
    }, [tradeStatus]);

    useEffect(() => {
        if (!infoUser?.salaID || !relevantAdminMessages.length) {
            setSystemMessages([]);
            return;
        }

        const latestMessage = relevantAdminMessages[relevantAdminMessages.length - 1];
        const messageId = latestMessage?.id
            ? latestMessage.id
            : `${infoUser?.salaID || 'trade'}-status-${relevantAdminMessages.length - 1}`;

        setSystemMessages([{
            id: messageId,
            text: typeof latestMessage?.text === "string" ? latestMessage.text : String(latestMessage?.text ?? "")
        }]);
    }, [relevantAdminMessages, infoUser?.salaID]);

    const tradeSuccessVisible = Boolean(
        (tradeStatus && tradeStatus.tradeCompleted === 'completado') ||
        systemMessages.some((msg) => (
            typeof msg.text === "string" && msg.text.toLowerCase().includes("intercambio exitoso")
        ))
    );

    const handleDeleteChat = async () => {
        if (!infoUser?.salaID || !currentUserId) return;
        try {
            await api.patch(`/chat/rooms/${infoUser.salaID}/visibility`, {
                hidden: true,
                userId: currentUserId
            });
            // Eliminar el chat localmente para el usuario actual
            if (typeof removeChatRoomLocal === "function") {
                removeChatRoomLocal(infoUser.salaID);
            }
            // Notificar al padre si corresponde
            if (typeof onChatDeleted === "function") {
                onChatDeleted();
            }
            // El backend eliminará la sala y mensajes si ambos la ocultan
        } catch (error) {
            toast.error('No se pudo ocultar el chat.');
        } finally {
            setMenuAnchor(null);
        }
    };

    // Handler para aceptar/rechazar el intercambio (toggle)
    const handleAcceptTrade = async () => {
        if (!infoUser?.salaID || !currentUserId) {
            toast.error('Error: No se pudo identificar la sala o el usuario', {
                position: "top-center"
            });
            return;
        }
        
        setLoadingTrade(true);
        
        try {
            const response = await api.post('/chat/trade/accept', {
                chatRoomId: infoUser.salaID,
                userId: currentUserId
            });
            
            // Actualizar estado local con la respuesta
            applyTradeStatus(response.data);
            
        } catch (error) {
            console.error(" Error al procesar aceptación:", error);
            console.error(" Detalles del error:", error.response?.data);
            console.error(" Status:", error.response?.status);
            
            const errorMsg = error.response?.data?.error || 'Error al procesar la aceptación del intercambio';
            toast.error(errorMsg, {
                position: "top-center"
            });
        } finally {
            setLoadingTrade(false);
        }
    };

    const showBackNavigation = Boolean(showBackButton && typeof onBackToList === "function");
    const handleBackNavigation = () => {
        if (typeof onBackToList === "function") {
            onBackToList();
        }
    };

    const renderTradeAction = () => {
        const user1Id = tradeStatus?.user1Id;
        const iAccepted = tradeStatus
            ? Boolean(Number(user1Id) === Number(currentUserId) ? tradeStatus.user1Accepted : tradeStatus?.user2Accepted)
            : false;
        const otherAccepted = tradeStatus
            ? Boolean(Number(user1Id) === Number(currentUserId) ? tradeStatus?.user2Accepted : tradeStatus?.user1Accepted)
            : false;
        const bothAccepted = Boolean(tradeStatus && tradeStatus.user1Accepted && tradeStatus.user2Accepted);

        if (tradeStatus && tradeStatus.tradeCompleted === 'completado') {
            return (
                <button className="trade_btn trade_btn--success" disabled>
                    ✓ Intercambio completado
                </button>
            );
        }

        if (bothAccepted || (tradeStatus && tradeStatus.tradeCompleted === 'en_proceso')) {
            return (
                <button className="trade_btn trade_btn--success" disabled>
                    ✓ Intercambio en proceso
                </button>
            );
        }

        if (iAccepted && !otherAccepted) {
            return (
                <button className="trade_btn trade_btn--success" disabled>
                    ✓ Intercambio en proceso
                </button>
            );
        }

        return (
            <>
                <button
                    onClick={handleAcceptTrade}
                    disabled={loadingTrade}
                    className={`trade_btn ${iAccepted ? 'trade_btn--success' : 'trade_btn--primary'}`}
                >
                    {loadingTrade ? '⏳ Procesando...' : (iAccepted ? '✓ Has Aceptado' : 'Aceptar intercambio')}
                </button>

                {otherAccepted && !iAccepted && (
                    <span className="trade_status_text">
                        Intercambio aceptado por el otro, esperando tu confirmación
                    </span>
                )}
            </>
        );
    };

    const formatMessageTime = (value) => {
        if (!value) {
            return "";
        }

        try {
            const dateValue = value instanceof Date ? value : new Date(value);
            if (Number.isNaN(dateValue.getTime())) {
                return "";
            }

            return dateValue.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit"
            });
        } catch (error) {
            return "";
        }
    };

    return (
        <div className="container_chat_private">
            {/* Header: muestra avatar y nombre del otro usuario */}
            <header className="header_chat_private">
                <div className="header_profile_user">
                    {showBackNavigation && (
                        <button
                            type="button"
                            className="chat_back_btn"
                            onClick={handleBackNavigation}
                        >
                            <ArrowBackIosNewIcon fontSize="small" />
                            <span>Chats</span>
                        </button>
                    )}
                    {/* Avatar con imagen si existe, o iniciales como fallback */}
                    <Avatar src={avatarSrc} alt={infoUser?.username}> {/* Si no carga la imagen, MUI muestra children */}
                        {getInitials(infoUser?.username)} {/* Iniciales como fallback visual */}
                    </Avatar>
                    <div className="header_user_info">
                        {/* Nombre visible del otro usuario */}
                        <h1>{infoUser?.username || "Usuario"}</h1>
                    </div>
                </div>

                <div className="header_actions">
                    <div className="trade_status_group">
                        {renderTradeAction()}
                    </div>
                    {/* Icono de opciones del chat */}
                    <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small">
                        <MoreVertIcon className="chat_options_icon" />
                    </IconButton>
                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() => setMenuAnchor(null)}
                    >
                        <MenuItem 
                            onClick={handleDeleteChat}
                            disabled={systemMessages.length > 0}
                        >
                            Eliminar chat
                        </MenuItem>
                        <MenuItem onClick={() => setMenuAnchor(null)}>Cerrar</MenuItem>
                    </Menu>
                </div>
            </header>

            {/* Sección central con el historial de mensajes */}
            <section className="chat_messages_section">
                <div className="chat_messages_list">
                    {/* Render de cada mensaje con estilo condicional (mío/otro) */}
                    {messages.map((msg, idx) => {
                        const key = msg.id || idx;
                        const isMine = Boolean(msg?.fromMe);
                        const classNames = ["chat_message", isMine ? "from_me" : "from_them"];
                        if (msg.type === 'image') {
                            classNames.push('image_message');
                        }
                        const messageTime = formatMessageTime(msg?.createdAt);

                        return (
                            <div key={key} className={classNames.join(' ')}>
                                <div className="chat_message_content">
                                    {msg.type === 'image' && msg.mediaUrl ? (
                                        <a
                                            href={msg.mediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="chat_message_media"
                                        >
                                            <img
                                                src={msg.mediaUrl}
                                                alt={msg.mediaName || 'Imagen enviada'}
                                                loading="lazy"
                                            />
                                        </a>
                                    ) : null}

                                    {msg.type !== 'image' && typeof msg.text === "string" && (
                                        <span className="chat_message_text">{msg.text}</span>
                                    )}

                                    {msg.type === 'image' && msg.text && (
                                        <p className="chat_image_caption">{msg.text}</p>
                                    )}
                                </div>
                                {messageTime && (
                                    <span className="chat_message_meta">{messageTime}</span>
                                )}
                            </div>
                        );
                    })}
                    {systemMessages.map((msg) => (
                        <div key={msg.id} className="chat_message system_message">
                            {msg.text}
                        </div>
                    ))}
                    {tradeSuccessVisible && (
                        <button
                            type="button"
                            className="chat_reset_btn"
                            onClick={handleNewExchange}
                        >
                            Restablecer chat
                        </button>
                    )}
                    {/* Ancla invisible para auto-scroll al final */}
                    <div ref={messagesEndRef} />
                </div>
            </section>

            {/* Sección de entrada: caja de texto + botón enviar */}
            <section className="chat_input_section">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageSelected}
                    style={{ display: "none" }}
                />
                <button
                    type="button"
                    className="chat_media_btn"
                    onClick={handleImageButtonClick}
                    disabled={chatDisabled || uploadingImage}
                    title={uploadingImage ? "Subiendo imagen..." : "Enviar imagen"}
                >
                    {uploadingImage ? "..." : <CameraAltRoundedIcon fontSize="small" color="primary" />}
                </button>
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} // Actualiza el estado del input
                    placeholder="Escribe tu mensaje..." 
                    className="chat_input" 
                    onKeyDown={(e) => {if (!chatDisabled && e.key === "Enter") handleSend();}} // Enviar con Enter
                    disabled={chatDisabled}
                />
                <button className="chat_send_btn" onClick={handleSend} disabled={chatDisabled}>
                    Enviar
                </button>
            </section>
        </div>
    );
};

export default LiveChat;
