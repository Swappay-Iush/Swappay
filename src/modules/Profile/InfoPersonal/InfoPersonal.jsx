import {useState, useEffect} from "react";
import "./InfoPersonal.css"

import { useNavigate, useLocation } from "react-router-dom"; //Activamos la navegación y localicación de las rutas.

import Avatar from '@mui/material/Avatar'; //Componente para el perfil del usuario
import Rating from '@mui/material/Rating'; //Componente para la calificación del usuario.
import Stack from '@mui/material/Stack'; //Componente de layout para organizar las estrellas del usuario.
import { Tooltip } from "@mui/material"; //Componente de Tooltip para la iamgen de perfil.

import { useUserStore } from "../../../App/stores/Store"; //Importamos el store para el manejo de estados globales.
import api from "../../../service/axiosConfig"; //Importamos api para comunicarnos con el backend.

import { toast } from "react-toastify"; //Utilizamos los push informativos.


const InfoPersonal = () => {

    const navigate = useNavigate(); //Usamos navigate para navegar entre las rutas de la aplicación
    const location = useLocation(); //Usamos location para saber en que ruta según la URL nos encontramos.
    const[sectionSelected, setSectionSelected] = useState("Sobre mi"); //Estado que cambia según la sección seleccionada a mostrar.
    const[visButtonConfig, setVisButtonConfig] = useState(true);
    const[avatarSrc, setAvatarSrc] = useState(null); // Estado para la imagen del avatar
    const[loading, setLoading] = useState(true);
    const {username, country, isVerified, id, profileImageUser, setUser, rol} = useUserStore();

    useEffect(() => { //UseEffect que permite cargar todos los datos que vienen del back, para poderlos mostrar.
        if(!isVerified) setLoading(true)  //Si el usuario no esta verificado, muestra el componente de carga, si no, lo oculta
        else setLoading(false)
    }, [isVerified])

    const stringAvatar = (name) => { //Función que permite mostrar N cantidad de letras [1 o 2] en la imagen de perfil, según el nombre de usuario.
        const parts = name.split(" ");
        const initials = parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[1][0]}`; 
        return {children: initials,};
    };


    let valueSections = []

    if(rol === "admin"){
        valueSections = [ //Arreglo de objetos que almacena la información de las 'páginas' correspondientes.
            {name: "Sobre mi", href: "/perfil"},
        ]
    }else{
        valueSections = [ //Arreglo de objetos que almacena la información de las 'páginas' correspondientes.
            {name: "Sobre mi", href: "/perfil"},
            {name: "Mis publicaciones", href: "/perfil/publicaciones"}
        ]
    }

    const changeSection = (name, href) => { //Función que permite el cambio de las rutas.
        setSectionSelected(name)
        navigate(href)
    }

    useEffect(() => { //Hook que actualiza el setter de sectionSelected para el que corresponde con la ruta actual.
        if (location.pathname === "/perfil")setSectionSelected("Sobre mi");
        else if (location.pathname === "/perfil/publicaciones") setSectionSelected("Mis publicaciones");
        else setSectionSelected("")
    }, [location.pathname]);

    useEffect(() => { //Efecto que permite visualizar el botón de configuración según la ruta actual.
        if (location.pathname === "/perfil/configuracion") setVisButtonConfig(false);
        else setVisButtonConfig(true);
    }, [location.pathname]);

    const handleAvatarChange = async (event) => { //Función que permite realizar un cambio de imagen de perfil.
        const file = event.target.files?.[0];  // Obtiene el primer archivo seleccionado en el input.
        if (!file) return;  // Si no se seleccionó ningún archivo, termina la ejecución de la función.

        // Vista previa inmediata
        const reader = new FileReader(); // Crea un objeto FileReader para leer el contenido del archivo seleccionado.
        reader.onload = () => setAvatarSrc(reader.result);// Define la función que se ejecutará cuando FileReader termine de leer el archivo.
        reader.readAsDataURL(file); // Inicia la lectura del archivo como URL de datos (base64), lo que permite mostrar la imagen antes de subirla.


        // Subir al backend
        const formData = new FormData(); // Crea un objeto FormData para enviar datos en formato multipart/form-data, que es necesario para subir archivos al backend.
        formData.append("profileImage", file); // Agrega el archivo seleccionado al FormData con la clave 'profileImage'.

        try {
            // Realiza una solicitud PUT al endpoint del backend para actualizar la imagen de perfil del usuario.
            const { data } = await api.put(`/users/${id}/profile-image`, formData,{headers: { "Content-Type": "multipart/form-data" },});

            setAvatarSrc(`http://localhost:3000/uploads/${data.profileImage}`); // Actualiza el estado local 'avatarSrc' con la URL de la nueva imagen para mostrarla inmediatamente en la interfaz.
            setUser({profileImageUser: `http://localhost:3000/uploads/${data.profileImage}`}); // Actualiza el estado global del usuario para reflejar la nueva imagen de perfil en toda la aplicación.

            toast.success( data.message || "Imagen actualizada.", {position: "top-center"}); //Mensaje informativo de exito.

        } catch (error) {
            console.error("Error al actualizar la imagen", error);
            toast.error( error.response.data.message || "Error al actualizar imagen.", {position: "top-center"});
        }
    };

    const handleAvatarClick = () => { //Función que se llama cuando se le da clic al avatar, disparando el input oculto.
        document.getElementById('avatar-input').click();
    };

    const deleteImage = async () => { //Función para eliminar la imagen del perfil del usuario.
        try {
            await api.delete(`/users/${id}/profile-image`); //Endpoint para eliminar la imagen.
            setUser({ profileImageUser: null }); //Actualizamos el estado global.
            setAvatarSrc(null);
            toast.success("Imagen eliminada con exito.", {position: "top-center"}); //Mensajes de exito
        } catch (error) {
            console.error(error || "Error al eliminar la imagen");
            toast.error( error.response.data.message || "Error al actualizar imagen.", {position: "top-center"});
        }
    };


    return(
        <div className="container_info_profile">
            <section className="Profile_photo">
                <Tooltip title="Cambiar foto de perfil" arrow>
                    <Avatar className="photo_user" src={profileImageUser} {...(!avatarSrc && stringAvatar(loading ? "" : username.toUpperCase()))}onClick={handleAvatarClick} style={{ cursor: "pointer" }} />
                </Tooltip>
                <input id="avatar-input"type="file"accept="image/*"onChange={handleAvatarChange}style={{ display: "none" }}/>
                {profileImageUser &&
                profileImageUser !== "" &&
                profileImageUser !== null &&
                !profileImageUser.endsWith("/null") ? (
                    <a className="button_delete_avatar" onClick={deleteImage}>Eliminar imagen</a>
                ) : null}
            </section>

            <section className="navigate_sections_profile" style={typeof profileImageUser === "string" && !profileImageUser.endsWith("/null") ? {marginTop: "0"} : {marginTop: "10px"}}>
                {valueSections.map((value, index) => (
                    <a key={index} onClick={() => changeSection(value.name, value.href)} id={sectionSelected === value.name ? "equal_option_selected" : ""}>{value.name}</a>
                ))}
            </section>
            <section className="priority_info_user">
                <h5>{loading ? "Usuario" : username}</h5>
                <h5>{loading ? "Pais" : country}</h5>
                <h5>
                    <Stack spacing={1} className="rating_users">
                        <Rating name="half-rating" defaultValue={2.5} precision={0.5} readOnly /> {/*Estrellas de calificación en solo lectura.*/}
                    </Stack>
                </h5>
            </section>
            <section className="action_edit_profile" style={typeof profileImageUser === "string" && !profileImageUser.endsWith("/null") ? {marginTop: "0"} : {marginTop: "10px"}}>
                {visButtonConfig && (
                    <button onClick={() => navigate('/perfil/configuracion')} className="button_edit_profile">Configuración</button>
                )}
            </section>
        </div>
    )
}

export default InfoPersonal;
