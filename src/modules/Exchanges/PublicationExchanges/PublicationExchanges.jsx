import { useState, useEffect } from "react";
import "./PublicationExchanges.css";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material"; //MUI
import PublicationExchangesDialog from "../PublicatinExchangesDialog/PublicationExchangesDialog";
import api from "../../../service/axiosConfig"; //Se llama el back
import iconEmpty from "../../../resources/images/logo.jpg"; //Imagen para cuando no halla nada disponible

import InfoPopup from "../../../components/InfoPopup/InfoPopup"; //Importamos popup
import { useNavigate } from "react-router-dom"; 

const PublicationExchanges = ({ textSearch }) => {
  const [dataUser, setDataUser] = useState(null);   //Estado para guardar los productos de intercambio
  const [open, setOpen] = useState(false);          //Estado para almacenar la información del elemento seleccionado para mostrar en el modal
  const [category, setCategory] = useState("");     //Estado para controlar si el modal está abierto o cerrado
  const [exchanges, setExchanges] = useState([]);   //Estado para almacenar la categoría seleccionada del filtro

  //Estado nuevo para Popup de perfil incompleto
  const [openPopup, setOpenPopup] = useState(false);
  const navigate = useNavigate();

  //Se traen los productos de intercambio al cargar
  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await api.get("/products"); //Se llama el endpoint para traer los datos
        setExchanges(data); //Se guarda
      } catch (error) {
        console.log("Error cargando intercambios:", error);
      }
    };
    getData();
  }, []);

  //Función para abrir el dialog con la información del producto
  const handleOpen = async (item) => {
    try {
      const { data: user } = await api.get("/auth/verify"); //Validamos antes de abrir

      //Verificamos si faltan datos de perfil
      const incompleteProfile =
        !user.phone || !user.city || !user.country;

      if (incompleteProfile) {
        setOpenPopup(true); //Mostrar popup
        return; //No abrir dialog
      }

      //Si tiene toda la información se abre el dialog
      setDataUser(item);
      setOpen(true);

    } catch (error) {
      console.log("Error validando usuario:", error);
    }
  };

  //Función para cerrar el dialog
  const handleClose = () => {
    setDataUser(null);
    setOpen(false);
  };

  const handleChangeCategory = (e) => setCategory(e.target.value);   //Función que guarda la categoría seleccionada en el estado

  const typeCategories = [ //Arreglo categorías
    { id: "", name: "Todas las categorías" },
    { id: "Tecnología", name: "Tecnología" },
    { id: "Deportes", name: "Deportes" },
    { id: "Hogar", name: "Hogar" },
    { id: "Juguetes", name: "Juguetes" },
    { id: "Moda", name: "Moda" },
    { id: "Otros", name: "Otros" }
  ];

  //Filtro de categoría y búsqueda
  const dataFilter = exchanges.filter((item) => {
    const filterCategory = category
      ? item.category?.toUpperCase() === category.toUpperCase()
      : true;

    const filterSearch =
      textSearch && textSearch.length > 0
        ? item.title?.toUpperCase().includes(textSearch.toUpperCase())
        : true;

    return filterCategory && filterSearch;
  });

  return (
    <div className="container_general_publications_exchanges">

      <div className="title_filter_info_offers">
        <h1>Intercambios disponibles</h1>

        <FormControl
          variant="outlined"
          fullWidth
          sx={{
            width: "200px",
            "& .MuiInputLabel-root": { fontFamily: "Outfit" },
            "& .MuiSelect-select": { fontFamily: "Manrope", padding: "15px 10px" }
          }}
        >
          <InputLabel id="category-label" style={{ zIndex: "0" }}>
            Categoría
          </InputLabel>

          <Select
            labelId="category-label"
            label="Categoría"
            onChange={handleChangeCategory}
            value={category}
          >
            {typeCategories.map((option, index) => (
              <MenuItem key={index} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {dataFilter.length === 0 ? (
        <div className="info_empty_products">
          <img src={iconEmpty} alt="Sin intercambios" style={{ height: "100px" }} />
          <h2>No hay intercambios disponibles.</h2>
        </div>
      ) : (
        <section className="section_grid_exchanges">
          {dataFilter.map((item) => (
            <div key={item.id} className="container_product_exchange">

              <div className="tag_exchange">{item.category}</div>
              <img src={item.image1} alt={item.title} className="img_product_exchange" />

              <h5 className="product_name">{item.title}</h5>
              <p className="product_description">{item.description}</p>
              <p className="product_exchanges_interest">
                <strong>Intercambio por:</strong> {item.interests}
              </p>

              {item.priceSwapcoins && (
                <span className="price_swapcoins">+ {item.priceSwapcoins} SwapCoins</span>
              )}

              <div className="users_exchanges">
                <img
                  src={item.userImage || `http://localhost:3000${item.userName}`}
                  alt={item.userName}
                  className="avatar_exchange"
                />
                <span className="user_name_exchange">{item.userName}</span>
              </div>

              <button className="button_more_info" onClick={() => handleOpen(item)}> Ver más detalles</button>
            </div>
          ))}
        </section>
      )}

      {open && ( //Se abre el dialog con la información
        <PublicationExchangesDialog
          dataUser={dataUser}
          open={open}
          handleClose={handleClose}
        />
      )}

      <InfoPopup //Popup para completar perfil
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        title="Completa tu perfil"
        message="Para ver los detalles del intercambio debes completar tu información personal."
        confirmText="Ir a configuración"
        cancelText="Cancelar"
        colorConfirm="primary"
        onConfirm={() => {
          setOpenPopup(false);
          navigate("/perfil/configuracion");
        }}
      />
    </div>
  );
};

export default PublicationExchanges;
