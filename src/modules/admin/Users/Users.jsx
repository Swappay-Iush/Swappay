import { useState, useEffect } from "react";
import "./Users.css";

import { FaEdit, FaTrash} from 'react-icons/fa'
import { CiSearch } from "react-icons/ci";

import api from "../../../service/axiosConfig";

import ActionUsers from "./components/ActionUsers/ActionUsers";

const Users = () => {

    const [dataUsers, setDataUsers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [visActionUsers, setVisActionUsers] = useState(false);
    const [typeForm, setTypeForm] = useState("create");

    const iconEdit = () => <FaEdit/>
    const iconDelete = () => <FaTrash/>
    const iconSearch = () => <CiSearch style={{fontSize:"20px"}}/>

    const handleClose = () => {
        setVisActionUsers(false);
    }

    const actionUser = (type, data) =>{
        setTypeForm(type);
        setVisActionUsers(true)
        console.log(data)
    }

    useEffect(() => {
        const getAllUsers = async() => {
            try {
                setLoading(true)
                const {data} = await api.get('/users/AllUsers')
                setDataUsers(data);
                console.log(data);
            } catch (error) {
                console.log(error)
            }finally{
                setLoading(false);
            }
        }

        getAllUsers();
    }, [])

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
                                                <button className="icon-btn edit-btn" title="Editar" onClick={() => actionUser("edit", value)}>{iconEdit()}</button>
                                                <button className="icon-btn delete-btn" title="Eliminar">{iconDelete()}</button>
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
                <ActionUsers open={visActionUsers} handleClose={handleClose} type={typeForm}/>
            )}
        </div>
    )
}

export default Users;