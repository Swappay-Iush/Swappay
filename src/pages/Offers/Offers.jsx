import {useState } from "react";
import "./Offers.css"

import { IoIosTrendingUp } from "react-icons/io"; //Icono de tendencia.

import InputSearch from "../../components/InputSearch/InputSearch"; //Componente de la barra de búsqueda.
import PublicationsOffers from "../../modules/Offers/PublicationOffers/PublicationsOffers"; //Modulo que muestra las ofertas disponibles.

const Offers = () => {

    const [textSearch, setTextSearch] = useState(""); //Estado que almacena el texto ingresado en la barra de búsqueda.

    return(
        <div className="container_general_offers">
           <section className="container_info_offers">
                <div className="offers_exclusive">
                    <IoIosTrendingUp style={{fontSize:"18px", color:"#fff"}}/>
                    Ofertas exclusivas actualizadas
                </div>
                <h1 className="offers_title">Aprovecha tus Swappcoins y consigue más por menos</h1>
                <p className="offers_description">Combina dinero real con Swappcoins y accede a descuentos únicos en productos premium</p>
                <div className="container_filter">
                    <InputSearch setTextSearch={setTextSearch}/> {/*Componente de la barra de búsqueda, le pasamos la función para actualizar el estado del texto de búsqueda.*/}
                </div>
           </section>
           <section className="container_info_publications">
                <PublicationsOffers textSearch={textSearch}/> {/*Modulo que muestra las ofertas disponibles, le pasamos el texto de búsqueda para filtrar los productos.*/}
           </section>

        </div>
    )
}

export default Offers;