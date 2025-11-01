import { useState } from "react";
import "./PublicationExchangesDialog.css";
import { Dialog } from "@mui/material";
import { IoMdClose } from "react-icons/io";

const PublicationExchangesDialog = ({ dataUser, open, handleClose }) => {
  if (!dataUser) return null;

  const images = [
    dataUser.image1 && `http://localhost:3000${dataUser.image1}`,
    dataUser.image2 && `http://localhost:3000${dataUser.image2}`,
    dataUser.image3 && `http://localhost:3000${dataUser.image3}`,
  ].filter(Boolean);

  const [newImage, setNewImage] = useState(images[0]);

  const user = dataUser.user || {};
  const userImage = user.image
    ? `http://localhost:3000${user.image}`
    : `https://ui-avatars.com/api/?name=${user.name || "US"}`;

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
            <img src={userImage} className="exchange_userImg" alt="user" />
            <div>
              <p className="exchange_userName">{user.name || "Usuario"}</p>
              <span className="exchange_userLoc">
                {user.city || "Ciudad"}, {user.country || "País"}
              </span>
            </div>
          </div>

          <div className="exchange_buttons_products">
            <button className="button_exchange">Solicitar intercambio</button>
          </div>
        </section>

      </div>
    </Dialog>
  );
};

export default PublicationExchangesDialog;
