import { useState, useEffect } from "react";
import "./PublicationExchanges.css";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material"; //MUI
import PublicationExchangesDialog from "../PublicatinExchangesDialog/PublicationExchangesDialog";
import api from "../../../service/axiosConfig"; //Llamamos el back
import iconEmpty from "../../../resources/images/logo.jpg";
import InfoPopup from "../../../components/InfoPopup/InfoPopup";
import { useNavigate } from "react-router-dom";

const PublicationExchanges = ({ textSearch }) => {
  const [dataUser, setDataUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [exchanges, setExchanges] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const navigate = useNavigate();

  //Cargar productos desde backend
  useEffect(() => {
    const getData = async () => {
      try {
        const { data } = await api.get("/products");
        setExchanges(data);
        console.log("Productos cargados:", data);
      } catch (error) {
        console.log("Error cargando productos:", error);
      }
    };
    getData();
  }, []);

  //Permite abrir el dialog
  const handleOpen = async (item) => {

    try {
      const { data: user } = await api.post("/verification/verificationToken");

      const incompleteProfile =
        !user.phone || !user.city || !user.country;

      if (incompleteProfile) {
        setOpenPopup(true);
        return;
      }

      setDataUser(item);
      setOpen(true);

    } catch (error) {
      console.log("Error cargando productos:", error);
    }
  };


  const handleClose = () => {
    setDataUser(null);
    setOpen(false);
  };

  const handleChangeCategory = (e) => setCategory(e.target.value);

  const typeCategories = [
    { id: "", name: "Todas las categorías" },
    { id: "Tecnología", name: "Tecnología" },
    { id: "Deportes", name: "Deportes" },
    { id: "Hogar", name: "Hogar" },
    { id: "Juguetes", name: "Juguetes" },
    { id: "Ropa", name: "Ropa" },
    { id: "Entretenimiento", name: "Entretenimiento" },
    { id: "Libros", name: "Libros" }
  ];

  // Filtrar categoría + búsqueda
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

        <FormControl fullWidth variant="outlined" sx={{ width: "200px" }}>
          <InputLabel id="category-label">Categoría</InputLabel>
          <Select
            labelId="category-label"
            label="Categoría"
            onChange={handleChangeCategory}
            value={category}
          >
            {typeCategories.map((option, index) => (
              <MenuItem key={index} value={option.id}>{option.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {dataFilter.length === 0 ? (
        <div className="info_empty_products">
          <img src={iconEmpty} alt="Sin productos" style={{ height: "100px" }} />
          <h2>No hay intercambios disponibles.</h2>
        </div>
      ) : (

        <section className="section_grid_exchanges">
          {dataFilter.map((item) => (
            <div key={item.id} className="container_product_exchange">

              <div className="tag_exchange">{item.category}</div>

              <img 
                src={`http://localhost:3000${item.image1}`}
                alt={item.title}
                className="img_product_exchange"
              />

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
                  src={
                    item.user?.image
                      ? `${import.meta.env.VITE_BACKEND_URL}${item.user.image}`
                      : iconEmpty
                  }
                  alt="usuario"
                  className="avatar_exchange"
                />
                <span className="user_name_exchange">
                  {item.user?.name || "Usuario"}
                </span>
              </div>

              <button 
                className="button_more_info" 
                onClick={() => handleOpen(item)}
              >
                Ver más detalles
              </button>

            </div>
          ))}
        </section>
      )}

      {open && (
        <PublicationExchangesDialog dataUser={dataUser} open={open} handleClose={handleClose} />
      )}

      <InfoPopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        title="Completa tu perfil"
        message="Para ver los detalles del intercambio debes completar tu información personal."
        confirmText="Ir a configuración"
        onConfirm={() => {
          setOpenPopup(false);
          navigate("/perfil/configuracion");
        }}
      />
    </div>
  );
};

export default PublicationExchanges;
