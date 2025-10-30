// Importamos hooks de React para efectos, estado y referencias
import { useEffect, useState, useRef } from "react";
// Estilos específicos del componente de chat
import "./LiveChat.css";
// Cliente de Socket.IO para comunicación en tiempo real
import { io } from "socket.io-client";
// Cliente Axios configurado para llamadas al backend
import api from "../../../service/axiosConfig";

// Icono de opciones del chat (no funcional aún)
import MoreVertIcon from "@mui/icons-material/MoreVert";  
// Componente Avatar de MUI para mostrar foto o iniciales
import Avatar from '@mui/material/Avatar';

// Componente principal del chat; recibe infoUser con {salaID, userId, username, userImage}
const LiveChat = ({ infoUser }) => { 
    // Estado controlado del input de mensaje
    const [message, setMessage] = useState("");
    // Estado con el historial y nuevos mensajes de la conversación
    const [messages, setMessages] = useState([]);
    // URL de la imagen del avatar (si no hay, se usan iniciales)
    const [avatarSrc, setAvatarSrc] = useState(null);
    // Referencia estable a la conexión de socket (se mantiene entre renders)
    const socketRef = useRef(null);
    // Referencia al último elemento de la lista para auto-scroll
    const messagesEndRef = useRef(null);

    // Conectar socket una sola vez al montar el componente
    useEffect(() => {
        // Si aún no existe una conexión, la creamos
        if (!socketRef.current) {
            // Inicializa el cliente Socket.IO apuntando al backend
            socketRef.current = io("http://localhost:3000", {
                transports: ['websocket', 'polling'], // Transportes permitidos
                withCredentials: true // Permitir cookies si aplica
            });
            // Log para validar la conexión (el id puede tardar en estar disponible)
            console.log("🔌 Socket conectado:", socketRef.current.id);
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

        // Log informativo con el id de la sala a cargar
        console.log("📥 Cargando chat para sala:", infoUser.salaID);

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
                console.log("✅ Historial cargado:", formattedMessages.length, "mensajes");
            })
            .catch(err => {
                // Si falla la carga, dejamos la conversación vacía y registramos el error
                console.error("❌ Error cargando historial:", err);
                setMessages([]);
            });

        // Handler: procesa mensajes entrantes por Socket.IO
        const handleNewMessage = (data) => {
            console.log("📨 Nuevo mensaje recibido:", data);
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

        // Cleanup: remover listener al cambiar de chat
        return () => {
            if (socketRef.current) {
                // Eliminamos el listener para evitar duplicados si cambia la sala
                socketRef.current.off("newMessage", handleNewMessage);
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
            setAvatarSrc(`http://localhost:3000/uploads/${infoUser.userImage}`);
        } else {
            setAvatarSrc(null);
        }
    }, [infoUser]);

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

        console.log("📤 Enviando mensaje:", payload); // Log de salida
        socketRef.current.emit("sendMessage", payload); // Emitimos por Socket.IO
        setMessage(""); // Limpiamos el input
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

                {/* Icono de opciones del chat (placeholder) */}
                <MoreVertIcon className="chat_options_icon" style={{ cursor: "pointer" }}/>
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
                <button className="chat_send_btn" onClick={handleSend}>
                    Enviar
                </button>
            </section>
        </div>
    );
};

export default LiveChat;
