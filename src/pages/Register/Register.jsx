import {useState, useEffect} from "react";
import "./Register.css" //Importamos los estilos del componente

import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form" // Importamos react-hook-form para el manejo de formularios

import { IoMdEye, IoMdEyeOff  } from "react-icons/io";
import { IoClose } from "react-icons/io5"; //Importamos el icono para cerrar la ventana

//Importamos Toast para los paneles informativos.
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import {MenuItem, Select, FormControl } from '@mui/material';

import api from "../../service/axiosConfig"; //Importamos api para comunicarnos con el backend.

const Register = () => {

    const navigate = useNavigate(); //Usamos navigate para navegar entre rutas.
    
    const viewPassword = () => <IoMdEye color="#525151ff"/> //Icono de la contraseña visible
    const viewOffPassword = () => <IoMdEyeOff color="#525151ff"/> //Icono de la contraseña no visible

    const iconClose = () => <IoClose className="iconCloseRegister" onClick={() => navigate("/")}/> //Icono para cerrar la ventana}
    const [userRegister, setUserRegister] = useState(false); //Estado para validar si el usuario ya esta registrado.
    const [visPassword, setVisPassowrd] = useState(false); //Estamos para permitir visualizar la contraseña
    const [cities, setCities] = useState([]); // Estado para almacenar las ciudades
    const [loading, setLoading] = useState(true); //Estado para visualizar componente de carga.

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

    // Configuramos el hook useForm de react-hook-form, register -> registra inputs
    // handleSubmit -> maneja el envío del formulario, watch -> observa cambios en los campos, errors -> contiene errores de validación
    const {register,handleSubmit, watch, formState: { errors },} = useForm()

    const onSubmit = async (formData) => { // Función que se ejecuta al enviar el formulario

        const { password, confirmPassword, firstName, lastName, email, country} = formData; //Desestructuramos el formulario para acceder a cada propiedad interna del objeto.


        //Validamos que las contraseñas coincidan.
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden.", {position: "top-center"});
            return;
        }

        try {
            await api.post("/users", { //Mandamos los datos del registro de usuario al backend.
                username: `${firstName.trim()} ${lastName.trim()}`, //Concatenamos nombres y apellidos en un solo valor, quitandole los espacios al inicio y al final.
                country,
                email,
                password,
                rol: "admin"
            })

            toast.success("¡Registro completado!", {position: "top-center"});
            setUserRegister(true);

            setTimeout(() => {
                navigate("/ingresar")
            }, 2000);
            
        } catch (error) {
        // Intenta obtener el mensaje del backend
            const mensaje =
                error.response?.data?.message || // Para errores como "El email ya está registrado"  
                "Error al registrar usuario";    

            toast.error(mensaje, {position:"top-center"});
            console.error('Error al registrar usuario:', error);
        }
 
    }
    
    useEffect(() => { // useEffect se encarga de escuchar los errores del formulario y mostrar mensajes con Toast
        if (Object.keys(errors).length > 0) {
            toast.error("Te faltan campos por llenar.", {position: "top-center", autoClose: 2000});
        }
    }, [errors]);

    return(
        <div className="overlayGeneral">
            <div className="containerGeneralOverlay" id="bodyGeneralRegister">
                <div className="containerLogo">
                    <img src="src\resources\images\Designer.png" alt="Logo" className="imgLogo"/> {/*Logo de la aplicación*/}
                    <h1 className="textWelcome">Bienvenid@</h1> 
                    <p className="textDescriptionLogin">Accede a ofertas, intercambia productos y gana monedas en una  plataforma que conecta personas con oportunidades.</p>
                </div>
                
                <section className="containerBodyRegister">
                    {iconClose()}
                   <h2 className="titleSectionRegister">Crea tu cuenta</h2>
                    <form  className="formRegister" autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)} //Manejamos el evento onSubmit del formulario y llamamos a la función onSubmit al enviar el formulario.
                    > 
                        {/* Inputs del formulario de registro */}
                        <div className="inputNameComplet">
                            <input   {...register("firstName", { required: "El nombre es obligatorio", minLength: {value: 3, message: "Minimo 3 Caracteres" },})} placeholder="Nombre" minLength={3}
                            className={`form--input ${errors.firstName ? "input-error" : ""}`} pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$" title="Solo letras, mínimo 3 caracteres" type="text"/> {/* Validamos el nombre */}

                            <input   {...register("lastName", { required: "El apellido es obligatorio", minLength: {value: 3, message: "Minimo 3 Caracteres" }})} placeholder="Apellido" type="text"
                            minLength={3} title="Solo letras, mínimo 3 caracteres" pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$" className={`form--input ${errors.lastName ? "input-error" : ""}`} /> {/* Validamos el apellido */}
                        </div>
                        <input {...register("email", { required: true })} autoComplete="off" placeholder="Email"  type="email" className={`form--input ${errors.email ? "input-error" : ""}`}/> {/* Validamos el correo electrónico */}
                       
                        <FormControl fullWidth variant="outlined" className="edit-user-select">
                            <Select id="country_select" name="country" defaultValue="" displayEmpty
                                {...register("country", { required: "Debes seleccionar un país" })}
                                className={`form--input ${errors.country ? "input-error" : ""}`}
                                //inputProps={{ 'Outfit': 'Selecciona tu país' }}
                                MenuProps={{
                                PaperProps: {style: { maxHeight: 400,   width: 320,    }, },disableScrollLock: true,  }}
                                sx={{'& fieldset': { border: 'none' },}}
                            >
                                <MenuItem value="" disabled>
                                <em style={{fontFamily:"Outfit", fontStyle:"normal", color: "grey"}}>Selecciona tu país</em>
                                </MenuItem>
                                {loading ? (
                                    <p style={{color:"grey", fontFamily:"Outfit", textAlign:"center"}}>Cargando paises...</p>
                                ) : (
                                    cities.map((country) => (
                                    <MenuItem key={country.id} value={country.name} style={{fontFamily:"Outfit"}}>
                                        {country.name}
                                    </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>

                        <div style={{position:"relative", width:"85%"}}>
                            <span onClick={() => setVisPassowrd(!visPassword)} className="eyeViewPassword">{!visPassword ? viewOffPassword() : viewPassword()}</span>
                            <input   {...register("password", { required: "La contraseña es obligatoria", minLength: {value: 6, message: "Minimo 6 Caracteres" }})} minLength={6} title="Mínimo 6 caracteres"
                            placeholder="Contraseña"  type={!visPassword ? "password" : "text"}  className={`form--input ${errors.password ? "input-error" : ""}`} id="input_register_password"/> {/* Validamos la contraseña */}
                        </div>
                        <input {...register("confirmPassword", { required: true })} placeholder="Confirmar Contraseña" type="password" className={`form--input ${errors.confirmPassword ? "input-error" : ""}`}/> {/* Validamos la confirmación de la contraseña */}

                        <button  type="submit" disabled={userRegister} className="btnRegister">
                            Regístrate
                        </button>
                    </form>
                    <div className="infoRegistroLogin" id="infoRegister">
                        <p>¿Ya tienes cuenta? <label className="clicRegister" onClick={()=> navigate("/ingresar")}>Inicia sesión</label></p> 
                    </div>
                </section>

            </div>
            <div>
                <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/> {/*Paneles informativos de la aplicación.*/}
            </div>
        </div>
    )
}

export default Register;