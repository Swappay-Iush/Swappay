import { useEffect, useState } from "react";
import "./LiveChat.css";

import MoreVertIcon from "@mui/icons-material/MoreVert";  
import Avatar from '@mui/material/Avatar'; //Componente para el perfil del usuario

//Recibimos por props la información del usuario, los mensajes y la función para enviar mensajes.
const LiveChat = ({ infoUser, messages, onSendMessage }) => { 
    const [message, setMessage] = useState(""); // Estado para el mensaje actual.
    const [avatarSrc, setAvatarSrc] = useState(null); // Estado para la imagen del avatar

    const handleSend = () => { // Función para manejar el envío de mensajes.
        if (message.trim() === "") return; // No enviamos mensajes vacíos.
        onSendMessage(message); // Llamamos a la función pasada por props para enviar el mensaje.
        setMessage(""); // Limpiamos el campo de entrada después de enviar.
    };

    useEffect(() => { // Efecto para actualizar la imagen del avatar cuando cambia la información del usuario.
        if (infoUser.userImage) { // Verificamos si hay una imagen de usuario disponible.
            setAvatarSrc(`http://localhost:3000/uploads/${infoUser.userImage}`); // Actualizamos la imagen del avatar con la del usuario seleccionado.
        } else {
            setAvatarSrc(null); // Si no hay imagen, establecemos el estado a null para mostrar las iniciales.
        }
    }, [infoUser]);
    

    return (
        <div className="container_chat_private">
            <header className="header_chat_private">
                <div className="header_profile_user">
                    <Avatar src={avatarSrc} />
                    <h1>{infoUser.username}</h1>
                </div>

                <MoreVertIcon className="chat_options_icon" style={{ cursor: "pointer" }}/>
            </header>

            <section className="chat_messages_section">
                <div className="chat_messages_list">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`chat_message ${msg.fromMe ? "from_me" : "from_them"}`}>
                            {msg.text}
                        </div>
                    ))}
                </div>
            </section>

            <section className="chat_input_section">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..." className="chat_input" onKeyDown={(e) => {if (e.key === "Enter") handleSend();}}/>
                <button className="chat_send_btn" onClick={handleSend}>
                    Enviar
                </button>
            </section>
        </div>
    );
};

export default LiveChat;
