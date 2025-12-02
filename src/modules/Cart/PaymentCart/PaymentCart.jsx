import React from 'react';
import './PaymentCart.css';
import { BeatLoader } from 'react-spinners';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

/*
  Props:
  - open: boolean → controla si se muestra el modal
  - status: 'loading' | 'success' | 'error' | null
  - onClose: función para cerrar (para botón Salir y cerrar overlay)
  - onInvoice: función opcional para manejar la acción "Factura"
*/
const PaymentCart = ({ open, status, onClose, onInvoice }) => {
  if (!open) return null;

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const handleOverlayClick = () => {
    // No permitimos cerrar mientras está cargando
    if (!isLoading && onClose) {
      onClose();
    }
  };

  const handleDialogClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="payment_overlay" onClick={handleOverlayClick}>
      <div className="payment_dialog" onClick={handleDialogClick}>
        <div className="payment_content">
          {/* ESTADO: PROCESANDO */}
          {isLoading && (
            <>
              <BeatLoader color="#2c7be5" size={15} />
              <p className="payment_message">Procesando pago...</p>
            </>
          )}

          {/* ESTADO: ÉXITO */}
          {isSuccess && (
            <>
              <CheckCircleIcon sx={{ fontSize: 60, color: '#10b981' }} />
              <p className="payment_message success">Pago exitoso</p>

              <div className="payment_actions">
                <button
                  className="btn light"
                  type="button"
                  onClick={onClose}
                >
                  Salir
                </button>
                <button
                  className="btn primary"
                  type="button"
                >
                  Factura
                </button>
              </div>
            </>
          )}

          {/* ESTADO: ERROR */}
          {isError && (
            <>
              <CancelIcon sx={{ fontSize: 60, color: '#b91c1c' }} />
              <p className="payment_message error">Pago rechazado</p>

              <div className="payment_actions">
                <button
                  className="btn light"
                  type="button"
                  onClick={onClose}
                >
                  Salir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCart;
