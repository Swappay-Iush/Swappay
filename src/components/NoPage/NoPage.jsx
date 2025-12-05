import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../App/stores/Store";
import "./NoPage.css";

const NoPage = () => {
  const navigate = useNavigate();
  const { rol, isVerified, initializeUser } = useUserStore();

  useEffect(() => {
    initializeUser(); 
  }, []);

  const handleSection = () => {
    if (isVerified && rol === "user") {
      navigate("/panel");
    } else if (isVerified && rol === "admin") {
      navigate("/admin/usuarios");
    } else if(isVerified && rol === "collaborator"){
      navigate("/collaborator/products")  
    }else{
      navigate("/");
    }
  };

  return (
    <div className="no-page-container">
      <h1 className="no-page-404">404</h1>
      <p className="no-page-text">¡La página que buscas no existe!</p>
      <button className="no-page-btn" onClick={handleSection}>Regresar</button>
    </div>
  );
};

export default NoPage;