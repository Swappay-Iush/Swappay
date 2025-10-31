import { useState } from "react";
import "./PublicationExchangesDialog.css";
import { Dialog } from "@mui/material";     //MUI
import { IoMdClose } from "react-icons/io"; //Icono para cerrar 

const PublicationExchangesDialog = ({ dataUser, open, handleClose }) => {
  
  // SIMULACIÓN — Usuario logueado completo
    const user = {
      phone: "3001234567",
      address: "Calle 45 # 20-10",
      city: "Medellín",
      country: "Colombia"
    };

  //Si se abre sin datos retrna null
  if (!dataUser) return null;

  const images = [
    dataUser.image1 && `http://localhost:3000${dataUser.image1}`,
    dataUser.image2 && `http://localhost:3000${dataUser.image2}`,
    dataUser.image3 && `http://localhost:3000${dataUser.image3}`,
  ].filter(Boolean); //Se eliminan valores falsos

  //Estado para que la imagen principal se visualize grande
  const [newImage, setNewImage] = useState(images[0]);

  //Al seleccionar la imagen secundaria se actualiza a la principal
  const changeImage = (img) => setNewImage(img);

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        style: {
          borderRadius: "12px",
          height: "600px",
          overflow: "hidden",
          position: "relative",
        }
      }}
      BackdropProps={{
        style: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
        }
      }}
    >
      <span className="modalCloseIcon">
        <IoMdClose className="iconClose" onClick={handleClose} />
      </span>

      <div className="container_general_dialog_products">

        <section className="section_img_products">
          <div className="container_img_category">
            <h6 className="info_products_category" style={{ position: "absolute" }}>
              {dataUser.category}
            </h6>

            <img src={newImage} alt="product" className="img_product_major" />
          </div>

          <div className="container_img_products">
            {images.map((img, index) => (
              <span 
                key={index}
                onClick={() => changeImage(img)} 
                className="min_img_products"
                style={{ cursor: "pointer" }}
              >
                <img src={img} className="unit_img_products" alt="product" />
              </span>
            ))}
          </div>
        </section>

        <section className="section_info_products">

          <h1 className="info_products_title">{dataUser.title}</h1>
          <p className="info_products_description">{dataUser.description}</p>

          <div className="info_product_item"><strong>Condición: </strong>{dataUser.conditions}</div>
          <div className="info_product_item"><strong>Cantidad disponible: </strong>{dataUser.amount}</div>
          <div className="info_product_item"><strong>Intercambio por: </strong>{dataUser.interests}</div>

          {dataUser.priceSwapcoins && (
            <div className="product_swapcoins">
              {dataUser.priceSwapcoins} Swapcoins
            </div>
          )}

          <div className="info_product_item"><strong>Método de entrega: </strong>{dataUser.deliveryMethod}</div>
          <div className="info_product_item"><strong>Notas: </strong>{dataUser.additionalNotes}</div>

          <div className="exchange_user_img">
            <img
              src={
                dataUser.userImage
                  ? `http://localhost:3000${dataUser.userImage}`
                  : `foto de perfil${dataUser.userName}`
              }
              className="exchange_userImg"
              alt="user"
            />
            <div>
              <p className="exchange_userName">{dataUser.userName}</p>
              <span className="exchange_userLoc">{dataUser.ubication}</span>
            </div>
          </div>

          <div className="exchange_buttons_products">
            {dataUser.priceSwapcoins ? (
              <>
                <button className="button_cart">Swapcoins</button>
                <button className="button_exchange">Solicitar intercambio</button>
              </>
            ) : (
              <button className="button_exchange">Solicitar intercambio</button>
            )}
          </div>

        </section>
      </div>
    </Dialog>
  );
};

export default PublicationExchangesDialog;
