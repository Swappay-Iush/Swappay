import { useState, useEffect } from "react";
import "./Users.css";

import { FaEdit, FaTrash} from 'react-icons/fa'
import { CiSearch } from "react-icons/ci";

import api from "../../../service/axiosConfig";

import ActionUsers from "./components/ActionUsers/ActionUsers";

import InfoPopup from "../../../components/infoPopup/infoPopup";

import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import { useUserStore } from "../../../App/stores/Store";

const Users = () => {
    const {rol} = useUserStore();
    const [dataUsers, setDataUsers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [visActionUsers, setVisActionUsers] = useState(false);
    const [typeForm, setTypeForm] = useState("create");
    const [selectedUser, setSelectedUser] = useState([]);
    const [infoPopupVisible, setInfoPopupVisible] = useState(false); // Estado para controlar la visibilidad del InfoPopup
    const [deleteUser, setDeleteUser] = useState()

    const iconEdit = () => <FaEdit/>
    const iconDelete = () => <FaTrash/>
    const iconSearch = () => <CiSearch style={{fontSize:"20px"}}/>

    useEffect(() => {
        const getAllUsers = async() => {
            try {
                setLoading(true)
                const {data} = await api.get('/users/AllUsers')
                setDataUsers(data);
            } catch (error) {
                console.log(error)
            }finally{
                setLoading(false);
            }
        }

        getAllUsers();
    }, [])

    const handleClose = () => {
        setVisActionUsers(false);
    }

    const actionUser = (type, data) => {
        setTypeForm(type);
        setVisActionUsers(true)
        setSelectedUser(data);
    }

    const handleDeleteUser = (idUser) => {
        setDeleteUser(idUser)
        setInfoPopupVisible(true);
    }

    const handleConfirmDelete = async (idUser) => {
        try {
            await api.delete(`/users/${idUser}/admin-delete`);
            toast.success("¡Usuario eliminado exitosamente!", {position: "top-center"});

            setTimeout(() => {
               window.location.reload(); 
            }, 1500);
        } catch (error) {
            toast.error("¡Error al eliminar usuario!", {position: "top-center"});
            console.log("Error al eliminar usuario.", error)            
        }
    }

    const filteredUsers = dataUsers.filter((user) => {
        const search = searchInput.toLowerCase();
        return (
            user.username?.toLowerCase().includes(search) ||
            user.email?.toLowerCase().includes(search) ||
            user.country?.toLowerCase().includes(search)
        );
    });


    return(
        <div className="container_admin_users">
            <h1 className="title_admin_users" style={{fontFamily:"Outfit"}}>Gestión de Usuarios</h1>
            {loading ? (
                <div>
                    Cargando usuarios...
                </div>
            ) : (
                <div className="container_table_user">
                    <div className="search_add_user">
                        <div className="search-input-wrapper" style={{overflow:"hidden"}}>
                            {iconSearch()}
                            <input type="text" placeholder="Buscar por nombre, correo o nacionalidad..." onChange={(e) => setSearchInput(e.target.value)}/>
                        </div>
                        <button onClick={() => actionUser("create")}>Agregar Usuario</button>
                    </div>
                    <div className="container_scroll_table">
                        <table className="table_admin_users">
                            <thead>
                                <tr>
                                    <th>Nombre Completo</th>
                                    <th>Correo</th>
                                    <th>Nacionalidad</th>
                                    <th>Rol</th>
                                    <th>Opciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((value, index) => (
                                        <tr key={index}>
                                            <td>{value.username}</td>
                                            <td>{value.email}</td>
                                            <td>{value.country}</td>
                                            <td>{value.rol === "user" ? "Usuario" : "Administrador"}</td>
                                            <td>
                                                {!(rol === "admin" && value.email === useUserStore.getState().email) && (
                                                    <>
                                                        <button className="icon-btn edit-btn" title="Editar" onClick={() => actionUser("edit", value)}>{iconEdit()}</button>
                                                        <button className="icon-btn delete-btn" title="Eliminar" onClick={() => handleDeleteUser(value.id)}>{iconDelete()}</button>
                                                    </>
                                                )}
                                            </td>

                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{fontFamily:"Manrope"}}>No se encontraron usuarios con esa búsqueda.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {visActionUsers && (
                <ActionUsers dataUser={selectedUser} open={visActionUsers} handleClose={handleClose} type={typeForm}/>
            )}


             {infoPopupVisible &&  // Mostramos el InfoPopup para confirmar la eliminación del usuario.
                <InfoPopup
                    open={infoPopupVisible}
                    onClose={() => setInfoPopupVisible(false)}
                    title="Confirmar eliminación del usuario"
                    message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
                    confirmText="Sí, eliminar usuario"
                    cancelText="Cancelar"
                    onConfirm={() => handleConfirmDelete(deleteUser)}
                    colorConfirm="error"
                />
            }

            <div>
                <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/> {/*Paneles informativos de la aplicación.*/}
            </div>
        </div>
    )
}

export default Users;