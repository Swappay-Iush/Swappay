// Importamos hooks de React para efectos, estado y referencias
import { useEffect, useState, useRef } from "react";
// Estilos específicos del componente de chat
import "./LiveChat.css";
// Cliente de Socket.IO para comunicación en tiempo real
import { io } from "socket.io-client";
// Cliente Axios configurado para llamadas al backend
import api from "../../../service/axiosConfig";
// Notificaciones amigables al usuario
import { toast } from "react-toastify";

// Icono de opciones del chat (no funcional aún)
import MoreVertIcon from "@mui/icons-material/MoreVert";  
// Componente Avatar de MUI para mostrar foto o iniciales
import Avatar from '@mui/material/Avatar';
// Store de sesión para obtener el id del usuario autenticado
import { useUserStore } from "../../../App/stores/Store";

const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
const LiveChat = ({ infoUser }) => { 
    // Estado controlado del input de mensaje
    const [message, setMessage] = useState("");
    // Estado con el historial y nuevos mensajes de la conversación
    const [messages, setMessages] = useState([]);
    // URL de la imagen del avatar (si no hay, se usan iniciales)
    const [avatarSrc, setAvatarSrc] = useState(null);
    // Estado del acuerdo de intercambio (trade agreement)
    const [tradeStatus, setTradeStatus] = useState(null);
    // Loading state para el botón de aceptar
    const [loadingTrade, setLoadingTrade] = useState(false);
    // Referencia estable a la conexión de socket (se mantiene entre renders)
    const socketRef = useRef(null);
    // Referencia al último elemento de la lista para auto-scroll
    const messagesEndRef = useRef(null);
    // Id del usuario autenticado desde el store
    const { id: currentUserId } = useUserStore();
    // Estado para el menú de opciones (tres puntitos)
    const [menuAnchor, setMenuAnchor] = useState(null);

    // Acción: iniciar un nuevo intercambio (resetea el acuerdo y actualiza messagesInfo)
    const handleNewExchange = async () => {
        if (!infoUser?.salaID) return;
        setMenuAnchor(null);
        try {
            // Resetear acuerdo en backend
            await api.post('/chat/trade/reset', { chatRoomId: infoUser.salaID });
            // Añadir una entrada para que la última posición deje de ser 'Intercambio exitoso'
            await api.post(`/chat/trade/messages/${infoUser.salaID}`, { messagesInfo: ['Reinicio de intercambio'] });
            // Refrescar estado local
            await fetchTradeStatus();
            toast.success('Nuevo intercambio iniciado. El estado se ha reiniciado.');
        } catch (err) {
            console.error('Error al iniciar nuevo intercambio:', err);
            toast.error('No se pudo iniciar nuevo intercambio.');
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
        // Si no hay sala seleccionada o el socket no está listo, no hacemos nada
        if (!infoUser?.salaID || !socketRef.current) return;

        // Unirse a la sala de Socket.IO para recibir eventos en tiempo real de esa conversación
        socketRef.current.emit("joinRoom", { chatRoomId: infoUser.salaID });

        // Cargar historial de mensajes desde el backend (REST)
        api.get(`/chat/messages/${infoUser.salaID}`)
            .then(res => {
                // Adaptamos cada mensaje al formato de la UI
                const formattedMessages = res.data.map(msg => ({
                    text: msg.content, // Texto del mensaje
                    fromMe: msg.senderId === infoUser.userId, // Bandera para estilos (mío/otro)
                    senderId: msg.senderId, // Id del remitente
                    createdAt: msg.createdAt // Marca de tiempo original
                }));
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
            if (data.chatRoomId === infoUser.salaID) {
                // Agregamos el nuevo mensaje al final del historial
                setMessages(prev => [...prev, {
                    text: data.content, // Texto enviado
                    fromMe: data.senderId === infoUser.userId, // ¿Lo envié yo?
                    senderId: data.senderId, // Id del remitente
                    createdAt: new Date() // Marca de tiempo local
                }]);
            }
        };

        // Suscribimos el handler al evento de nuevo mensaje
        socketRef.current.on("newMessage", handleNewMessage);

        // Handler: procesa actualizaciones del estado de intercambio por Socket.IO
        const handleTradeUpdate = (data) => {
            // Si viene especificado el chatRoomId y no corresponde, ignoramos
            if (data?.chatRoomId && data.chatRoomId !== infoUser.salaID) return;
            // Aceptamos dos formatos: data directa o anidada en tradeAgreement
            const status = data?.tradeAgreement || data;
            if (status) setTradeStatus(status);
        };

        // Suscribimos el handler al evento de estado de intercambio
        socketRef.current.on("tradeStatusUpdated", handleTradeUpdate);

        // Cleanup: remover listener al cambiar de chat
        return () => {
            if (socketRef.current) {
                // Eliminamos los listeners para evitar duplicados si cambia la sala
                socketRef.current.off("newMessage", handleNewMessage);
                socketRef.current.off("tradeStatusUpdated", handleTradeUpdate);
            }
        };
    }, [infoUser]);

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

    // Función para obtener el estado actual del intercambio
    const fetchTradeStatus = async () => {
        if (!infoUser?.salaID) return;
        
        try {
            const response = await api.get(`/chat/trade/status/${infoUser.salaID}`);
            setTradeStatus(response.data);
        } catch (error) {
            console.error("Error al cargar estado del intercambio:", error);
        }
    };

    // Fallback: sondeo periódico mientras el intercambio esté pendiente
    useEffect(() => {
        if (!infoUser?.salaID) return;
        if (tradeStatus?.tradeCompleted === 'en_proceso') return; // Dejar de sondear cuando se complete

        const intervalId = setInterval(() => {
            fetchTradeStatus();
        }, 5000); // cada 5s

        return () => clearInterval(intervalId);
    }, [infoUser?.salaID, tradeStatus?.tradeCompleted]);

    // Utilidad: obtiene iniciales a partir del nombre (ej: "Sindy Ospina" -> "SO")
    const getInitials = (name) => { // Calcula iniciales para el avatar (1 o 2 letras)
        if (!name || typeof name !== "string") return "?"; // Fallback cuando no hay nombre
        const parts = name.trim().split(/\s+/); // Divide por espacios múltiples
        const first = parts[0]?.[0] || ""; // Inicial del primer nombre
        const second = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : ""; // Inicial del último apellido
        return `${first}${second}`.toUpperCase(); // Retorna en mayúsculas (ej: "SO")
    };

    const handleSend = () => {
        // Validación: evitar envíos vacíos o sin socket
        if (message.trim() === "" || !socketRef.current) return;

        // Cuerpo del mensaje que espera el backend/Socket.IO
        const payload = {
            chatRoomId: infoUser.salaID, // Sala a la que pertenece el mensaje
            senderId: infoUser.userId, // Remitente (yo)
            content: message.trim() // Contenido del mensaje sin espacios extremos
        };

        socketRef.current.emit("sendMessage", payload); // Emitimos por Socket.IO
        setMessage(""); // Limpiamos el input
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
            }

            changeInfoExchange();
        }
    }, [tradeStatus])

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
            setTradeStatus(response.data);
            
            // Mostrar notificación según el resultado
            if (response.data.tradeCompleted === 'en_proceso') {
                toast.success('¡Intercambio en proceso! Ambos usuarios han aceptado.', {
                    position: "top-center",
                    autoClose: 4000
                });
            } else {
                toast.info(response.data.message, {
                    position: "top-center",
                    autoClose: 3000
                });
            }
            
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

    return (
        <div className="container_chat_private">
            {/* Header: muestra avatar y nombre del otro usuario */}
            <header className="header_chat_private">
                <div className="header_profile_user">
                    {/* Avatar con imagen si existe, o iniciales como fallback */}
                    <Avatar src={avatarSrc} alt={infoUser?.username}> {/* Si no carga la imagen, MUI muestra children */}
                        {getInitials(infoUser?.username)} {/* Iniciales como fallback visual */}
                    </Avatar>
                    {/* Nombre visible del otro usuario */}
                    <h1>{infoUser?.username || "Usuario"}</h1>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Sección de estado del intercambio */}
                        {
                            (() => {
                                // Determinar roles y estados locales
                                const user1Id = tradeStatus?.user1Id;
                                const user2Id = tradeStatus?.user2Id;
                                const iAccepted = tradeStatus ? (Number(user1Id) === Number(currentUserId) ? tradeStatus.user1Accepted : tradeStatus.user2Accepted) : false;
                                const otherAccepted = tradeStatus ? (Number(user1Id) === Number(currentUserId) ? tradeStatus.user2Accepted : tradeStatus.user1Accepted) : false;
                                const bothAccepted = tradeStatus && (tradeStatus.user1Accepted && tradeStatus.user2Accepted);

                                // Caso: intercambio completado (final)
                                if (tradeStatus && tradeStatus.tradeCompleted === 'completado') {
                                    return (
                                        <button className="trade_btn trade_btn--success" disabled>
                                            ✓ Intercambio completado
                                        </button>
                                    );
                                }

                                // Caso: ambos aceptaron → mostrar estado en proceso
                                if (bothAccepted || (tradeStatus && tradeStatus.tradeCompleted === 'en_proceso')) {
                                    return (
                                        <button className="trade_btn trade_btn--success" disabled>
                                            ✓ Intercambio en proceso
                                        </button>
                                    );
                                }

                                // Caso: yo acepté y el otro no → mostrar para mi 'Intercambio en proceso'
                                if (iAccepted && !otherAccepted) {
                                    return (
                                        <button className="trade_btn trade_btn--success" disabled>
                                            ✓ Intercambio en proceso
                                        </button>
                                    );
                                }

                                // Caso: el otro aceptó y yo no → mostrar botón activo para aceptar y texto explicativo
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                    </div>
                                );
                            })()
                        }
                    
                    {/* Icono de opciones del chat (placeholder) */}
                    <MoreVertIcon className="chat_options_icon" style={{ cursor: "pointer" }}/>
                </div>
            </header>

            {/* Sección central con el historial de mensajes */}
            <section className="chat_messages_section">
                <div className="chat_messages_list">
                    {/* Render de cada mensaje con estilo condicional (mío/otro) */}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat_message ${msg.fromMe ? "from_me" : "from_them"}`}>
                            {msg.text}
                        </div>
                    ))}
                    {/* Ancla invisible para auto-scroll al final */}
                    <div ref={messagesEndRef} />
                </div>
            </section>

            {/* Sección de entrada: caja de texto + botón enviar */}
            <section className="chat_input_section">
                <input 
                    type="text" 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} // Actualiza el estado del input
                    placeholder="Escribe tu mensaje..." 
                    className="chat_input" 
                    onKeyDown={(e) => {if (e.key === "Enter") handleSend();}} // Enviar con Enter
                />
                <button className="chat_send_btn">
                    Enviar
                </button>
            </section>
        </div>
    );
};

export default LiveChat;
