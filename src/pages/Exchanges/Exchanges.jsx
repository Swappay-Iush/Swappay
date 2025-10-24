import {useState, useEffect} from "react";
import "./Exchanges.css"

import api from "../../service/axiosConfig"; //Importamos el servicio para comunicarnos con el backend.

//Importamos los stores necesarios.
import { useUserStore } from "../../App/stores/Store"; //Store para la información del usuario.
import { useChatUser } from "../../App/stores/StoreChat"; //Store para la información de los chats.

const Exchanges = () => {

    const [dataUser, setDataUser] = useState([]); //Estado para la información de los usuarios.
    const {id, username} = useUserStore(); //Obtenemos la información del usuario en sesión.
    const {setChat} = useChatUser(); //Obtenemos la información del store de chat.

    useEffect(() => { //Efecto para obtener la información de los usuarios desde el backend.
        const chatRoom = async () => { 
            try {
                const {data} = await api.get("/products") //Petición para obtener los productos.

                setDataUser(data); //Actualizamos el estado con la información obtenida.
            } catch (error) {
                console.log(error);
            }
        }

        chatRoom(); 
    }, []) 

    const usersChat = (value) => { //Función para agregar un nuevo chat al store.
        setChat({ // Agregamos la información del usuario con el que se va a chatear.
            "userId": value.user.id,
            "userImage": value.user.profileImage,
            "username": value.user.username,
            "chat_id": value.user.id //Usamos el ID del usuario como ID de la sala de chat. - CAMBIAR LUEGO.
        })
    }

    return(
        <div style={{margin:"30px"}}>
            {dataUser.map((value, index) => (
                <div key={index} style={{display:"flex", flexDirection:"column"}}>
                    <h1>{value.user.username}</h1>
                    <button style={{width:"150px"}} onClick={() => usersChat(value)}>Solicitar intercambio</button>
                </div>
            ))}
        </div>
    )
}

export default Exchanges;