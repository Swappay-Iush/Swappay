import {useEffect, useState} from "react";
import "./MainHeader.css"

import { BsCoin } from "react-icons/bs"; //Importamos el icono usado para los swappcoins

//Importamos componentes a utilizar desde materialUI
import Avatar from '@mui/material/Avatar'; //Componente para el perfil del usuario
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Logout from '@mui/icons-material/Logout';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonIcon from '@mui/icons-material/Person';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate, useLocation } from "react-router-dom"; //Usamos router-dom para validación y manejo de rutas.
import { useUserStore } from "../../../../../../App/stores/Store"; //Importamos el store.

const MainHeader = () => {

    const navigate = useNavigate(); //Utilizamos esto para navegar entre rutas.
    const location = useLocation(); //Usamos esto para verificar la ruta actual según la URL.
    const {username, logout, profileImageUser, rol, swappcoins } = useUserStore(); //Se obtiene el username, cierre de sesión, imagen del usuario y swappcoins.

    const [anchorEl, setAnchorEl] = useState(null); //Estado que permite cerrar el menu.
    const [buttonSelected, setButtonSelected] = useState(rol === "admin" ? "Usuarios" : "Panel"); //Estado que almacena el botón seleccionado.
    const [loading, setLoading] = useState(true); //Estado para mostrar una carga mientras los datos se traen del back.

    const bsCoin = () => <BsCoin color="#000" fontSize={"20px"}/> //Icono de los Swappcoins.
    
    useEffect (() => { //Actualiza loading si el username está disponible en el store.
        if(username === null){
            setLoading(true);
        }else {
            setLoading(false);
        }
    },[username]);

    const handleAvatarClick = (event) => {setAnchorEl(event.currentTarget);}; //Función que permite desplegar el menu cuando se le da clic al Avatar.

    const stringAvatar = (name) => { //Función que permite mostrar N cantidad de letras [1 o 2] en la imagen de perfil, según el nombre de usuario.
        const parts = name.split(" ");
        const initials = parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[1][0]}`; 
        return {children: initials,};
    };

    const userAction = (sectionRef) => { //Función que permite navegar hacia algunas secciones según el botón seleccionado [Configuración o cerrar sesión].
        setAnchorEl(null);
        navigate(sectionRef)
    }

    const userSections = [ //Arreglo de objetos para mapearlos y mostrar las secciones disponibles.
        {name: "Panel", ref: "/panel"}, 
        {name: "Ofertas", ref: "/ofertas"},
        {name: "Intercambios", ref: "/intercambios"}
    ]

    const adminSections = [
        { name: "Usuarios", ref: "/admin/usuarios" },
        { name: "Productos", ref: "/admin/productos" },
        { name: "Intercambios", ref: "/admin/intercambios" },
        //{ name: "Intercambio y Ventas", ref: "/admin/intercambios_ventas" },
    ];

    const visibleSections = rol === "admin" ? adminSections : userSections;
    const actionRol = rol === "admin";

    const sectionSelected = (nameSection, refNavigate) => { //Función que permite actualizar el botón seleccionado y navegar hacia una ruta correspondiente. 
        setButtonSelected(nameSection);
        navigate(refNavigate)
    }

    useEffect(() => { //Hook que controla el enfoque de las secciones según la ruta correspondiente.
        if (rol === "admin") {
            // Rutas para administrador
            if(location.pathname === "/admin/usuarios") setButtonSelected("Usuarios");
            else if(location.pathname === "/admin/productos") setButtonSelected("Productos");
            else if(location.pathname === "/admin/intercambios") setButtonSelected("Intercambios");
            //else if(location.pathname === "/admin/intercambios_ventas") setButtonSelected("Intercambio y Ventas");
        } else {
            // Rutas para usuario normal
            if(location.pathname === "/panel") setButtonSelected("Panel");
            else if(location.pathname === "/ofertas") setButtonSelected("Ofertas");
            else if(location.pathname === "/intercambios") setButtonSelected("Intercambios");
        }
    }, [location.pathname, rol])

    const userLogout = async () => { //Función que permite cerrar la sesión del usuario.
        try {
           await logout();
            navigate("/ingresar");
        } catch (error) {
            console.log("Error al cerrar sesión", error)
        }
    }

    return (
        <div className="container_Header_panel">
            <section className="sections_header">
                <h1 className="title_header">{rol === "admin" ? "Swappay admin" : "Swappay"}</h1>
                {visibleSections.map((value, index) => ( //Mapeamos el arreglo para mostrar las opciones.
                    <a key={index} onClick={() => sectionSelected(value.name, value.ref)} id={buttonSelected === value.name && visibleSections.some(section => section.ref === location.pathname) ? "buttonSelected_header" : ""}>
                        {value.name}
                    </a>
                ))}
            </section>
            <section className="sections_header">
                {!actionRol && (
                    <div className="swapCoin_header">
                        {bsCoin()} {/*Icono de los swappcoins */}
                        <div className="info_swapcoin">
                            <div className="text_swapcoins">Mis Swappcoins:</div>
                            <div className="value_swapcoins">{swappcoins || 0}</div>
                        </div>
                    </div>
                )}
                <Avatar
                    className="profile_user_header"
                    src={loading ? "Cargando imagen" : profileImageUser}
                    {...stringAvatar(loading ? "Usuario": username.toUpperCase())} //En el Avatar del perfil, se muestran las iniciales del nombre.
                    onClick={handleAvatarClick} //Al darle clic, se despliega el menu con las opciones.
                />
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}> {/*Menu con la lista de opciones por parte del usuario.*/}
                    <MenuItem onClick={() => userAction('/perfil')} style={{fontFamily:"Outfit"}}>
                        <ListItemIcon><PersonIcon/></ListItemIcon>
                        Mi perfil
                    </MenuItem>
                    <MenuItem onClick={() => userAction('/mensajes')} style={{fontFamily:"Outfit"}} >
                        <ListItemIcon><ChatBubbleOutlineIcon/></ListItemIcon>
                        Mensajes
                    </MenuItem>
                    <MenuItem onClick={() => setAnchorEl(null)} style={{fontFamily:"Outfit"}} >
                        <ListItemIcon><HelpOutlineIcon/></ListItemIcon>
                        Ayuda
                    </MenuItem>
                    <MenuItem onClick={() => userLogout()} style={{fontFamily:"Outfit", color:"#f76b6bff"}}>
                        <ListItemIcon><Logout style={{color:"#f76b6bff"}}/></ListItemIcon>
                        Cerrar Sesión
                    </MenuItem>
                </Menu>
            </section>
        </div>
    );
}

export default MainHeader;