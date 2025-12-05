import { useState } from "react";
import { toast } from 'react-toastify';

import InfoPopup from '../../../components/InfoPopup/InfoPopup';
import useCartShopping from '../../../App/stores/StoreCartShopping';

/*
    DeleteProduct:
    - Componente para confirmar y ejecutar la eliminación de un producto del carrito.
    - Usa el modal reutilizable InfoPopup (igual que DeleteProfile).
    - Recibe por props:
        - open: booleano para mostrar/ocultar el popup
        - onClose: función para cerrar el popup
        - idItem: ID del item en el carrito que se va a eliminar
*/
const DeleteProduct = ({ open, onClose, idItem }) => {

    const [loading, setLoading] = useState(false);

    // Traemos del store la función que ya elimina en backend y actualiza el estado
    const deleteCartItems = useCartShopping((state) => state.deleteCartItems);

    const handleConfirmDelete = async () => { 
        if (!idItem) return;

        try {
            setLoading(true);

            // Llama al store → este hace DELETE `/carrito/${itemId}` y actualiza cartItem
            await deleteCartItems(idItem);

            toast.success("Producto eliminado del carrito.", { position: "top-center" });
        } catch (error) {
            toast.error("Error al eliminar el producto del carrito.", { position: "top-center" });
        } finally {
            setLoading(false);
            onClose(); // Cerramos el popup después de intentar eliminar
        }
    };

    return (
        <InfoPopup
            open={open}
            onClose={onClose}
            title="Confirmar eliminación de producto"
            message="¿Estás seguro de que deseas eliminar este producto de tu carrito? Esta acción no se puede deshacer."
            confirmText={loading ? "Eliminando..." : "Sí, eliminar producto"}
            cancelText="Cancelar"
            onConfirm={handleConfirmDelete}
            colorConfirm="error"
        />
      
    );
};

export default DeleteProduct;
