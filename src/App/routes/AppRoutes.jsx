import { Route, Routes } from "react-router-dom"; //Importamos el contenedor y las rutas para habilitarlas en la aplicación.

//Secciones correspondientes a mostrar según la ruta.
import Dashboard from "../../modules/layouts/main/Dashboard/Dashboard.jsx"
import Login from "../../pages/Login/Login";
import Register from "../../pages/Register/Register";
import MainPanel from "../../modules/layouts/main/MainPanel/MainPanel.jsx";
import ProtectedRouters from "./ProtectedRoutes"; //Importamos el componente para la validación de las rutas protegidas.
import Profile from "../../pages/Profile/Profile.jsx";
import MainHeader from "../../modules/layouts/main/MainPanel/components/MainHeader/MainHeader.jsx";
import Messages from "../../pages/Messages/Messages.jsx";

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Dashboard/>}></Route> {/*Ruta raiz*/}
            
            <Route path="/ingresar" element={ //Ruta para mostrar el componente para iniciar sesión.
                <>
                    <Dashboard/>
                    <Login />
                </>}>   
            </Route>

            <Route path="/registro" element={ //Ruta para mostrar el componente de registro
                <>
                    <Dashboard/>
                    <Register />
                </>}>   
            </Route>

            {/*Rutas para los componentes principales. */}
            {["/panel", "/perfil", "/ofertas", "/intercambios"].map((path) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <ProtectedRouters> {/*Se manejan rutas protegidas para validaciones con token de usuario.*/}
                            <MainPanel />
                        </ProtectedRouters>
                    }
                />
            ))}

            {/*Rutas para el componente de perfil.*/}
            {["/perfil/publicaciones", "/perfil/configuracion"].map((path) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <ProtectedRouters> {/*Se manejan rutas protegidas para validaciones con token de usuario.*/}
                            <MainHeader />
                            <Profile />
                        </ProtectedRouters>
                    }
                />
            ))}


            {["/mensajes"].map((path) => (
                <Route
                    key={path}
                    path={path}
                    element={
                        <ProtectedRouters> {/*Se manejan rutas protegidas para validaciones con token de usuario.*/}
                            <MainHeader />
                            <Messages />
                        </ProtectedRouters>
                    }
                />
            ))}
            
        </Routes>
    );
}

export default AppRoutes;

