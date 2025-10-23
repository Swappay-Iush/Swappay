import { useEffect, useState } from "react";
import "./PublicationsOffers.css"

import data from "./PublicationOffers.json"

import PublicationOffersDialog from "../PublicationOffersDialog/PublicationOffersDialog"; //Importamos el diálogo para mostrar la información del producto seleccionado.

import iconEmpty from "../../../resources/images/productos.svg" //Importamos la imágen para cuando no haya productos disponibles.

import { MenuItem, Select, FormControl, InputLabel } from '@mui/material'; //Importamos componentes de materialUI a utilizar.

import api from "../../../service/axiosConfig"

//Recibimos la prop textSearch desde la página Offers para filtrar los productos según el texto ingresado en la barra de búsqueda.
const PublicationsOffers = ({textSearch}) => {

    const [dataUser, setDataUser] = useState(); //Estado que almacena la información del producto seleccionado para mostrar en el diálogo.
    const [open, setOpen] = useState(false); //Estado que maneja la visibilidad del diálogo.
    const [category, setCategory] = useState(""); //Estado que almacena la categoría seleccionada en el filtro.
    const [dataOffer, setDataOffer] = useState([]);

    useEffect(() => { //Hook que contiene una función para comunicarnos con el backend y traer los productos con ofertas.
        const getData = async () => { 
            try {
                const {data} = await api.get("/product-offer")  //Llamamos el endpoint para traer las ofertas

                setDataOffer(data); //Actualizamos el estado con el objeto que trae el backend.

            } catch (error) {
                console.log(error) //Manejamos el error en caso de que no se pueda traer las ofertas.
            }
        }

        getData(); //Llamamos la función
    }, [])

    const handleOpen = (userData) => { //Función que abre el diálogo y establece la información del producto seleccionado.
        setDataUser(userData);
        setOpen(true);
    }

    const handleClose = () => { //Función que cierra el diálogo y limpia la información del producto seleccionado.
        setOpen(false);
        setDataUser(null);
    };

    const handleChangeCategoria = (event) => { //Función que actualiza el estado de la categoría seleccionada en el filtro.
        setCategory(event.target.value);
    }

    const typeCategories = [ //Arreglo que contiene las categorías disponibles para el filtro.
        { id: "", name: "Todas las categorias" },
        { id: "Hogar", name: "Hogar" },
        { id: "Juguetes", name: "Juguetes" },
        { id: "Libros", name: "Libros" },
        { id: "Ropa", name: "Ropa" },
        { id: "Tecnología", name: "Tecnología" },
        { id: "Deportes", name: "Deportes" },
        { id: "Entretenimiento", name: "Entretenimiento" }
    ];

    const dataFilter = dataOffer.filter((value) => {  //Filtramos los productos según la categoría seleccionada y el texto de búsqueda ingresado.
        const filterCategory = category ? value.category.toUpperCase() === category.toUpperCase() : true; //Si hay una categoría seleccionada, filtramos por ella; si no, mostramos todas.
        const filterSearch = textSearch && textSearch.length > 0? value.title.toUpperCase().includes(textSearch.toUpperCase()) : true; //Si hay texto de búsqueda, filtramos por él; si no, mostramos todas.

        return filterCategory && filterSearch; 
    });

 

    return (
        <div className="container_general_publications_offers">
            <section className="title_filter_info_offers">
                <h1>{dataFilter.length} ofertas disponibles</h1>
                <FormControl variant="outlined" fullWidth sx={{width:"200px", "& .MuiInputLabel-root": { fontFamily: "Outfit" }, 
                    "& .MuiSelect-select": { fontFamily: "Manrope", padding: "15px 10px" } }} className="filter_category_products">
                            <InputLabel id="category-label" style={{zIndex:"0"}}>Categoría</InputLabel>
                            <Select labelId="category-label" label="Categoría" onChange={handleChangeCategoria} value={category} >
                                {typeCategories.map((values, index) => ( 
                                    <MenuItem key={index} value={values.id} >
                                        {values.name}
                                    </MenuItem>
                                ))}
                            </Select>
                </FormControl>
            </section>
            {dataFilter.length === 0 ? ( //Si no hay productos que coincidan con los filtros, mostramos un mensaje y una imágen indicándolo.
                <div className="info_empty_products">
                    <img src={iconEmpty}  alt="Imágen de categoría sin productos."style={{ height: "100px" }}/>
                    <h2>No hay ofertas disponibles.</h2>
                </div>
            ) : (
                <section className="section_grid_offers">
                    {dataFilter.map((value, index) => (
                        <div key={index} className="container_product_offers">
                            <div className="tag_offer limited">{value.category}</div>
                            <img src={`http://localhost:3000${value.img1}`} alt="imagenProducto" />
                            <h5 className="product_name">{value.title}</h5>
                            <div className="container_price_offers">
                                <span className="price_offers">${value.priceDiscount}</span>
                                <span className="price_original">${value.priceOriginal}</span>
                            </div>
                            <span className="price_swapcoins">
                                + {value.priceSwapcoins} SwapCoins
                            </span>
                            <a className="button_more_info"onClick={() => handleOpen(value)}>Ver más información</a>
                            <button className="button_redeem">Canjear ahora</button>
                        </div>
                    ))}
                </section>
            )}

            {open && ( //Si el estado open es true, mostramos el diálogo con la información del producto seleccionado.
                <PublicationOffersDialog userData={dataUser} open={open} handleClose={handleClose} /> //Pasamos las props necesarias al diálogo.
            )}
        </div>
    )
}

export default PublicationsOffers;