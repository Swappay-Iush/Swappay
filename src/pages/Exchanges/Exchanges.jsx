import { useState } from "react";
import "./Exchanges.css";
import PublicationExchanges from "../../modules/Exchanges/PublicationExchanges/PublicationExchanges";
import InputSearch from "../../components/InputSearch/InputSearch"; // Importa el componente de búsqueda

const Exchanges = () => {
    const [textSearch, setTextSearch] = useState(""); // Estado para el texto de búsqueda

    return( 
        <div className="container_main_exchanges">
            <section className="container_einfo">
                <div className="container_exchange">
                    <h1 className="exchange_title">Encuentra tu próximo tesoro</h1>
                    <p className="exchange_info">
                        Explora una variedad de artículos únicos y encuentra el intercambio perfecto para ti, dale una segunda vida a lo que ya no usas. 
                        Podrás utilizar tus <strong>Swappcoins</strong> para realizar intercambios con otros usuarios.
                    </p>
                    <div className="container_filter">
                        <InputSearch setTextSearch={setTextSearch} /> {/* Barra de búsqueda */}
                    </div>
                </div>
            </section>

            <section className="container_products_exchanges">
                <PublicationExchanges textSearch={textSearch} /> {/* Pasa el texto de búsqueda */}
            </section>
        </div>
    )
}

export default Exchanges;