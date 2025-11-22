import { useState, useEffect } from "react";
import "./AboutMe.css"

import { useUserStore } from "../../../App/stores/Store";

const AboutMe = () => {
    
    const {email, userInfo, rol, swappcoins, completedTrades, profileCompletedReward, id, updateSwappcoins} = useUserStore();
    const [infoUser, setInfoUser] = useState([]); //Se crea el estado que contiene todos los valores que luego llegaran del servicio para mostrar más información del usuario.
    
    const [progress, setProgress] = useState(0); // Valor de la barra de progreso.

    // Actualizar swappcoins al cargar el componente
    useEffect(() => {
        if (id && rol === "user") {
            updateSwappcoins(id).catch(err => console.error("Error al cargar swappcoins:", err));
        }
    }, [id, rol]);

    useEffect(() => {
        const info = [
            {nameInfo: "Fecha de nacimiento: ", valueInfo: userInfo.dateBirth || "Sin información"},
            {nameInfo: "Correo: ", valueInfo: email || "Sin información"},
            {nameInfo: "Genero: ", valueInfo: userInfo.gender || "Sin información"},
            {nameInfo: "Dirección: ", valueInfo: userInfo.address || "Sin información"},
            {nameInfo: "Ciudad: ", valueInfo: userInfo.city || "Sin información"},
            {nameInfo: "Teléfono: ", valueInfo: userInfo.phone || "Sin información"},
        ];

        if (rol === "user") {
            info.push(
                {nameInfo: "Total intercambios: ", valueInfo: completedTrades || "0"},
                {nameInfo: "Total compras: ", valueInfo: "0"},
                {nameInfo: "Total Swappcoins: ", valueInfo: swappcoins || "0"}
            );
        }else if(rol === "collaborator"){
            info.push(
                {nameInfo: "Total productos: ", valueInfo: "0" || "0"},
                {nameInfo: "Total ventas: ", valueInfo: "0"},
            );
        }else if(rol === "admin"){
            info.push(
                {nameInfo: "Total usuarios: ", valueInfo: "0" || "0"},
                {nameInfo: "Total productos: ", valueInfo: "0"},
                {nameInfo: "Total intercambios: ", valueInfo: "0" || "0"}
            );
        }

        setInfoUser(info);

        // Calculamos el progreso basado en las tareas completadas
        let tasksCompleted = 0;
        const totalTasks = 4;
        
        tasksCompleted++; // Registrarse (siempre completado)
        if (profileCompletedReward) tasksCompleted++; // Completar perfil
        if (completedTrades >= 1) tasksCompleted++; // Primer intercambio
        if (completedTrades >= 3) tasksCompleted++; // 3 intercambios

        setProgress(Math.round((tasksCompleted / totalTasks) * 100));
    }, [email, userInfo, swappcoins, completedTrades, profileCompletedReward]);

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
                    <h3 className="title_section_aboutme" id="title_section_swapcoins">Tareas para ganar Swappcoins</h3>
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

                        <div className="swapcoins_tasks_list"> {/*Contenedor que almacena las tareas para ganar swappcoins */}
                            <div className="swapcoins_task">
                                <input type="checkbox" checked={true} readOnly />
                                <span>Registrarse</span>
                                <span className="task_reward">+100 Swappcoins</span>
                            </div>
                            <div className="swapcoins_task">
                                <input type="checkbox" checked={profileCompletedReward} readOnly />
                                <span>Completar perfil</span>
                                <span className="task_reward">+200 Swappcoins</span>
                            </div>
                            <div className="swapcoins_task">
                                <input type="checkbox" checked={completedTrades >= 1} readOnly />
                                <span>Realizar primer intercambio</span>
                                <span className="task_reward">+500 Swappcoins</span>
                            </div>
                            <div className="swapcoins_task">
                                <input type="checkbox" checked={completedTrades >= 3} readOnly />
                                <span>Completar 3 intercambios</span>
                                <span className="task_reward">+2000 Swappcoins</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default AboutMe;