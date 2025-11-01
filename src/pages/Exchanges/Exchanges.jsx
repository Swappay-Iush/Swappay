// Hooks de React para manejar estado local y efectos
import {useState, useEffect} from "react";
// Estilos específicos de la vista de intercambios
import "./Exchanges.css"
// Notificaciones amigables al usuario
import { toast } from "react-toastify";
// Cliente Axios configurado para llamadas al backend
import api from "../../service/axiosConfig";
// Store de sesión para obtener datos del usuario autenticado
import { useUserStore } from "../../App/stores/Store";
// Store de chat para actualizar el listado de conversaciones al crear una sala
import { useChatUser } from "../../App/stores/StoreChat";

const Exchanges = () => {

    const [dataUser, setDataUser] = useState([]); // Productos/usuarios disponibles para solicitar intercambio
    const {id, username} = useUserStore(); // Id y nombre del usuario autenticado
    const {setChat} = useChatUser(); // Acción para agregar una conversación al store local

    useEffect(() => {
        // Carga inicial de productos desde el backend
        const fetchProducts = async () => { 
            try {
                const {data} = await api.get("/products"); // Petición al backend
                setDataUser(data); // Guardamos en estado local
            } catch (error) {
                console.log("Error al cargar productos:", error); // Log de diagnóstico
            }
        }

        fetchProducts(); // Ejecutamos la carga al montar el componente
    }, []) 

    // Acción: crear una sala de chat entre el usuario actual y el dueño del producto
    const usersChat = async (product) => {
        try {
            // Crear sala de chat en el backend
            const response = await api.post("/chat/create-room", {
                user1Id: id, // Solicitante (yo)
                user2Id: product.user.id, // Dueño del producto
                productId: product.id // Producto relacionado
            });

            const { chatRoomId } = response.data; // Id de la sala creada por el backend
            console.log(" Sala de chat creada con ID:", chatRoomId);

            // Agregar al store local para que aparezca inmediatamente en la lista
            setChat({
                userId: product.user.id, // Id del otro usuario
                userImage: product.user.profileImage, // Avatar del otro usuario
                username: product.user.username, // Nombre del otro usuario
                chat_id: chatRoomId // Id de la sala para abrir el chat luego
            });

            // Notificación de éxito al usuario
            toast.success(`Chat creado con ${product.user.username}. Ve a Mensajes para chatear.`, {
                position: "top-center",
                autoClose: 3000
            });

        } catch (error) {
            // Manejo de error en la creación de sala
            console.error("Error al crear sala de chat:", error);
            toast.error(error.response?.data?.message || "Error al iniciar chat", {
                position: "top-center"
            });
        }
    }

    return(
        <div style={{margin:"30px"}}> {/* Listado simple de productos/usuarios */}
            {dataUser.map((value, index) => (
                <div key={index} style={{display:"flex", flexDirection:"column"}}>
                    <h1>{value.user.username}</h1> {/* Nombre del dueño del producto */}
                    <button style={{width:"150px"}} onClick={() => usersChat(value)}>Solicitar intercambio</button> {/* Crea la sala */}
                </div>
            ))}
        </div>
    )
}

export default Exchanges;