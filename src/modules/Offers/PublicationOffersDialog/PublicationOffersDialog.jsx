import { useState } from "react"; 
import "./PublicationOffersDialog.css"

import { Dialog } from "@mui/material"; //Importamos componentes de materialUI a utilizar.

import { MdAddShoppingCart } from "react-icons/md"; //Icono del carro de compras
import { IoMdClose } from "react-icons/io"; //Icono de la X

/*
    userData: Objeto que contiene la información del producto seleccionado.
    open: Estado booleano que indica si el diálogo está abierto o cerrado.
    handleClose: Función para cerrar la ventana.
*/
const PublicationOffersDialog = ({userData, open, handleClose}) => {

    const [newImage, setNewImage] = useState(`http://localhost:3000${userData.img1}`); //Estado para menejar la imágen principal del producto.

    //Iconos 
    const shoppingCart = () => <MdAddShoppingCart className="shoppingCart"/>; //Icono del carrito de compras
    const closeDialog = () => <IoMdClose className="iconClose" onClick={handleClose}/>; //Icono para cerrar la ventana.

    //Arreglo que contiene las imagenes del objeto que llega del back y las filtra para no mostrar las nulas.
    const imagesproducts = [userData.img1, userData.img2, userData.img3].filter(img => img).map(img => ({ img: `http://localhost:3000${img}`, des: userData.title }));


    const changeImage = (image) =>{ //Función que permite el cambio de imágen. 
        setNewImage(image)
    }

    const buttonsDisabled = !userData.availability; //Variable booleanada que actualiza su valor según la disponibilidad de los productos.

    return(
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ style: {borderRadius: '12px', height:"600px",overflow: 'hidden'}}}
            BackdropProps={{ style: { backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)' } }}>
          <div className="container_general_dialog_products">
                <section className="section_img_products">
                        <div className="container_img_category">
                            <h6 className="info_products_category" style={{position:"absolute"}}>{userData.category}</h6>
                            <img src={newImage} alt="Imágen principal" className="img_product_major"/>
                        </div>
                        <div className="container_img_products">
                            {imagesproducts.map((value, index) => (
                                <span key={index} onClick={() => changeImage(value.img)} className="min_img_products" style={{cursor:"pointer"}}>
                                    <img src={value.img} alt={value.des} className="unit_img_products" />
                                </span>
                            ))}
                        </div>
                        <span>{closeDialog()}</span>
                </section>
                <section className="section_info_products">
                        <h1 className="info_products_title">{userData.title}</h1>
                        <p className="info_products_description">{userData.description}</p>
                        <div className="info_pruducts_amount" style={{display:"flex", alignItems:"center", gap:"20px"}}>
                            <h5 className={`info_products_stock ${buttonsDisabled ? "products_stock_soldOut" : ""}`}>{userData.availability ? "Stock" : "Agotado"}</h5>
                            <h5 style={{color:"grey"}}>{userData.amount} unidades disponibles</h5>
                        </div>
                        
                        <div className="info_product_offers">
                            <h6 className="product_offers_discount">${userData.priceDiscount} + {userData.priceSwapcoins} Swapcoins</h6>
                            <div style={{display:"flex", gap: "20px"}} className="product_offers_original">
                                <h6 style={{textDecoration:"line-through", color:"grey"}}>${userData.priceOriginal} </h6>
                                <h6 style={{color:"black", fontWeight:"600"}}>{userData.discount}% OFF</h6>
                            </div>
                        </div>

                        <div className="section--buttons_producs">
                            <button className={`button-shopping-cart ${buttonsDisabled ? "button-disabled" : ""}`} disabled={buttonsDisabled}>{shoppingCart()}Añadir al carrito</button>
                            <button className={`button-buy-now ${buttonsDisabled ? "button-disabled" : ""}`} disabled={buttonsDisabled}>Comprar ahora</button>
                        </div>

                        <div className="section_specs_products">
                            <h5 style={{fontFamily:"Manrope", marginTop:"15px", fontWeight: "600"}}>Especificaciones:</h5>
                            <p className="info_specs_products">{userData.specs}</p>
                        </div>
                </section>
          </div>
        </Dialog>
    )
}

export default PublicationOffersDialog;