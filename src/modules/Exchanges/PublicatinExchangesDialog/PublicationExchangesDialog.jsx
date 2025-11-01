import { useState, useEffect } from "react";
import "./PublicationExchangesDialog.css";
import { Dialog } from "@mui/material";
import { IoMdClose } from "react-icons/io";

import Avatar from '@mui/material/Avatar'; //Componente para el perfil del usuario

import { useUserStore } from "../../../App/stores/Store";

// Notificaciones amigables al usuario
import { toast } from "react-toastify";
// Cliente Axios configurado para llamadas al backend
import api from "../../../service/axiosConfig";

// Store de chat para actualizar el listado de conversaciones al crear una sala
import { useChatUser } from "../../../App/stores/StoreChat.js";

import { useNavigate } from "react-router-dom";

const PublicationExchangesDialog = ({ dataUser, open, handleClose }) => {
  if (!dataUser) return null;

  const {id, username} = useUserStore();
  const [loading, setLoading] = useState(true); //Estado para mostrar una carga mientras los datos se traen del back.
  const navigate = useNavigate();

  useEffect (() => { //Actualiza loading si el username está disponible en el store.
      if(username === null){
          setLoading(true);
      }else {
          setLoading(false);
      }
    },[username]);

  const stringAvatar = (name) => { //Función que permite mostrar N cantidad de letras [1 o 2] en la imagen de perfil, según el nombre de usuario.
      const parts = name.split(" ");
      const initials = parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[1][0]}`; 
      return {children: initials,};
  };

  const images = [
    dataUser.image1 && `http://localhost:3000${dataUser.image1}`,
    dataUser.image2 && `http://localhost:3000${dataUser.image2}`,
    dataUser.image3 && `http://localhost:3000${dataUser.image3}`,
  ].filter(Boolean);

  const [newImage, setNewImage] = useState(images[0]);

  const user = dataUser.user || {};

  //Comunicación entre usuarios. 

  const {setChat} = useChatUser(); // Acción para agregar una conversación al store local

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

          setTimeout(() => {
            navigate("/mensajes")
          }, 1000);

      } catch (error) {
          // Manejo de error en la creación de sala
          console.error("Error al crear sala de chat:", error);
          toast.error(error.response?.data?.message || "Error al iniciar chat", {
              position: "top-center"
          });
      }
  }


  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <span className="modalCloseIcon">
        <IoMdClose className="iconClose" onClick={handleClose} />
      </span>

      <div className="container_general_dialog_products">

        <section className="section_img_products">
          <div className="container_img_category">
            <h6 className="info_products_category">{dataUser.category}</h6>
            <img src={newImage} alt="product" className="img_product_major" />
          </div>

          <div className="container_img_products">
            {images.map((img, i) => (
              <span
                key={i}
                onClick={() => setNewImage(img)}
                className={`min_img_products ${newImage === img ? "active" : ""}`}
              >
                <img src={img} className="unit_img_products" alt="thumbnail" />
              </span>
            ))}
          </div>
        </section>

        <section className="section_info_products">
          <h1 className="info_products_title">{dataUser.title}</h1>
          <p className="info_products_description">{dataUser.description}</p>

          <div className="info_product_item">
            <strong>Condición:</strong> {dataUser.condition}
          </div>

          <div className="info_product_item">
            <strong>Cantidad disponible:</strong> {dataUser.amount}
          </div>

          <div className="info_product_item">
            <strong>Intercambio por:</strong> {dataUser.interests}
          </div>

          {dataUser.priceSwapcoins && (
            <div className="product_swapcoins">{dataUser.priceSwapcoins} SwapCoins</div>
          )}

          <div className="info_product_item">
            <strong>Método de entrega:</strong> {dataUser.deliveryMethod}
          </div>

          <div className="info_product_item">
            <strong>Notas:</strong> {dataUser.additionalNotes}
          </div>

          <div className="exchange_user_img">            
              <Avatar
                  className="exchange_userImg"
                  src={loading ? "Cargando imagen" : `http://localhost:3000/uploads/${user.profileImage}`}
                  {...stringAvatar(loading ? "Usuario": user.username.toUpperCase())} 
              />
            <div className="info_user_exchange">
                <span className="exchange_userName">{user.username || "Usuario"}</span>
                <span className="exchange_userLoc">
                  {user.city || "Ciudad"}, {user.country || "País"}
                </span>
            </div>
          </div>

          <div className="exchange_buttons_products">

            {dataUser.priceSwapcoins && (
              <button className="button_pricex">
                Comprar por Swapcoins
              </button>
            )}

            <button className="button_exchange" onClick={() => usersChat(dataUser)}>
              Solicitar intercambio
            </button>

          </div>

        </section>

      </div>
    </Dialog>
  );
};

export default PublicationExchangesDialog;
