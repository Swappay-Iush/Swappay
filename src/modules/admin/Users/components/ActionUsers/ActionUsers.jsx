import { useState, useEffect } from "react";
import "./ActionUsers.css";

import { Dialog, MobileStepper, Button } from "@mui/material";
import {MenuItem, Select, FormControl } from '@mui/material';
import { IoMdEye, IoMdEyeOff  } from "react-icons/io";

import { useForm, Controller } from "react-hook-form";

import api from "../../../../../service/axiosConfig";

import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import { useUserStore } from "../../../../../App/stores/Store";

const ActionUsers = ({dataUser, open, handleClose, type = "create"}) => {

const { register, handleSubmit, formState: { errors }, reset, control } = useForm();

    const [cities, setCities] = useState([]); // Estado para almacenar las ciudades
    const [loading, setLoading] = useState(true); //Estado para visualizar componente de carga.
    const [visPassword, setVisPassowrd] = useState(false); //Estamos para permitir visualizar la contraseña
    const [trueAction, setTrueAction] = useState(false);

    const roles = ["admin", "user", "collaborator"];
    
    const viewPassword = () => <IoMdEye color="#525151ff"/> //Icono de la contraseña visible
    const viewOffPassword = () => <IoMdEyeOff color="#525151ff"/> //Icono de la contraseña no visible

    useEffect(() => {
        if(type === "edit"){
            reset({
                firstname: dataUser.username || "",
                email: dataUser.email || "",
                country: dataUser.country || "",
                rol: dataUser.rol || "",
            });
        } else if(type === "create") {
            reset({
                firstname: "",
                email: "",
                country: "",
                rol: "",
                password: "",
                confirmPassword: ""
            });
        }
    }, [dataUser, type, reset]);

    useEffect(() => { //Hook para hacer una petición al backend y obtener la lista de paises.
        const obtainCountry = async() => {
            try {
                const {data} = await api.get("/users/countries"); //Obtenemos los paises.
                setCities(data);
                setLoading(false)
            } catch (error) {
                setLoading(true)
                console.log("Error al obtener los paises.")
            }
        }
        obtainCountry();
    }, [])

    const onSubmit = async (formData) => {
        const { password, confirmPassword, firstname, email, country, rol, restorePassword} = formData; //Desestructuramos el formulario para acceder a cada propiedad interna del objeto.

        if(type === "create"){
            //Validamos que las contraseñas coincidan.
            if (password !== confirmPassword) {
                toast.error("Las contraseñas no coinciden.", {position: "top-center"});
                return;
            }

           try {
                await api.post('/users', {
                    username: firstname,
                    email: email,
                    country: country,
                    rol: rol,
                    password: password
                })

                toast.success("¡Usuario creado!", {position: "top-center"});
                setTrueAction(true);

                setTimeout(() => {
                    handleClose();
                    window.location.reload();
                }, 2000);
           } catch (error) {
                const mensaje =error.response?.data?.message ||  "Error al registrar usuario";    
                toast.error(mensaje, {position:"top-center"});
                console.error('Error al registrar usuario:', error);
           }
        }

        if(type === "edit"){
            
            try {
                await api.put(`/users/${dataUser.id}`, {
                    username: firstname,
                    email: email,
                    country: country,
                    rol: rol,
                })
            } catch (error) {
                const mensaje=error.response?.data?.message ||  "Error al actualizar usuario";    
                toast.error(mensaje, {position:"top-center"});
                console.error('Error al actualizar usuario:', error);
                return
            }

            if(restorePassword){
               try {
                    await api.put(`/users/${dataUser.id}/reset-password`)
                    toast.success("¡Contraseña restaurada!", {position: "top-center"});
               } catch (error) {
                    const mensaje=error.response?.data?.message ||  "Error al actualizar contraseña";    
                    toast.error(mensaje, {position:"top-center"});
                    console.error('Error al actualizar contraseña:', error);
                    return
               } 
            }

            toast.success("¡Perfil Actualizado!", {position: "top-center"});
            setTrueAction(true);

            setTimeout(() => {
                handleClose();
                window.location.reload();
            }, 2000);
        }
    }
    
    return(
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{style: { width: '400px', maxWidth: '90vw' }}}>
            <div className="dialog_action_users" style={{ height: type === "create" ? "" : "" }}>
                <h1 className="title_dialog_action">{type === "create" ? "Crear usuario" : "Editar usuario"}</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="form_action_users">
                    <input   {...register("firstname", { required: "El nombre es obligatorio", minLength: {value: 3, message: "Minimo 3 Caracteres" },})} placeholder="Nombre completo" minLength={3}
                    className={`form--input ${errors.firstname ? "input-error" : ""}`} pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$" title="Solo letras, mínimo 3 caracteres" type="text"/> {/* Validamos el nombre */}

                    <input {...register("email", { required: true })} autoComplete="off" placeholder="Email"  type="email" className={`form--input ${errors.email ? "input-error" : ""}`}/> {/* Validamos el correo electrónico */}

                    <FormControl fullWidth variant="outlined" className="edit-user-select">
                        <Controller
                            name="country"
                            control={control}
                            rules={{ required: "Debes seleccionar un país" }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    displayEmpty
                                    className={`form--input ${errors.country ? "input-error" : ""}`}
                                    MenuProps={{
                                        PaperProps: { style: { maxHeight: 400, width: 320 } },
                                        disableScrollLock: true,
                                    }}
                                    sx={{'& fieldset': { border: 'none' },fontFamily: "Outfit",textAlign: "left",paddingLeft: 0, 
                                    '.MuiSelect-select': {paddingLeft: "5px !important", fontFamily: "Outfit",textAlign: "left",},
                                    '.MuiMenuItem-root': {fontFamily: "Outfit",textAlign: "left",},}}
                                >
                                    <MenuItem value="" disabled>
                                        <em style={{ fontFamily: "Outfit", fontStyle: "normal", color: "grey" }}>Selecciona el país</em>
                                    </MenuItem>
                                    {loading ? (
                                        <p style={{ color: "grey", fontFamily: "Outfit", textAlign: "center" }}>Cargando paises...</p>
                                    ) : (
                                        cities.map((country) => (
                                            <MenuItem key={country.id} value={country.name} style={{ fontFamily: "Outfit" }}>
                                                {country.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            )}
                        />
                    </FormControl>

                    <FormControl fullWidth variant="outlined" className="edit-user-select">
                        <Controller
                            name="rol"
                            control={control}
                            rules={{ required: "Debes seleccionar un rol" }}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    displayEmpty
                                    className={`form--input ${errors.rol ? "input-error" : ""}`}
                                    MenuProps={{
                                        PaperProps: { style: { maxHeight: 400, width: 320 } },
                                        disableScrollLock: true,
                                    }}
                                     sx={{'& fieldset': { border: 'none' },fontFamily: "Outfit",textAlign: "left",paddingLeft: 0, 
                                    '.MuiSelect-select': {paddingLeft: "5px !important", fontFamily: "Outfit",textAlign: "left",},
                                    '.MuiMenuItem-root': {fontFamily: "Outfit",textAlign: "left",},}}
                                >
                                    <MenuItem value="" disabled>
                                        <em style={{ fontFamily: "Outfit", fontStyle: "normal", color: "grey" }}>Selecciona el rol</em>
                                    </MenuItem>
                                    {roles.map((value) => (
                                        <MenuItem key={value} value={value} style={{ fontFamily: "Outfit" }}>
                                            {value === "admin" ? "Administrador" : value === "user" ? "Usuario" : "Colaborador"}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>

                    {type === "create" ? (
                        <div className="container_passwords_action">
                            <div style={{position:"relative", width:"85%"}}>
                                <span onClick={() => setVisPassowrd(!visPassword)} className="eyeViewPassword">{!visPassword ? viewOffPassword() : viewPassword()}</span>
                                <input   {...register("password", { required: "La contraseña es obligatoria", minLength: {value: 6, message: "Minimo 6 Caracteres" }})} minLength={6} title="Mínimo 6 caracteres"
                                placeholder="Contraseña"  type={!visPassword ? "password" : "text"}  className={`form--input ${errors.password ? "input-error" : ""}`} id="input_register_password"/> {/* Validamos la contraseña */}
                            </div>
                            <input {...register("confirmPassword", { required: true })} placeholder="Confirmar Contraseña" type="password" className={`form--input ${errors.confirmPassword ? "input-error" : ""}`}/> {/* Validamos la confirmación de la contraseña */}
                        </div>
                    ) : (
                        <div className="restore_password_user">
                            Restaurar contraseña:
                            <input {...register("restorePassword", { required: false })} type="checkbox"/> {/* Validamos la confirmación de la contraseña */}
                        </div>
                    )}


                    <div className="buttons_interactive_actions">
                        <button onClick={handleClose} className="btn-cancel" disabled={trueAction}>Cancelar</button>
                        <button type="submit" className="btn-submit" disabled={trueAction}>{type === "create" ? "Crear" : "Actualizar"}</button>
                    </div>
                </form>
            </div>
            <div>
                <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/> {/*Paneles informativos de la aplicación.*/}
            </div>
        </Dialog>
    )
}

export default ActionUsers;