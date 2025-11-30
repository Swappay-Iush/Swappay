
import { useState, useEffect } from "react";
import "./PurchaseHistory.css";

import TableInfo from "../../../components/tableInfo/TableInfo";
import DialogProductInvoice from "./components/DialogProductInvoice";

import { FaTrash } from 'react-icons/fa';
import { CiSearch } from "react-icons/ci";
import { GrDocumentText } from "react-icons/gr";

import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import api from "../../../service/axiosConfig";

import InfoPopup from "../../../components/InfoPopup/InfoPopup";

const PurchaseHistory = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [purchase, setPurchase] = useState();
    const [infoPopupVisible, setInfoPopupVisible] = useState(false); // Estado para controlar la visibilidad del InfoPopup
    const [searchInput, setSearchInput] = useState("");
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    const iconView = () => <GrDocumentText/>;
    const iconDelete = () => <FaTrash/>;
    const iconSearch = () => <CiSearch style={{fontSize:"20px"}}/>;

    
    useEffect(() => {
        const fetchPurchases = async () => {
            setLoading(true);
            try {
                // Cambia la ruta por la que corresponda a tu API de historial de compras
                const {data} = await api.get("/products-purchased");
                setPurchases(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchPurchases();
    }, []);

    const handleVisProducts = (purchase) => {
        setSelectedPurchase(purchase);
        setShowInvoice(true);
    };

    const handleCloseInvoice = () => {
        setShowInvoice(false);
        setSelectedPurchase(null);
    };

    const viewDeleteProduct = (id) => {
        setPurchase(id);
        setInfoPopupVisible(true);
    }

    const handleConfirmDelete = (id) => {
        try {
            api.delete(`/products-purchased/${id}`);

            toast.success("Venta eliminada exitosamente!", {position: "top-center"});

            setTimeout(() => {
                window.location.reload(); 
            }, 1500);
        } catch (error) {
            toast.error("¡Error al eliminar venta!", {position: "top-center"});
            console.log("Error al eliminar venta.", error)  
        }

        console.log("Eliminar compra con id:", id);
    };

    const filteredPurchases = purchases.filter((purchase) => {
        const search = searchInput.toLowerCase();
        // Filtra por nombre del producto o nombre del cliente.
        const clientUsername = purchase.idClient && purchase.idClient.username ? purchase.idClient.username.toLowerCase() : "";
        // Si tienes productos y quieres buscar por título de alguno:
        let productTitle = "";
        if (purchase.idsProducts && Array.isArray(purchase.idsProducts)) {
            productTitle = purchase.idsProducts.map(p => p.title?.toLowerCase() || "").join(" ");
        }
        return (
            productTitle.includes(search) ||
            clientUsername.includes(search)
        );
    });

    return (
        <div className="container_admin_users">
            <h1 className="title_admin_users" style={{fontFamily:"Outfit"}}>Historial de compras realizadas</h1>
            {loading ? (
                <div>Cargando historial...</div>
            ) : (
                <div className="container_table_user">
                    <div className="search_add_user" style={{display: "flex", gap: "1rem", alignItems: "center"}}>
                        <div className="search-input-wrapper" style={{overflow:"hidden", display: "flex", alignItems: "center"}}>
                            {iconSearch()}
                            <input
                                type="text"
                                className="search_input_products"
                                placeholder="Buscar por nombre del producto o nombre del cliente..."
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="container_scroll_table">
                        <TableInfo
                            columns={[
                                { label: "Id Compra", key: "idBuys" },
                                { label: "Total Productos", key: "totalProducts" },
                                { label: "Precio pagado", key: "FullPayment" },
                                { label: "Swapcoins pagados", key: "FullSwapcoins" },
                                { label: "Nombre cliente", key: "idClient",
                                    render: (row) => row.client && row.client.username ? row.client.username : "-"
                                },
                                 {
                                    label: "Opciones",
                                    key: "actions",
                                    render: (row) => (
                                        <>
                                            <button className="icon-btn edit-btn" title="Visualizar factura" onClick={() => handleVisProducts(row)}>{iconView()}</button>
                                            <button className="icon-btn delete-btn" title="Eliminar" onClick={() => viewDeleteProduct(row.idBuys)}>{iconDelete()}</button>
                                        </>
                                    )
                                }
                            ]}
                            data={filteredPurchases}
                            emptyMessage="No se encontraron compras con esa búsqueda."
                            tableClassName="table_admin_users"
                        />
                    </div>
                </div>
            )}
            
            {showInvoice && (<DialogProductInvoice data={selectedPurchase} onClose={handleCloseInvoice}/>)}

            {infoPopupVisible &&  // Mostramos el InfoPopup para confirmar la eliminación del usuario.
                <InfoPopup
                    open={infoPopupVisible}
                    onClose={() => setInfoPopupVisible(false)}
                    title="Confirmar eliminación de venta"
                    message="¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer."
                    confirmText="Sí, eliminar venta"
                    cancelText="Cancelar"
                    onConfirm={() => handleConfirmDelete(purchase)}
                    colorConfirm="error"
                />
            }

            <div>
                <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/> {/*Paneles informativos de la aplicación.*/}
            </div>
        </div>
    );
}

export default PurchaseHistory;