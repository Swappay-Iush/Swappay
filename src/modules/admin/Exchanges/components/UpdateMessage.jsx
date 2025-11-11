import React, { useState } from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";

import api from "../../../../service/axiosConfig";

import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

const UpdateMessage = ({dataExchange, open, handleClose }) => {
    const [message, setMessage] = useState("");
    const [disabledButtons, setDisabledButtons] = useState(false);

    const handleSend = async () => {
        try {
            setDisabledButtons(true);
            await api.post(`/chat/trade/messages/${dataExchange}`, {
                messagesInfo: [message]
            })

            toast.success("Mensaje enviado exitosamente!", {position: "top-center"});

            setTimeout(() => {
               window.location.reload(); 
            }, 1500);
        } catch (error) {
            console.log(error);
            setDisabledButtons(false);
        }finally{
            setMessage("");
        }  
    };

    const handleCancel = () => {
        setMessage("");
        if (handleClose) handleClose();
    };

    return (
        <>
            <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
                <DialogTitle style={{ textAlign: "center", fontFamily: "Outfit", fontWeight: 600 }}>Actualizar información de intercambio</DialogTitle>

                <DialogContent style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", paddingTop: "1rem" }}>
                    <TextField label="Mensaje"variant="outlined" fullWidth  value={message}onChange={e => setMessage(e.target.value)}autoFocus
                        sx={{ borderRadius: 2 }} placeholder="Digita el mensaje..."/>
                </DialogContent>

                <DialogActions style={{ justifyContent: "center", gap: "1rem", paddingBottom: "1.5rem" }}>
                    <button onClick={handleCancel} variant="outlined" className="btn-cancel" disabled={disabledButtons} style={{cursor: `${disabledButtons ? "not-allowed" : "pointer"}`}} sx={{ borderRadius: 2, minWidth: 100 }}>Cancelar</button>
                    <button onClick={handleSend} variant="contained" className="btn-submit" disabled={disabledButtons} style={{cursor: `${disabledButtons ? "not-allowed" : "pointer"}`}} sx={{ borderRadius: 2, minWidth: 100 }}>Enviar</button>
                </DialogActions>
            </Dialog>

            <div>
                <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable/> {/*Paneles informativos de la aplicación.*/}
            </div>
        </>
    );
};

export default UpdateMessage;