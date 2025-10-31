import { Route, Routes } from "react-router-dom";
import { useUserStore } from "../stores/Store.js";

//Secciones correspondientes a mostrar según la ruta.
import Dashboard from "../../modules/layouts/main/Dashboard/Dashboard.jsx"
import Login from "../../pages/Login/Login";
import Register from "../../pages/Register/Register";
import MainPanel from "../../modules/layouts/main/MainPanel/MainPanel.jsx";
import ProtectedRouters from "./ProtectedRoutes";
import Profile from "../../pages/Profile/Profile.jsx";
import MainHeader from "../../modules/layouts/main/MainPanel/components/MainHeader/MainHeader.jsx";
import MainAdmin from "../../modules/admin/MainAdmin.jsx";

import NoPage from "../../components/NoPage/NoPage.jsx";

const AppRoutes = () => {

    const {rol} = useUserStore();

    return (
        <Routes>
            <Route path="/" element={<Dashboard/>}></Route>
            
            <Route path="/ingresar" element={
                <>
                    <Dashboard/>
                    <Login />
                </>}>   
            </Route>

            <Route path="/registro" element={
                <>
                    <Dashboard/>
                    <Register />
                </>}>   
            </Route>

            <Route path="*" element={
                <>
                    <NoPage/>
                </>}>   
            </Route>

            {/* Rutas de Usuario */}
            {["/panel", "/ofertas", "/intercambios"].map((path) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <ProtectedRouters>      
                            {rol === "user" ? <MainPanel /> : <NoPage />}
                        </ProtectedRouters>
                    }

                />
            ))}

            {/* Rutas de Admin */}
            {["/admin/usuarios", "/admin/productos", "/admin/intercambios", "/admin/intercambios_ventas"].map((path) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <ProtectedRouters>
                            {rol === "admin" ? <MainAdmin /> : <NoPage />}
                        </ProtectedRouters>
                    }
                />
            ))}

            <Route
                path="/perfil"
                element={
                    <ProtectedRouters>
                        {rol === "admin" ? <MainAdmin /> : rol === "user" ? <MainPanel /> : <NoPage />}
                    </ProtectedRouters>
                }
            />

            {/* Rutas adicionales de perfil */}
            {["/perfil/publicaciones", "/perfil/configuracion"].map((path) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <ProtectedRouters>
                            <MainHeader />
                            <Profile />
                        </ProtectedRouters>
                    }
                />
            ))}
            
        </Routes>
    );
}

export default AppRoutes;