import {useState, useEffect} from "react";
import "./Exchanges.css"
import PublicationExchanges from "../../modules/Exchanges/PublicationExchanges/PublicationExchanges";

const Exchanges = () => {
    return( 
    
        <div className="container_main_exchanges">
            <section className="container_einfo">
                <div className="container_exchange">
                    <h1 className="exchange_title">Encuentra tu próximo tesoro</h1>
                    <p className="exchange_info">Explora una variedad de artículos únicos y encuentra el intercambio perfecto para ti, dale una segunda vida a lo que ya no usas. Podrás utilizar tus <strong>SwapCoins</strong> para realizar intercambios con otros usuarios.</p>
                </div>
            </section>
            
            <section className="container_products_exchanges">
                <PublicationExchanges />
            </section>
        </div>
    )
}

export default Exchanges;