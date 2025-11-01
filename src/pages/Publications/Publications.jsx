import { useState, useEffect } from "react";
import "./Publications.css";

import api from "../../service/axiosConfig"; //Importamos api para comunicarnos con el backend.
import { useUserStore } from "../../App/stores/Store"; //Importamos el store para manejar los estados globales.
import { toast } from "react-toastify"; //Utilizamos los push informativos.

import ProductForm from "../../modules/products/ProductForm/ProductForm";

import PublicationDialog from "../../modules/publications/PublicationDialog/PublicationDialog"; //Importamos el componente del popup para ver más detalles de la publicación.

import InfoPopup from "../../components/InfoPopup/InfoPopup";

const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

const Publications = () => { 

  const { id } = useUserStore(); //Traemos el ID del usuario del store.
  const [dataUser, setDataUser] = useState([]); //Estado que almacena los productos del usuario.
  const [open, setOpen] = useState(false); // controla si el popup está abierto
  const [selectedProduct, setSelectedProduct] = useState(null); // producto seleccionado
  const [refresh, setRefresh] = useState(false); //Estado que permite refrescar el componente luego de eliminar un producto.
  const [showModal, setShowModal] = useState(false); //Estado para controlar el modal.
  const [infoPopupVisible, setInfoPopupVisible] = useState(false); // Estado para controlar la visibilidad del InfoPopup
  const [productToDelete, setProductToDelete] = useState(null); // Estado para almacenar el ID del producto a eliminar
  const [editProductData, setEditProductData] = useState(null); // Estado para almacenar la información del producto a editar

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

  const handleConfirmDelete = async(idProduct) => { //Función que permite eliminar un producto.
      try {
          await api.delete(`/products/${idProduct}`) //Llamamos el endpoint para eliminar el producto.
          toast.success("Producto eliminado exitosamente.", {position: "top-center"});  //Mostramos el mensaje de éxito.
          setRefresh(!refresh); //Cambiamos el estado de refresh para que se vuelva a ejecutar el useEffect y refrescar el componente.
      } catch (error) {
          toast.error( error.response.data.message || "Error al eliminar producto.", {position: "top-center"}); //Mostramos el mensaje de error.
      }
  }

  const handleInfoPopup = (idProduct) => { //Función que abre el InfoPopup para confirmar la eliminación del producto.
    setInfoPopupVisible(true);  //Mostramos el InfoPopup.
    setProductToDelete(idProduct);  //Almacenamos el ID del producto a eliminar.
  }

  const editProduct = (infoProduct) => { //Función que abre el modal con el formulario para editar el producto.
    setEditProductData(infoProduct); //Almacenamos la información del producto a editar.
    setShowModal(true) //Mostramos el modal.
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
                <img src={`${API_URL}${value.image1}`} alt={value.title} className="img_productOwner"/> {/* Mostramos la primera imagen del producto */}
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
                    <button className="buttons_swappay" id="button_edit" onClick={() => editProduct(value)}>Editar</button>
                    <button className="buttons_swappay" id="button_delete" onClick={() => handleInfoPopup(value.id)}>Eliminar</button>
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

      {infoPopupVisible &&  // Mostramos el InfoPopup para confirmar la eliminación del producto.
        <InfoPopup
          open={infoPopupVisible}
          onClose={() => setInfoPopupVisible(false)}
          title="Confirmar eliminación del producto"
          message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
          confirmText="Sí, eliminar producto"
          cancelText="Cancelar"
          onConfirm={() => handleConfirmDelete(productToDelete)}
          colorConfirm="error"
        />
      }

      <ProductForm open={showModal} onClose={() => setShowModal(false)} editProductData={editProductData} /> {/*Componente del formulario de producto dentro de un modal*/}
    </div>
  );
};

export default Publications;
