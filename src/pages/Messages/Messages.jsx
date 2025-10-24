import { useState, useEffect } from "react";
import "./Messages.css"

//Importamos los modulos a utilizar.
import LiveChat from "../../modules/Messages/LiveChat/LiveChat";
import UsersChat from "../../modules/Messages/UsersChat/UsersChat";

// Importamos el store para manejar las conversaciones de los usuarios.
import { useChatUser } from "../../App/stores/StoreChat"; 

const Messages = () => {

    const [infoUser, setInfoUser] = useState(null); //Estado para la información del usuario con el que se va a chatear.
    const [messagesByUser, setMessagesByUser] = useState({}); //Estado para almacenar los mensajes por usuario.
    const { conversations_users } = useChatUser(); //Obtenemos las conversaciones de los usuarios desde el store.

    // Función para manejar el envío de mensajes.
    const handleSendMessage = (userId, message) => { 
        setMessagesByUser(prev => ({...prev, // Mantenemos los mensajes previos.
            [userId]: [...(prev[userId] || []), { text: message, fromMe: true }] // Agregamos el nuevo mensaje.
        }));
    };

    const noChats = !conversations_users || conversations_users.length === 0; // Verificamos si no hay chats disponibles.
     
    return(
        <div className="container_general_chats_users">
            <div className="container_chats_users"> 
                {!noChats ? ( // Si hay chats disponibles, mostramos el componente UsersChat.
                   <UsersChat setInfoUser={setInfoUser}/>
                ) : (
                    <div className="usersChat-container" id="info_no_chats">No hay chats disponibles por el momento.</div>
                )}
                {infoUser ? ( // Si se ha seleccionado un usuario, mostramos el componente LiveChat.
                    <LiveChat
                        infoUser={infoUser}
                        messages={messagesByUser[infoUser.salaID] || []}
                        onSendMessage={msg => handleSendMessage(infoUser.salaID, msg)}
                    />
                ) : (
                    <div className="info_select_chat">Selecciona un chat para comenzar una conversación.</div>
                )}
            </div>
        </div>
    )
}

export default Messages;
