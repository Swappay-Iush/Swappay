import { useState } from "react";
import "./AboutMe.css"

import { useUserStore } from "../../../App/stores/Store";

const AboutMe = () => {
    
    const {email, userInfo, rol} = useUserStore();
    const [infoUser, setInfoUser] = useState([ //Se crea el estado que contiene todos los valores que luego llegaran del servicio para mostrar más información del usuario.
        {nameInfo: "Fecha de nacimiento: ", valueInfo: userInfo.dateBirth || "Sin información"},
        {nameInfo: "Correo: ", valueInfo: email || "Sin información"},
        {nameInfo: "Genero: ", valueInfo: userInfo.gender || "Sin información"},
        {nameInfo: "Dirección: ", valueInfo: userInfo.address || "Sin información"},
        {nameInfo: "Ciudad: ", valueInfo: userInfo.city || "Sin información"},
        {nameInfo: "Teléfono: ", valueInfo: userInfo.phone || "Sin información"},
        {nameInfo: "Total intercambios: ", valueInfo: "0"},
        {nameInfo: "Total compras: ", valueInfo: "0"},
        {nameInfo: "Total Swapcoins: ", valueInfo: "50"}
    ]);
    
    const [progress, setProgress] = useState(33); // Valor de la barra de progreso.

    return (
        <div className="container_aboutme">
            <h3 className="title_section_aboutme">Información adicional</h3>
            <section className="grid_template_infoUser">
                {infoUser.map((value, index) => ( //Mapeamos el usestate para mostrar todos los valores. 
                    <div key={index} className="section_info_aboutme">
                        <div className="title_info_aboutme">{value.nameInfo}</div>
                        <div style={{fontFamily:"Manrope", fontWeight:"450"}}>{value.valueInfo}</div>
                    </div>
                ))}
            </section>
            {rol === "user" && (
                <>
                    <h3 className="title_section_aboutme" id="title_section_swapcoins">Tareas para ganar Swapcoins</h3>
                    <div className="swapcoins_progress_container">
                        <div className="swapcoins_progress_label">
                            <span style={{fontFamily:"Outfit", fontWeight:"500"}}>{progress}% completado</span> {/*Mensaje informativo del progreso de las tareas. */}
                        </div>
                        <div className="swapcoins_progress_bar">
                            <div 
                                className="swapcoins_progress_fill" 
                                style={{ width: `${progress}%` }}> {/*Barra de progreso. */}
                            </div>
                        </div>

                        <div className="swapcoins_tasks_list"> {/*Contenedor que almacena las tareas para ganar swapcoins */}
                            <div className="swapcoins_task">
                                <input type="checkbox" checked={true} readOnly />
                                <span>Completar perfil</span>
                                <span className="task_reward">+50 Swapcoins</span>
                            </div>
                            <div className="swapcoins_task">
                                <input type="checkbox" checked={false} readOnly />
                                <span>Realizar primer intercambio</span>
                                <span className="task_reward">+100 Swapcoins</span>
                            </div>
                            <div className="swapcoins_task">
                                <input type="checkbox" checked={false} readOnly />
                                <span>Completar 5 intercambios</span>
                                <span className="task_reward">+200 Swapcoins</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AboutMe;