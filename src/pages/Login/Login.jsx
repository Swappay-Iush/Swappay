import {useState, useEffect} from "react";
import "./Login.css" //Importamos los estilos del Login 

//Importamos Toast para los paneles informativos.
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

import { IoClose } from "react-icons/io5"; //Importamos el icono para cerrar la ventana
import { IoMdEye, IoMdEyeOff  } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import api from "../../service/axiosConfig";
import { useUserStore } from "../../App/stores/Store";

import logoSwappay from "../../resources/images/Designer.png";

const Login = () => {

    const navigate= useNavigate();
    const [email, setEmail] = useState(""); //Variable que almacena el email digitado en el imput
    const [password, setPassword] = useState("");//Variable que almacena la contraseña digitada en el imput
    const {setUser, rol} = useUserStore(); //Función del store para actualizar el usuario.
    const [visPassword, setVisPassowrd] = useState(false); //Estado que permite al visualización de la contraseña
    const [changeLogin, setChangeLogin] = useState(false) //Estado que deshabilita el botón de ingresar, luego de enviar una solicitud.
    const iconClose = () => <IoClose className="iconClose" onClick={() => navigate("/")}/> //Icono para cerrar la ventana
    const viewPassword = () => <IoMdEye color="#525151ff"/>
    const viewOffPassword = () => <IoMdEyeOff color="#525151ff"/>

    const handleSubmit = async (e) => { //Fuinción que se llama cuando damos clic al botón de 'Ingresar'
        e.preventDefault(); 

        // Validación básica de campos vacíos
        if (!email.trim() || !password.trim()) {
            toast.error("Correo y contraseña obligatorios", {position: "top-center",autoClose: 2000,hideProgressBar: false,closeOnClick: true,
                pauseOnHover: true,draggable: true, progress: undefined,});
            return;
        }

        try {

            const response = await api.post("/auth/login", { //Usamos el siguiente endpoint para comunicarnos con el backend para iniciar sesión.
                email, 
                password
            })

            const data = response.data;

            setUser(data)
            setChangeLogin(true);
            
            toast.success(`¡Bienvenid@! ${data.username}`, { position: "top-center",autoClose: 1500,hideProgressBar: false,closeOnClick: true,
            pauseOnHover: true,draggable: true,progress: undefined,});

            setTimeout(() => { //Damos una espera de 2 segundos para iniciar sesión.
                {data.rol === "admin" || rol === "admin" ? (
                    navigate("/admin/usuarios")
                ) : (
                    navigate("/panel")
                )}
            }, 2000);
            
        } catch (error) {
            toast.error(error.response?.data?.message || "Error al iniciar sesión", {position:"top-center"});
        }

    };

    return(
        <div className="overlayGeneral">
            <div className="containerGeneralOverlay" id="Logo_Body_Login">
                <div className="containerLogo">
                    <img src={logoSwappay} alt="Logo" className="imgLogo"/> {/*Logo de la aplicación*/}
                    <h1 className="textWelcome">Bienvenid@</h1> 
                    <p className="textDescriptionLogin">Accede a ofertas, intercambia productos y gana monedas en una  plataforma que conecta personas con oportunidades.</p>
                </div>
                
                <section className="containerBodylogin">
                    {iconClose()}{/*Icono para cerrar la ventana emergente.*/}
                    <h2 className="textIniciarSesion">Inicia Sesión</h2>
                    <form onSubmit={handleSubmit} className="formDataLogin"> {/*Formulario para iniciar sesión*/}
                        <div>
                            <h5 className="infoInputLogin">Correo Electrónico:</h5>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="input_Credential"/>
                        </div>
                        <div>
                            <h5 className="infoInputLogin">Contraseña:</h5>
                            <div style={{position:"relative"}}>
                                <input type={`${visPassword ? "text" : "password"}`} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="***********" className="input_Credential"/>
                                <span onClick={() => setVisPassowrd(!visPassword)} className="eyeViewPassword">{!visPassword ? viewOffPassword() : viewPassword()}</span>
                            </div>
                        </div>
                        <div className="btnLoginWelcome">
                            <button className="BtnWelcome" disabled={changeLogin}>Ingresar</button> {/*Botón que llama la función de handleSubmit para el inicio de sesión*/}
                        </div>
                        <div >
                            <hr style={{border: 'none', borderTop: '1px solid #000', margin: '0 0'}} />
                        </div>
                        <div className="infoRegistroLogin">
                            <p>¿No tienes cuenta? <label className="clicRegister" onClick={()=> navigate("/registro")}>Regístrate aquí</label></p> 
                        </div>
                    </form>
                </section>

            </div>
            <div>
            <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/> {/*Paneles informativos de la aplicación.*/}
            </div>
        </div>
    )
}

export default Login;