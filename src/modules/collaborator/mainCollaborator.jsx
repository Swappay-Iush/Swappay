import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; //Importamos useLocation para validar rutas.

import MainHeader from "../layouts/main/MainPanel/components/MainHeader/MainHeader";
import ProductOffer from "./ProductOffer/ProductOffer";
import PurchaseHistory from "./PurchaseHistory/PurchaseHistory"
import Profile from "../../pages/Profile/Profile";

import { useUserStore } from "../../App/stores/Store";

const MainCollaborator = () =>{
    const {rol} = useUserStore();
    
    const location = useLocation(); //Usamos el hook de useLocation para ver la ubicación actual.
    let contentSection; //Variable que almacena el componente a renderizar según la ruta en el pathname.

    //Condicionales que validan que componente mostrar según la opción.
    if (location.pathname === '/collaborator/products') contentSection = <ProductOffer/>;
    else if (location.pathname === '/collaborator/purchase-history') contentSection = <PurchaseHistory/>;
    else if (location.pathname === '/perfil') contentSection = <Profile/>;
    else contentSection = <ProductOffer/>;

    return (
        <div>
            <MainHeader />
            {contentSection}
        </div>
    );
}

export default MainCollaborator;