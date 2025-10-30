import { useEffect, useState } from "react";
import "./PublicationExchanges.css";
import PublicationDialog from "../../publications/PublicationDialog/PublicationDialog";


const PublicationExchanges = () => {

    const [dataUser, setDataUser] = useState(null);
    const [open, setOpen] = useState(false);

    //Simulamos con dos productos
    const Products = [
    {
      id: 1,
      title: "Cámara fotográfica Canon",
      description: "Perfecto estado, incluye estuche y batería extra.",
      category: "Tecnología",
      priceSwapcoins: 250,
      image1: "/img/camara.jpg",
      image2: "/img/camara2.jpg",
      image3: "/img/camara3.jpg",
      condition: "Usado",
      userName: "Laura Martínez",
      deliveryMethod: "Físico",
      ubication: "Medellín, Colombia",
      additionalNotes: "Entrega presencial o envío a acordar.",
    },
    {
      id: 2,
      title: "Libro: El Principito",
      description: "Edición ilustrada en tapa dura.",
      category: "Libros",
      priceSwapcoins: null,
      image1: "/img/libro.jpg",
      condition: "Nuevo",
      userName: "Juan Pérez",
      deliveryMethod: "Digital",
      ubication: "Bogotá, Colombia",
      additionalNotes: "Versión PDF y ePub disponible.",
    }, ];

    //Abre el dialogo con el producto seleccionado
    const handleOpen = (product) => {
        setDataUser(product);
        setOpen(true);
    };

    //Cierra el dialogo
    const handleClose = () => {
        setDataUser(null);
        setOpen(false);
    };

    return (
        <div className="container_general_publications_exchanges">
            <h1 className="title_publications">Intercambios disponibles</h1>


            <section className="section_grid_exchanges">
                {Products.map((item) => (
                     //Se recorre el arreglo de productos con .map() y se genera una card por cada elemento
                    <div key={item.id} className="container_product_exchange"> 
                        <div className="tag_exchange">{item.category}</div> 

                        <img
                            src={`http://localhost:3000${item.image1}`}
                            alt={item.title}
                            className="img_product_exchange"
                        />

                        <h5 className="product_name">{item.title}</h5>
                        <p className="product_description">{item.description}</p>

                        {item.priceSwapcoins && (
                            <span className="price_swapcoins">
                                + {item.priceSwapcoins} SwapCoins
                            </span>
                        )}

                        <button className="button_more_info" onClick={() => handleOpen(item)}> Ver más detalles</button>

                        <button className="button_exchange">Solicitar intercambio</button>
                    </div>
                ))}
            </section>

            {/* Componente modal reutilizado que muestra los detalles del producto seleccionado */}
            {open && (
                <PublicationDialog
                dataUser={dataUser}
                open={open}
                handleClose={handleClose}
                />
            )}
        </div>
    );
 
}

export default PublicationExchanges;