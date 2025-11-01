import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; //Importamos useLocation para validar rutas.

import MainHeader from "../layouts/main/MainPanel/components/MainHeader/MainHeader"; //Importamos el componente General que siempre se mostrara.
import Users from "./Users/Users";
import Products from "./Products/Products";
import Profile from "../../pages/Profile/Profile";
import ProductExchange from "./Exchanges/Exchanges";

import { useUserStore } from "../../App/stores/Store";

const MainAdmin = () =>{
    const {rol} = useUserStore();
    
    const location = useLocation(); //Usamos el hook de useLocation para ver la ubicación actual.
    let contentSection; //Variable que almacena el componente a renderizar según la ruta en el pathname.

    //Condicionales que validan que componente mostrar según la opción.
    if (location.pathname === '') contentSection = <Users/>;
    else if (location.pathname === '/admin/productos') contentSection = <Products/>;
    else if (location.pathname === '/perfil') contentSection = <Profile/>;
    else if (location.pathname === '/admin/intercambios') contentSection = <ProductExchange/>;
    //else if (location.pathname === '/admin/intercambios_ventas') contentSection = <Exchanges/>;
    else contentSection = <Users/>;

    return (
        <div>
            <MainHeader />
            {contentSection}
        </div>
    );
}

export default MainAdmin;