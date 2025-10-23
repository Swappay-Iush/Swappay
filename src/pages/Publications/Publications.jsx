import { useState, useEffect } from "react";
import "./Publications.css";

import api from "../../service/axiosConfig"; //Importamos api para comunicarnos con el backend.
import { useUserStore } from "../../App/stores/Store"; //Importamos el store para manejar los estados globales.
import { toast } from "react-toastify"; //Utilizamos los push informativos.

import ProductForm from "../../modules/products/ProductForm/ProductForm";

import PublicationDialog from "../../modules/publications/PublicationDialog/PublicationDialog"; //Importamos el componente del popup para ver más detalles de la publicación.

const Publications = () => { 
    const { id } = useUserStore(); //Traemos el ID del usuario del store.
    const [dataUser, setDataUser] = useState([]); //Estado que almacena los productos del usuario.
    const [open, setOpen] = useState(false); // controla si el popup está abierto
    const [selectedProduct, setSelectedProduct] = useState(null); // producto seleccionado
    const [refresh, setRefresh] = useState(false); //Estado que permite refrescar el componente luego de eliminar un producto.
    const [showModal, setShowModal] = useState(false); //Estado para controlar el modal.

    useEffect(() => { //Hook que contiene una función para comunicarnos con el backend y traer los productos del usuario.
        const dataProductsUser = async () => {
          try {
              const { data } = await api.get(`/products/${id}`); //Llamamos el endpoint para traer los productos del usuario.
              setDataUser(data); //Actualizamos el estado con los productos del usuario.
          } catch (error) {
              console.error(error); //Manejamos el error en caso de que no se pueda traer los productos.
          }
        };

        dataProductsUser(); //Llamamos la función para que se ejecute.
    }, [id, refresh]); //El efecto se vuelve a ejecutar si cambia el ID del usuario o el estado de refresh.

  
    const handleOpen = (product) => { // Abre el popup con la info de un producto
        setSelectedProduct(product); // Establece el producto seleccionado
        setOpen(true); // Abre el popup
    };

    const handleClose = () => { //Cierra el Popup
        setOpen(false); // Cierra el popup
        setSelectedProduct(null); // Limpia el producto seleccionado
    };

    const deleteProduct = async(idProduct) => { //Función que permite eliminar un producto.
        try {
            await api.delete(`/products/${idProduct}`) //Llamamos el endpoint para eliminar el producto.
            toast.success("Producto eliminado exitosamente.", {position: "top-center"});  //Mostramos el mensaje de éxito.
            setRefresh(!refresh); //Cambiamos el estado de refresh para que se vuelva a ejecutar el useEffect y refrescar el componente.
        } catch (error) {
            toast.error( error.response.data.message || "Error al eliminar producto.", {position: "top-center"}); //Mostramos el mensaje de error.
        }
    }

  return (
    <div className="container_publications_profile">
      <h1 className="title_publications_profile">Mis publicaciones</h1>

      {!dataUser || dataUser.length === 0 ? (
        <section className="container_button_info">
          <h5 className="info_publications_profile">
            No hay publicaciones disponibles.
          </h5>
          <button className="button-create-publications-profile" onClick={() => setShowModal(true)}>
            Crear Publicación
          </button>
        </section>
      ) : (
        <section className="containerGeneral_ProductOwner">
          {dataUser.map((value, index) => (
            <div
              key={index}
              className="containerProductOwner"
            >
              <header className="img_Product">
                <img src={`http://localhost:3000${value.image1}`} alt={value.title} className="img_productOwner"/> {/* Mostramos la primera imagen del producto */}
              </header>
              <section>
                <div className="container_title_product">
                  <h1 className="title_Product">{value.title}</h1>
                </div>
                <div className="container_description_product">
                  <p>{value.description}</p>
                </div>
                <div className="container_open_dialog" >
                    <a className="ancla_open_dialog" onClick={() => handleOpen(value)}>Ver toda la información</a>
                </div>
                <div className="container_button_interactive">
                    <button className="buttons_swappay" id="button_edit">Editar</button>
                    <button className="buttons_swappay" id="button_delete" onClick={() => deleteProduct(value.id)}>Eliminar</button>
                </div>
              </section>
            </div>
          ))}
        </section>
      )}

      {/* Popup con más detalles */}
      {open && (
        <PublicationDialog dataUser={selectedProduct} open={open} handleClose={handleClose}/>
      )}

      <ProductForm open={showModal} onClose={() => setShowModal(false)} /> {/*Componente del formulario de producto dentro de un modal*/}
    </div>
  );
};

export default Publications;
