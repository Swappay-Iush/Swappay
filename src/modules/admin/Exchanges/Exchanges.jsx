import { useEffect, useState } from "react";
import "./Exchanges.css"
import api from "../../../service/axiosConfig";

import { CiSearch } from "react-icons/ci";
import { FaTrash} from 'react-icons/fa'
import { BiMessageAdd } from "react-icons/bi";

import TableInfo from "../../../components/tableInfo/TableInfo";
import InfoPopup from "../../../components/InfoPopup/InfoPopup";
import UpdateMessage from "./components/UpdateMessage";

import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

const Exchanges = () => {

    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [infoPopupVisible, setInfoPopupVisible] = useState(false); // Estado para controlar la visibilidad del InfoPopup
    const [dataExchange, setDataExchange] = useState([]);
    const [deleteProductExchange, setDeleteProductExchange] = useState();
    const [selectedRequest, setSelectedRequest] = useState();
    const [visChangeMessage, setVisChangeMessage] = useState(false);

    const iconSearch = () => <CiSearch style={{fontSize:"20px"}}/>
    const iconDelete = () => <FaTrash/>
    const iconMessage = () => <BiMessageAdd/>

    useEffect(() => {
        let isMounted = true;

        const getProductsExchange = async (showLoader = false) => {
            if (showLoader) {
                setLoading(true);
            }

            try {
                const { data } = await api.get(`/chat/trade/all`);
                if (!isMounted) return;

                const normalized = (Array.isArray(data) ? data : []).map((item) => {
                    const chatRoomRaw = item.chatRoom || {};
                    const user1 = chatRoomRaw.user1 || chatRoomRaw.User1 || {};
                    const user2 = chatRoomRaw.user2 || chatRoomRaw.User2 || {};

                    return {
                        ...item,
                        messagesInfo: Array.isArray(item.messagesInfo) ? item.messagesInfo : [],
                        chatRoom: {
                            ...chatRoomRaw,
                            user1,
                            user2,
                        },
                    };
                });

                setDataExchange(normalized);
            } catch (error) {
                if (isMounted) {
                    console.log(error);
                }
            } finally {
                if (showLoader && isMounted) {
                    setLoading(false);
                }
            }
        };

        getProductsExchange(true);
        const intervalId = setInterval(() => getProductsExchange(false), 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const filteredExchange = dataExchange.filter((product) => {
        const search = searchInput.trim().toLowerCase();
        if (!search) {
            return true;
        }

        const user1Name = product.chatRoom?.user1?.username?.toLowerCase() || "";
        const user2Name = product.chatRoom?.user2?.username?.toLowerCase() || "";

        return user1Name.includes(search) || user2Name.includes(search);
    });

    const handleDeleteUser = (idRequest) => {
        setDeleteProductExchange(idRequest)
        setInfoPopupVisible(true);
    }

    const handleConfirmDelete = async (idRequest) => {
        try {
            await api.delete(`/chat/trade/${idRequest}`);
            toast.success("Solicitud eliminada exitosamente!", {position: "top-center"});

            setTimeout(() => {
                handleClose();
               window.location.reload(); 
            }, 1500);
        } catch (error) {
            toast.error("¡Error al eliminar solicitud!", {position: "top-center"});
            console.log(error);
        }
    }

    const handleChangeMessage = (idRequest) =>{
        setVisChangeMessage(true)
        setSelectedRequest(idRequest)
    }

    const handleClose = () => {
        setVisChangeMessage(false);
        setSelectedRequest();
    }

    return(
     <div className="container_admin_users">
            <h1 className="title_admin_users" style={{fontFamily:"Outfit"}}>Gestión de intercambios</h1>
            {loading ? (
                <div>
                    Cargando intercambios...
                </div>
            ) : (
                <div className="container_table_user">
                    <div className="search_add_user">
                        <div className="search-input-wrapper" style={{overflow:"hidden"}}>
                            {iconSearch()}
                            <input type="text" placeholder="Buscar por nombre de usuarios..." onChange={(e) => setSearchInput(e.target.value)}/>
                        </div>
                    </div>
                    <div className="container_scroll_table">
                        <TableInfo
                            columns={[
                                { label: "Usuario 1 - Nombre", render: (row) => row.chatRoom?.user1?.username },
                                { label: "Usuario 1 - Email", render: (row) => row.chatRoom?.user1?.email },
                                { label: "Usuario 1 - Dirección", render: (row) => row.chatRoom?.user1?.address },
                                { label: "Usuario 2 - Nombre", render: (row) => row.chatRoom?.user2?.username },
                                { label: "Usuario 2 - Email", render: (row) => row.chatRoom?.user2?.email },
                                { label: "Usuario 2 - Dirección", render: (row) => row.chatRoom?.user2?.address },
                                { label: "Información del intercambio", render: (row) => Array.isArray(row.messagesInfo) && row.messagesInfo.length > 0 ? row.messagesInfo[row.messagesInfo.length - 1] : "Sin información" },
                                {
                                    label: "Opciones",
                                    key: "actions",
                                    render: (row) => {
                                        const messages = Array.isArray(row.messagesInfo) ? row.messagesInfo : [];
                                        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : "";
                                        const isNegotiation = lastMessage === "En negociación";

                                        const handleEditClick = () => handleChangeMessage(row.chatRoom.id);
                                        const handleDeleteClick = () => handleDeleteUser(row.chatRoom.id);

                                        if (isNegotiation) {
                                            return (
                                                <>
                                                    <button
                                                        className="icon-btn edit-btn"
                                                        title="Actualizar información"
                                                        onClick={handleEditClick}
                                                    >
                                                        {iconMessage()} 
                                                    </button>
                                                    <button
                                                        className="icon-btn delete-btn"
                                                        title="Eliminar"
                                                        onClick={handleDeleteClick}
                                                    >
                                                        {iconDelete()}
                                                    </button>
                                                </>
                                            );
                                        }

                                        return (
                                            <>
                                                <button
                                                    className="icon-btn edit-btn"
                                                    title="Actualizar información"
                                                    onClick={handleEditClick}
                                                >
                                                    {iconMessage()} 
                                                </button>
                                                <button
                                                    className="icon-btn delete-btn"
                                                    title="Eliminar"
                                                    onClick={handleDeleteClick}
                                                >
                                                    {iconDelete()}
                                                </button>
                                            </>
                                        );
                                    }
                                }
                            ]}
                            data={filteredExchange}
                            emptyMessage="No se encontraron intercambios."
                            tableClassName="table_admin_users"
                        />
                    </div>
                </div>
            )}

            {visChangeMessage && ( //Popup para actualizar el mensaje del intercambio.
                <UpdateMessage dataExchange={selectedRequest} open={visChangeMessage} handleClose={handleClose}/>
            )}

            {infoPopupVisible &&  // Mostramos el InfoPopup para confirmar la eliminación del usuario.
                <InfoPopup
                    open={infoPopupVisible}
                    onClose={() => setInfoPopupVisible(false)}
                    title="Confirmar eliminación del intercambio solicitado"
                    message="¿Estás seguro de que deseas eliminar esta solicitud? Esta acción no se puede deshacer."
                    confirmText="Sí, eliminar solicitud"
                    cancelText="Cancelar"
                    onConfirm={() => handleConfirmDelete(deleteProductExchange)}
                    colorConfirm="error"
                />
            }

            <div>
                <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/> {/*Paneles informativos de la aplicación.*/}
            </div>
        </div>
    )
}

export default Exchanges;