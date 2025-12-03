import { create } from "zustand";
import api from "../../service/axiosConfig";

const fetchAndSet = async (endpoint, key, set, errorMsg) => {
    try {
        const { data } = await api.get(endpoint);
        set({ [key]: data.length });
    } catch (error) {
        console.error(errorMsg, error);
    }
};

export const useInfo = create((set) => ({
    lengthUsers: 0,
    lengthProducts: 0,
    lengthExchange: 0,
    lengthPurchase: 0,
    lengthProductsCol: 0,

    setInfo: (info) => set(info),

    infoUsers: () => fetchAndSet("/users/AllUsers", "lengthUsers", set, "Error al traer información de usuario."),
    infoProducts: () => fetchAndSet("/product-offer", "lengthProducts", set, "Error al traer información de ofertas"),
    infoExchange: () => fetchAndSet("/products", "lengthExchange", set, "Error al traer información de intercambios."),
    infoPurchase: () => fetchAndSet("/products-purchased", "lengthPurchase", set, "Error al traer información de compras."),
}));