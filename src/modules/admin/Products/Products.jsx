import { useEffect, useState } from "react";
import "./Products.css"

import { FaEdit, FaTrash} from 'react-icons/fa'
import { CiSearch } from "react-icons/ci";
import { GrDocumentText } from "react-icons/gr";

import api from "../../../service/axiosConfig";

import TableInfo from "../../../components/tableInfo/TableInfo";

import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import InfoPopup from "../../../components/InfoPopup/InfoPopup";

import {MenuItem, Select, FormControl } from '@mui/material';

import PublicationOffersDialog from "../../Offers/PublicationOffersDialog/PublicationOffersDialog.jsx";

import PublicationExchangesDialog from "../../Exchanges/PublicatinExchangesDialog/PublicationExchangesDialog.jsx";

const Products = () => {

    const [typeSelected, setTypeSelected] = useState("offers");
    const [dataProducts, setDataProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [infoPopupVisible, setInfoPopupVisible] = useState(false); // Estado para controlar la visibilidad del InfoPopup
    const [visProductExchange, setVisProductExchange] = useState(false);
    const [visProductOffer, setVisProductOffer] = useState(false);
    const [dataProduct, setDataProduct] = useState([]);
    const [deleteProduct, setDeleteProduct] = useState(false);

    const iconView = () => <GrDocumentText/>
    const iconDelete = () => <FaTrash/>
    const iconSearch = () => <CiSearch style={{fontSize:"20px"}}/>

    useEffect(() => {
        const getAllProducts = async () => {
            try {
                setSearchInput("");
                let response;
                setLoading(true);
                if(typeSelected === "exchange"){
                    response = await api.get('/products');
                }else if(typeSelected === "offers"){
                    response = await api.get('/product-offer');
                }
                setDataProducts(Array.isArray(response?.data) ? response.data : []);
            } catch (error) {
                console.log(error)
            }finally{
                setLoading(false);
            }
        }
        getAllProducts();
    }, [typeSelected])

    
    const filteredUsers = dataProducts.filter((product) => {
        const search = searchInput.toLowerCase();
        return (
            product.title?.toLowerCase().includes(search) ||
            product.category?.toLowerCase().includes(search) ||
            product.condition?.toLowerCase().includes(search)
        );
    });

    const handleVisDelete = (idProduct) => {
        setDeleteProduct(idProduct);
        setInfoPopupVisible(true);
    }

    const handleConfirmDelete = async (idProduct) => {
        try {
            if(typeSelected === "offers"){
                await api.delete(`/product-offer/${idProduct}`);
            }else if (typeSelected === "exchange"){
                await api.delete(`/products/${idProduct}`)
            }

            toast.success("¡Producto eliminado exitosamente!", {position: "top-center"});

            setTimeout(() => {
               window.location.reload(); 
            }, 1500);
        } catch (error) {
            console.log(error);
        }
    }

    const handleClose = () => { //Cierra el Popup
        setVisProductOffer(false); // Cierra el popup
        setVisProductExchange(false);
        setDataProduct(null); // Limpia el producto seleccionado
    };

    const handleVisProducts = (infoProduct) => {
        {typeSelected === "offers" ? setVisProductOffer(true) : setVisProductExchange(true)}
        setDataProduct(infoProduct)
    }

    return(
        <div className="container_admin_users">
            <h1 className="title_admin_users" style={{fontFamily:"Outfit"}}>Gestión de productos</h1>
            {loading ? (
                <div>
                    Cargando productos...
                </div>
            ) : (
                <div className="container_table_user">
                    <div className="search_add_user" style={{display: "flex", gap: "1rem", alignItems: "center"}}>
                        <div className="search-input-wrapper" style={{overflow:"hidden", display: "flex", alignItems: "center"}}>
                            {iconSearch()}
                            <input type="text" className="search_input_products" placeholder="Buscar por titulo, categoría o condición..." onChange={(e) => setSearchInput(e.target.value)}/>
                        </div>
                        <FormControl size="small" variant="outlined">
                            <Select
                                value={typeSelected}
                                onChange={e => setTypeSelected(e.target.value)}
                                displayEmpty
                                className="select_section_products"
                            >
                                <MenuItem value="offers" style={{fontFamily:"Outfit"}}>Ofertas</MenuItem>
                                <MenuItem value="exchange" style={{fontFamily:"Outfit"}}>Intercambios</MenuItem>
                            </Select>
                        </FormControl>

                        
                    </div>
                    <div className="container_scroll_table">
                        <TableInfo
                            columns={[
                                { label: "Titulo", key: "title" },
                                { label: "Categoría", key: "category" },
                                { label: typeSelected === "offers" ? "Precio Original" : "Condición", key: typeSelected === "offers" ? "priceOriginal" : "condition" },
                                { label: typeSelected === "offers" ? "Precio en oferta" : "Precio en Swapcoins", key: typeSelected === "offers" ? "priceDiscount" : "priceSwapcoins"},
                                { label: typeSelected === "offers" ? undefined : "Usuario asociado", render: (row) => row.user?.username || undefined},
                                {
                                    label: "Opciones",
                                    key: "actions",
                                    render: (row) =>
                                        <>
                                            <button className="icon-btn edit-btn" title="Visualizar" onClick={() => handleVisProducts(row)}>{iconView()}</button>
                                            <button className="icon-btn delete-btn" title="Eliminar" onClick={() => handleVisDelete(row.id)}>{iconDelete()}</button>
                                        </>
                                }
                            ]}
                            data={filteredUsers}
                            emptyMessage="No se encontraron productos con esa búsqueda."
                            tableClassName="table_admin_users"
                        />
                    </div>
                </div>
            )}

            {infoPopupVisible &&  // Mostramos el InfoPopup para confirmar la eliminación del producto.
                <InfoPopup
                    open={infoPopupVisible}
                    onClose={() => setInfoPopupVisible(false)}
                    title="Confirmar eliminación del producto"
                    message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
                    confirmText="Sí, eliminar producto"
                    cancelText="Cancelar"
                    onConfirm={() => handleConfirmDelete(deleteProduct)}
                    colorConfirm="error"
                />
            }

            {visProductOffer && (
                <PublicationOffersDialog userData={dataProduct} open={visProductOffer} handleClose={handleClose}/>
            )}

            {visProductExchange && (
                <PublicationExchangesDialog dataUser={dataProduct} open={visProductExchange} handleClose={handleClose}/>
            )}

            <div>
                <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/> {/*Paneles informativos de la aplicación.*/}
            </div>
        </div>
    )
}

export default Products;