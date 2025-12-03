import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../service/axiosConfig";

const useCartShopping = create(
    persist(
        (set, get) => ({
            //Lista de productos en el carrito
            cartItem: [],

            //Función para obtener el carrito por el usuario
            fetchCartItems: async (idUser) => {
                if (!idUser) return; 
                const { data } = await api.get(`/carrito?idUser=${idUser}`);

                set({cartItem: data.items || [],});
            },

            //Función para añadir producto al carrito
            addCartItems: async ({ idUser, itemType, idProductOffer = null, idProduct = null }) => {
                const addCart = {
                    idUser,
                    itemType,
                    idProductOffer,
                    idProduct,
                    quantity: 1, //Siempre se crea con cantidad 1
                };

                //Se guarda el producto en la BD
                const { data } = await api.post("/carrito", addCart);
                const apiItem = data.item;

                if (!apiItem) {
                    console.error("La API no retornó 'item' en /carrito");
                    return null;
                }

                const newItem = {
                    ...apiItem,
                    quantity: apiItem.quantity && apiItem.quantity > 0 ? apiItem.quantity : 1, // si viene vacío o 0, lo dejamos en 1
                };

                //Se guarda en el estado global
                set((state) => {
                    const existsIndex = state.cartItem.findIndex(
                        (item) => item.id === newItem.id
                    );

                    // Si ya existe un producto con ese id, se actualiza
                    if (existsIndex !== -1) {
                        const updatedItems = [...state.cartItem];
                        updatedItems[existsIndex] = newItem;
                        return { cartItem: updatedItems };
                    }

                    // Si no existe se agrega
                    return {
                        cartItem: [...state.cartItem, newItem],
                    };
                });

                return newItem;
            },


            //Función para actualizar la cantidad de un producto
            updateCartItems: async (itemId, newQuantity) => {
                const { data } = await api.put(`/carrito/${itemId}`, {
                    quantity: newQuantity,
                });

                const updatedItem = data.item;

                set((state) => ({
                    cartItem: state.cartItem.map((item) =>
                        item.id === itemId ? updatedItem : item
                    ),
                }));

                return updatedItem;
            },

            //Función para eliminar un producto del carrito
            deleteCartItems: async (itemId) => {
                await api.delete(`/carrito/${itemId}`);

                set((state) => ({
                    cartItem: state.cartItem.filter((item) => item.id !== itemId),
                }));
            },

            //Función para procesar el pago
            processCartPayment: async (paymentCart) => {
                const { data } = await api.post("/products-purchased", paymentCart);
                console.log(data);
                return data;
            },

            //Función para limpiar el carrito después de un pago exitoso
            clearCart: () => {
                set({ cartItem: [] });
            },
        }),
        {
            name: "cart-shopping-storage"
        }
    )
);

export default useCartShopping;
