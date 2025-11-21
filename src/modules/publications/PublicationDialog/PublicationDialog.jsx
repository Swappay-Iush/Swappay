import { useState } from "react";
import "./PublicationDialog.css"

import { Dialog, MobileStepper, Button } from "@mui/material"; //Importamos componentes de materialUI a utilizar.
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';  //Importamos los iconos para el carrusel de imágenes.
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'; //Importamos los iconos para el carrusel de imágenes.

const API_URL = import.meta.env.VITE_API_URL_BACKEND; //Variable de entorno para la URL del backend.

const PublicationDialog = ({dataUser, open, handleClose}) => { //Recibimos como props, la información del producto, si el popup está abierto y la función para cerrarlo.
    const [activeStep, setActiveStep] = useState(0); //Estado para manejar el paso activo del carrusel de imágenes.
    
    const images = dataUser ? [ //Array que almacena las imágenes del producto, filtrando los valores nulos o indefinidos.
        dataUser.image1,
        dataUser.image2,
        dataUser.image3
    ].filter(img => img) : [];

    const maxSteps = images.length; //Número máximo de pasos, que corresponde a la cantidad de imágenes disponibles.

    const handleNext = () => { //Función que permite avanzar al siguiente paso del carrusel.
        setActiveStep((prevActiveStep) => prevActiveStep + 1); // Incrementa el paso activo en 1.
    };

    const handleBack = () => { //Función que permite retroceder al paso anterior del carrusel.
        setActiveStep((prevActiveStep) => prevActiveStep - 1); // Decrementa el paso activo en 1.
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth //Componente Dialog de materialUI para el popup.
            PaperProps={{
            style: {
                borderRadius: '12px',
                padding: '0',
                overflow: 'hidden'
            }
            }}
        >
            {dataUser && (
            <div className="containerProductOwner_Dialog">
                <header className="img_Product_Dialog">
                    {images.length > 0 && (
                        <>
                            <img src={`${API_URL}${images[activeStep]}`} alt={`${dataUser.title} - ${activeStep + 1}`} /> {/* Muestra la imagen actual del carrusel */}
                            {images.length > 1 && (
                                <MobileStepper steps={maxSteps} position="static" activeStep={activeStep}
                                    sx={{ position: 'absolute', bottom: 0,width: '100%',
                                        backgroundColor: '#285194', '& .MuiMobileStepper-dot': {backgroundColor: 'rgba(255, 255, 255, 0.5)',},
                                        '& .MuiMobileStepper-dotActive': {backgroundColor: '#fff',},
                                    }}
                                    nextButton={
                                        <Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1} sx={{ color: '#fff' }}> {/* Botón para avanzar */}
                                            <KeyboardArrowRight />
                                        </Button>
                                    }
                                    backButton={
                                        <Button size="small" onClick={handleBack} disabled={activeStep === 0} sx={{ color: '#fff' }}> {/* Botón para retroceder */}
                                            <KeyboardArrowLeft />
                                        </Button>
                                    }
                                />
                            )}
                        </>
                    )}
                </header>
                <section className="content_Product_Dialog">
                <div className="container_title_product_Dialog">
                    <h1 className="title_Product_Dialog">{dataUser.title}</h1>
                </div>
                <div className="description_Product_Dialog">
                    <p>{dataUser.description}</p>
                </div>
                <div className="details_Product_Dialog">
                    <div className="detail_item">
                        <span className="detail_label">Categoría:</span>
                        <span className="detail_value">{dataUser.category}</span>
                    </div>
                    <div className="detail_item">
                        <span className="detail_label">Estado:</span>
                        <span className="detail_value">{dataUser.condition}</span>
                    </div>
                    <div className="detail_item">
                        <span className="detail_label">Cantidad:</span>
                        <span className="detail_value">{dataUser.amount}</span>
                    </div>
                    <div className="detail_item">
                        <span className="detail_label">Productos de interés:</span>
                        <span className="detail_value">{dataUser.interests}</span>
                    </div>
                    {dataUser.priceSwapcoins && (
                        <div className="detail_item">
                            <span className="detail_label">Precio en Swappcoins:</span>
                            <span className="detail_value">{dataUser.priceSwapcoins}</span>
                        </div>
                    )}
                    <div className="detail_item">
                        <span className="detail_label">Notas:</span>
                        <span className="detail_value">{dataUser.additionalNotes}</span>
                    </div>
                    <div className="detail_item">
                        <span className="detail_label">Ubicación:</span>
                        <span className="detail_value">{dataUser.ubication}</span>
                    </div>
                    <div className="detail_item">
                        <span className="detail_label">Método de entrega:</span>
                        <span className="detail_value">{dataUser.deliveryMethod}</span>
                    </div>

                </div>
                <div className="actions_Product_Dialog">
                    <button onClick={handleClose} className="btn_close_Dialog">Cerrar</button>
                </div>
                </section>
            </div>
            )}
        </Dialog>
    )
}

export default PublicationDialog;