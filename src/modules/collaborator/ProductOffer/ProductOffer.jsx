
import { useState, useEffect } from "react";
import "./ProductOffer.css";

import { FaTrash, FaEdit } from 'react-icons/fa';
import { CiSearch } from "react-icons/ci";
import { GrDocumentText } from "react-icons/gr";

import api from "../../../service/axiosConfig";
import TableInfo from "../../../components/tableInfo/TableInfo";
import { toast, ToastContainer } from 'react-toastify';
import InfoPopup from "../../../components/InfoPopup/InfoPopup";
import { useUserStore } from "../../../App/stores/Store";

import PublicationOffersDialog from "../../Offers/PublicationOffersDialog/PublicationOffersDialog";

const ProductOffer = () => {

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [infoPopupVisible, setInfoPopupVisible] = useState(false);
    const [visProductOffer, setVisProductOffer] = useState(false);
    const [dataProduct, setDataProduct] = useState([]);
    const [deleteProduct, setDeleteProduct] = useState(0);
    const [searchInput, setSearchInput] = useState("");
    const {id} = useUserStore();

    const iconView = () => <GrDocumentText/>;
    const iconDelete = () => <FaTrash/>;
    const iconEdit = () => <FaEdit/>
    const iconSearch = () => <CiSearch style={{fontSize:"20px"}}/>;

    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/product-offer/user/${id}`);
                setOffers(Array.isArray(response?.data) ? response.data : []);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    const filteredOffers = offers.filter((offer) => {
        const search = searchInput.toLowerCase();
        // Filtra por texto en título, categoría o estado de stock
        const stockText = offer.availability ? "disponible" : "agotado";
        return (
            offer.title?.toLowerCase().includes(search) ||
            offer.category?.toLowerCase().includes(search) ||
            stockText.includes(search)
        );
    });

    const handleVisProducts = (infoProduct) => {
        setDataProduct(infoProduct)
        setVisProductOffer(true)
    }

    const handleClose = () => { //Cierra el Popup
        setVisProductOffer(false); // Cierra el popup
        setDataProduct(null); // Limpia el producto seleccionado
    };

    const viewDeleteProduct = (idProduct) => {
        setDeleteProduct(idProduct);
        setInfoPopupVisible(true);
    }

    const handleConfirmDelete = async (idProduct) => {
        try {
            await api.delete(`/product-offer/${idProduct}`);
            toast.success("¡Oferta eliminada exitosamente!", {position: "top-center"});

            setTimeout(() => {
               window.location.reload(); 
            }, 1500);
        } catch (error) {
            toast.error("¡Error al eliminar oferta!", {position: "top-center"});
            console.log("Error al eliminar oferta.", error)            
        }
    }

    return (
        <div className="container_admin_users">
            <h1 className="title_admin_users" style={{fontFamily:"Outfit"}}>Productos en oferta</h1>
            {loading ? (
                <div>Cargando ofertas...</div>
            ) : (
                <div className="container_table_user">
                    <div className="search_add_user" style={{display: "flex", gap: "1rem", alignItems: "center"}}>
                        <div className="search-input-wrapper" style={{overflow:"hidden", display: "flex", alignItems: "center"}}>
                            {iconSearch()}
                            <input
                                type="text"
                                className="search_input_products"
                                placeholder="Buscar por título, categoría o stock..."
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                        <button id="button-add-offers">Agregar oferta</button>
                    </div>
                    <div className="container_scroll_table">
                        <TableInfo
                            columns={[
                                { label: "Título", key: "title" },
                                { label: "Categoría", key: "category" },
                                {label: "Stock", key: "availability",
                                    render: (row) => (
                                        <span className={`info_offers_stock ${!row.availability ? "offers_stock_soldOut" : ""}`}>{row.availability ? "Disponible" : "Agotado"}</span>
                                    )
                                },
                                { label: "Cantidad disponible", key: "amount" },
                                { label: "Precio Original", key: "priceOriginal" },
                                { label: "Precio en oferta", key: "priceDiscount" },
                                { label: "% de descuento", key: "discount" },
                                { label: "Total Swapcoins", key: "priceSwapcoins" },
                                {
                                    label: "Opciones",
                                    key: "actions",
                                    render: (row) => (
                                        <>
                                            <button className="icon-btn edit-btn" title="Visualizar" onClick={() => handleVisProducts(row)}>{iconView()}</button>
                                            <button className="icon-btn edit-btn" title="Editar">{iconEdit()}</button>
                                            <button className="icon-btn delete-btn" title="Eliminar" onClick={() => viewDeleteProduct(row.id)}>{iconDelete()}</button>
                                        </>
                                    )
                                }
                            ]}
                            data={filteredOffers}
                            emptyMessage="No se encontraron ofertas con esa búsqueda."
                            tableClassName="table_admin_users"
                        />
                    </div>
                </div>
            )}

            {infoPopupVisible &&  // Mostramos el InfoPopup para confirmar la eliminación del usuario.
                <InfoPopup
                    open={infoPopupVisible}
                    onClose={() => setInfoPopupVisible(false)}
                    title="Confirmar eliminación de oferta"
                    message="¿Estás seguro de que deseas eliminar esta oferta? Esta acción no se puede deshacer."
                    confirmText="Sí, eliminar oferta"
                    cancelText="Cancelar"
                    onConfirm={() => handleConfirmDelete(deleteProduct)}
                    colorConfirm="error"
                />
            }

            {visProductOffer && (
                <PublicationOffersDialog userData={dataProduct} open={visProductOffer} handleClose={handleClose}/>
            )}

            <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/>
        </div>
    );
}

export default ProductOffer;