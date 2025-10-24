import { useState, useEffect } from "react";
import "./UsersChat.css";

import { useChatUser } from "../../../App/stores/StoreChat"; // Importamos el store de chat.
import Avatar from '@mui/material/Avatar'; //Componente para el perfil del usuario

const UsersChat = ({setInfoUser}) => { //Recibimos por props la función para establecer la información del usuario seleccionado.

    const { conversations_users } = useChatUser(); //Obtenemos las conversaciones de los usuarios desde el store.
    const [avatarSrc, setAvatarSrc] = useState(null); // Estado para la imagen del avatar
    const [chatsUsers, setChatsUsers] = useState(conversations_users || []); //Estado para almacenar los usuarios con los que se tiene conversación.

    useEffect(() => { // Efecto para actualizar la lista de chats cuando cambian las conversaciones en el store.
        setChatsUsers(conversations_users);
    }, [conversations_users]);


    useEffect(() => { // Efecto para actualizar la imagen del avatar cuando cambia la información del usuario.
        if (chatsUsers.userImage) { // Verificamos si hay una imagen de usuario disponible.
            setAvatarSrc(`http://localhost:3000/uploads/${value.userImage}`); // Actualizamos la imagen del avatar con la del usuario seleccionado.
        } else {
            setAvatarSrc(null); // Si no hay imagen, establecemos el estado a null para mostrar las iniciales.
        }
    }, [chatsUsers]);

    
    const userSelected = (info) => { //Función para manejar la selección de un usuario.
        setInfoUser({ // Establecemos la información del usuario seleccionado.
            "userImage": info.userImage,
            "username": info.username,
            "salaID": info.chat_id
        })
    }

    const stringAvatar = (name) => { //Función que permite mostrar N cantidad de letras [1 o 2] en la imagen de perfil, según el nombre de usuario.
        const parts = name.split(" ");
        const initials = parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[1][0]}`; 
        return {children: initials,};
    };
    
    return (
        <div className="usersChat-container">
            {chatsUsers.map((value, index) => (
                <div key={index} className="userChat-item" onClick={() => userSelected(value)}>
                <Avatar className="userChat-avatar" src={`http://localhost:3000/uploads/${value.userImage}`} {...(!avatarSrc && stringAvatar(value.username.toUpperCase()))}style={{ cursor: "pointer" }} />

                <div className="userChat-info">
                    <h4>{value.username}</h4>
                </div>
                </div>
            ))}
        </div>
    );
};

export default UsersChat;
