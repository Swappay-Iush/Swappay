import { useState, useEffect } from "react";
import "./DeleteProfile.css"

import { useForm } from "react-hook-form";//Importamos el hook de formulario para manejar el valor de la contraseña
import {Typography, TextField, Button} from '@mui/material'; //Importamos componentes de materialUI a utilizar.

import { useUserStore } from "../../../App/stores/Store"; //Importamos el store para manejar los estados globales.
import api from "../../../service/axiosConfig"; //Importamos api, para luego tener comunicación con el backend.

import InfoPopup from "../../../components/InfoPopup/InfoPopup"; //Importamos la ventana emergente de confirmación para eliminar el perfil.

import { useNavigate } from "react-router-dom"; //Importamos useNavigate para el manejo de rutas.
import { toast } from "react-toastify"; //Importamos los push para los mensajes informativos.

const DeleteProfile = () => {

    const navigate = useNavigate(); //Usamos navigate para navegar entre rutas.
    const { register, handleSubmit, control } = useForm(); //Usamos ciertas propiedades que contiene el hook de useForm.
    const[visInfoPopup, setVisInfoPopup] = useState(false); //Estado que permite la visualización de la ventana emergente.
    const {id} = useUserStore(); //Traemos el ID del usuario del store.

    const onSubmit = async(formData) => { //Formulario que se llama cuando se envia el formulario.

        const {password} = formData; //Desestructuramos el objeto para tener la contraseña.

        try {
            //Se llama el endpoint para validar contraseña y en caso de no ser correcta, se le indica con un mensaje.
            await api.post(`/verification/${id}/validatePassword`, {
                password
            })

            setVisInfoPopup(true)
        } catch (error) {
            console.log("Error con la contraseña", error)
            toast.error(error.response.data.message || "Error con la contraseña", {position: "top-center"});
        }


    }

    const handleConfirmDelete = async() => { //Función que se llama cuando se le da clic al botón de confirmación de la ventana emergente.
        //Si la ventana de confirmación, devuelve un true, se llama el endpoint para eliminar usuario.
        try {
            const {data} = await api.delete(`/users/${id}`) //Se manda la petición para eliminar el usuario.
            toast.success( data.message || "Usuario Eliminado.", {position: "top-center"});

            setTimeout(() => {
                navigate('/'); //Luego de eliminado el usuario, lo regresamos al panel informativo de la aplicación
            }, 1000);
        } catch (error) {
            toast.error(error.response.data.message || "Error al eliminar usuario.", {position: "top-center"});
            console.log(error)
        }
        setVisInfoPopup(false)
    };
    
    return(
        <div className="container_delete_account">
            <Typography variant="h6" style={{fontFamily:"Outfit"}}>Eliminar Cuenta</Typography>
            <form onSubmit={handleSubmit(onSubmit)} className="form_delete_user">
                <Typography variant="h6" style={{fontFamily:"Outfit"}} className="info_delete_account">Si deseas eliminar la cuenta, digita tu contraseña:</Typography>
                <TextField {...register("password", { required: true })} className="input_delete_user" label="Contraseña:" placeholder="***********" type="password" required sx={{ "& .MuiInputLabel-root": { fontFamily: "Outfit" }, "& .MuiInputBase-input": { fontFamily: "Manrope" } }} />
                <Button variant="contained" type="submit" className="button-delete-user" color="error">Eliminar cuenta</Button>
            </form>

            {visInfoPopup && ( //Si visInfoPopup es verdadero, mostramos la ventana emergente y le mandamos mediante props los valores que se requieren mostrar.
                <InfoPopup
                    open={visInfoPopup}
                    onClose={() => setVisInfoPopup(false)}
                    title="Confirmar eliminación de cuenta"
                    message="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer. Se eliminarán todos tus datos de forma permanente."
                    confirmText="Sí, eliminar cuenta"
                    cancelText="Cancelar"
                    onConfirm={handleConfirmDelete}
                    colorConfirm="error"
                />
            )}
        </div>
    )
}

export default DeleteProfile;