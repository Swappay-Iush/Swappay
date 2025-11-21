import React, { useEffect } from "react";
import "./MainData.css";
import { useUserStore } from "../../../../../../App/stores/Store"; //Importamos el store para manejar los estados globales.
import { useNavigate } from "react-router-dom"; //Hook para navegar entre rutas.
import Carrusel from "../../../../../../components/carrusel/carrusel"; //Importamos el componente del carrusel.
import Computer from "../../../../../../resources/images/computer.png"; //Importamos las imágenes a utilizar.
import Discount from "../../../../../../resources/images/discount.png"; //Importamos las imágenes a utilizar.
import Change from "../../../../../../resources/images/change.png"; //Importamos las imágenes a utilizar.

const MainData = () => {

    const navigate = useNavigate(); //Hook para navegar entre rutas.
    const {username} = useUserStore(); //Función para inicializar el usuario.

    const Carousel = [ //Arreglo que contiene los datos para las tarjetas del carrusel
        {name: "Intercambios", img: Change, descr: "Intercambia lo que ya no usas por lo que realmente necesitas. Conecta con otros usuarios de forma práctica y segura, generando oportunidades de ahorro.", ruta: "/intercambios"},
        {name: "Ofertas", img: Discount, descr: "Accede a descuentos únicos en productos seleccionados, pero solo podrás adquirirlos utilizando tus Swappcoins.", ruta: "/ofertas"}
    ]

    return(
        <div className="mainData">   
            <section className="mainDataHero">
                <div className="mainDataContainerHero">  {/*Crea mensaje de bienvenida personalizado*/}
                    <h3>Bienvenid@ {username}</h3>
                    <p>En este espacio podrás intercambiar, descubrir promociones y aprovechar al máximo tus Swappcoins.</p>
                </div>
                <div className="mainDataImageHero">
                     <img src={Computer} alt="" />
                </div>
            </section>
                
            {/*Crea una tarjeta por cada elemento del array Carousel con navegacion*/}
            <section className="mainDataCarruselContainer"> 
                {Carousel.map((value, index) =>( 
                    <div key={index} onClick={() => navigate(value.ruta)}>
                        <Carrusel nombre={value.name} imagen={value.img} descrip={value.descr}/>
                    </div>
                ))}

            </section>

            <footer className="mainDataFooter">
                <p>&copy; 2025 Swappay. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default MainData;
