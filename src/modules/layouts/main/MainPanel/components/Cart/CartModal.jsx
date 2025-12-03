  import React, { useMemo, useState } from 'react';
  import './CartModal.css';
  import CloseIcon from '@mui/icons-material/Close';
  import AddIcon from '@mui/icons-material/Add';
  import RemoveIcon from '@mui/icons-material/Remove';
  import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
  import { toast } from 'react-toastify';
  import { ToastContainer } from 'react-toastify';
  import useCartShopping from '../../../../../../App/stores/StoreCartShopping';
  import { useUserStore } from '../../../../../../App/stores/Store';
  import DeleteProduct from '../../../../../Cart/DeleteProduct/DeleteProduct';
  import PaymentCart from '../../../../../Cart/PaymentCart/PaymentCart';
  import api from '../../../../../../service/axiosConfig';

  const API_URL = import.meta.env.VITE_API_URL_BACKEND;

  const CartModal = ({ open, onClose }) => {

    //Estados globales del carrito
    const cartItem = useCartShopping((state) => state.cartItem);
    const updateCartItems = useCartShopping((state) => state.updateCartItems);
    const processCartPayment = useCartShopping((state) => state.processCartPayment);
    const clearCart = useCartShopping((state) => state.clearCart);

    if (!open) return null; 

    //Acciones del carrito
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [toRemoveItem, setToRemoveItem] = useState(null);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'loading' | 'success' | 'error'

    //Información del usuario para validar el pago
    const userSwapcoins = useUserStore((state) => state.swappcoins);
    const userId = useUserStore((state) => state.id);
    const updateSwappcoins = useUserStore((state) => state.updateSwappcoins);

    const resolveImage = (img) => {
      if (!img) return null;
      return `${API_URL}${img}`;
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    };

    const getOfferPrice = (offer) => {
      if (!offer) return 0;
      if (offer.priceDiscount && offer.priceDiscount > 0) {
        return offer.priceDiscount;
      }
      return offer.priceOriginal || 0;
    };

    const getOfferSwapcoins = (offer) => {
      if (!offer) return 0;
      return offer.priceSwapcoins || 0;
    };

    const getExchangeSwapcoins = (product) => {
      if (!product) return 0;
      return Number(product.priceSwapcoins) || 0;
    };

    const traeCartItems = cartItem || [];

    // Separar items por tipo y memorizar cálculos costosos
    const purchaseItems = useMemo(() => traeCartItems.filter(item => item.itemType === 'offer' && item.productOffer), [traeCartItems]);
    const exchangeItems = useMemo(() => traeCartItems.filter(item => item.itemType === 'exchange' && item.product), [traeCartItems]);

    // Calcular totales dinámicamente
    const subtotalPrice = useMemo(() => purchaseItems.reduce((acc, item) => {
      const offer = item.productOffer;
      const isOutOfStock = (offer?.amount || 0) === 0;
      if (isOutOfStock) return acc; // Excluir productos agotados
      const offerPrice = getOfferPrice(offer);
      return acc + (offerPrice * item.quantity);
    }, 0), [purchaseItems]);

    const subtotalSwapcoins = useMemo(() => purchaseItems.reduce((acc, item) => {
      const offer = item.productOffer;
      const isOutOfStock = (offer?.amount || 0) === 0;
      if (isOutOfStock) return acc; // Excluir productos agotados
      const offerSwapcoins = getOfferSwapcoins(offer);
      return acc + (offerSwapcoins * item.quantity);
    }, 0), [purchaseItems]);

    const exchangeProcessingFees = useMemo(() => exchangeItems.reduce((acc, item) => {
      const product = item.product;
      const isOutOfStock = (product?.amount || 0) === 0;
      if (isOutOfStock) return acc; // Excluir productos agotados
      const exchangeSwapcoins = getExchangeSwapcoins(product);
      return acc + (exchangeSwapcoins * item.quantity);
    }, 0), [exchangeItems]);

    const totalPrice = subtotalPrice;
    const totalSwapcoins = subtotalSwapcoins + exchangeProcessingFees;

    // Funciones para manejar cantidad
    const handleIncrease = (itemId) => {
      const item = traeCartItems.find((i) => i.id === itemId);
      if (!item) return;

      //Maxima cantidad según disponibilidad del producto
      const maxAvailable = item.itemType === 'offer'
        ? item.productOffer?.stock || item.productOffer?.amount
        : item.product?.stock || item.product?.amount;

      const newQuantity = item.quantity + 1;

      //Solo permite aumentar si no supera el stock
      if (newQuantity <= maxAvailable) {
        updateCartItems(itemId, newQuantity);
      }
    };

    const handleDecrease = (itemId) => {
      const item = traeCartItems.find((i) => i.id === itemId);
      if (!item) return;
      const newQuantity = item.quantity - 1;
      if (newQuantity > 0) {
        updateCartItems(itemId, newQuantity); //Solo se actualiza si la cantidad es mayor a 0
      }
    };

    //Modal para eliminar producto del carrito
    const handleRemove = (itemId) => {
      setToRemoveItem(itemId);
      setConfirmOpen(true);
    };

    //Modal de confirmación
    const handleCloseDelete = () => {
      setToRemoveItem(null);
      setConfirmOpen(false);
    };

    //Procesar el pago
    const handleProceedPayment = async () => {
      if (traeCartItems.length === 0) {
        toast.info('No tienes productos en el carrito.', { position: 'top-center' });
        return;
      }

      //Validación de Swappcoins
      if (totalSwapcoins > userSwapcoins) {
        toast.error(`No tienes suficientes Swapcoins. `, { position: 'top-center' });
        return;
      }

      // Filtrar productos disponibles (no agotados) para el pago
      const availablePurchaseItems = purchaseItems.filter(item => {
        const offer = item.productOffer;
        return (offer?.amount || 0) > 0;
      });

      const availableExchangeItems = exchangeItems.filter(item => {
        const product = item.product;
        return (product?.amount || 0) > 0;
      });

      const idsProducts = availablePurchaseItems.map((item) => item.productOffer.id);
      const idsProductsChange = availableExchangeItems.map((item) => item.product.id);
      const totalProducts = availablePurchaseItems.length + availableExchangeItems.length;

      const paymentData = {
        idsProducts,
        idsProductsChange,
        totalProducts,
        FullPayment: totalPrice,
        FullSwapcoins: totalSwapcoins,
        idClient: userId,
      };

      setPaymentOpen(true);
      setPaymentStatus('loading');

      try {
        await processCartPayment(paymentData); //Store para procesar el pago en el backend

        const deletePromises = traeCartItems.map((item) => api.delete(`/carrito/${item.id}`));
        await Promise.all(deletePromises);

        // Simulación de proceso
        await new Promise((resolve) => setTimeout(resolve, 3000));


        setPaymentStatus('success');
        clearCart(); //Limpiar carrito solo si el pago fue exitoso
        await updateSwappcoins(userId); //Actualizar swapcoins después del pago exitoso
      } catch (error) {
        console.error(error);
        setPaymentStatus('error');
      }
    };

    // Cerrar modal de pago
    const handlePaymentClose = () => {
      if (paymentStatus !== 'loading') {
        setPaymentOpen(false);
        setPaymentStatus(null);
        onClose();
      }
    };

    return (
      <div className="cart_overlay" onClick={onClose}>
        <div className="cart_dialog" onClick={(e) => e.stopPropagation()}>
          <div className="cart_header">
            <h3>Mi carrito de compras</h3>
            <button className="icon_btn" onClick={onClose} aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>

          <DeleteProduct
            open={confirmOpen}
            onClose={handleCloseDelete}
            idItem={toRemoveItem}
          />

          <PaymentCart
            open={paymentOpen}
            status={paymentStatus}
            onClose={handlePaymentClose}
          />

          <div className="cart_body">
            <section className="cart_section">
              <div className="cart_section_title">Mi carrito ({purchaseItems.length} items)</div>
              <div className="cart_list">
                {purchaseItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontFamily: 'Outfit' }}>
                    No hay productos
                  </div>
                ) : (
                  purchaseItems.map(item => {
                    const offer = item.productOffer;
                    const dollars = getOfferPrice(offer);
                    const swapcoins = getOfferSwapcoins(offer);
                    const offerImage = resolveImage(offer?.img1);
                    const maxStock = offer?.stock || offer?.amount;
                    const isOutOfStock = (offer?.amount || 0) === 0;

                    return (
                      <div key={item.id} className="cart_row">
                        <img className="cart_thumb" src={offerImage} alt={offer?.title || 'Producto'} />
                        <div className="cart_info">
                          <div className="cart_title">{offer?.title}</div>
                          {isOutOfStock ? (
                            <div className="cart_meta" style={{ color: '#f76b6bff', fontWeight: '600' }}>
                              Producto agotado
                            </div>
                          ) : (
                            <div className="cart_meta">
                              <span className="price">${formatPrice(dollars)}</span>
                              <span className="swap">/ {swapcoins} Swapcoins</span>
                            </div>
                          )}
                        </div>
                        <div className="cart_controls">
                          <button className="icon_btn delete" aria-label="Remove" onClick={() => handleRemove(item.id)}><DeleteOutlineIcon /></button>
                          {!isOutOfStock && (
                            <div className="cart_qty">
                              <button className="icon_btn" aria-label="Decrease" onClick={() => handleDecrease(item.id)} disabled={item.quantity <= 1}><RemoveIcon /></button>
                              <span className="qty">{item.quantity}</span>
                              <button className="icon_btn" aria-label="Increase" onClick={() => handleIncrease(item.id)} disabled={item.quantity >= maxStock}><AddIcon /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }))}
              </div>
            </section>

            <section className="cart_section">
              <div className="cart_section_title">Mis intercambios ({exchangeItems.length} items)</div>
              <div className="cart_list">
                {exchangeItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontFamily: 'Outfit' }}>
                    No hay intercambios
                  </div>
                ) : (
                  exchangeItems.map(item => {
                    const product = item.product;
                    const swapcoins = getExchangeSwapcoins(product);
                    const productImage = resolveImage(product?.image1);
                    const maxStock = product?.stock || product?.amount;
                    const isOutOfStock = (product?.amount || 0) === 0;

                    return (
                      <div key={item.id} className="cart_row">
                        <img className="cart_thumb" src={productImage} alt={product?.title || 'Intercambio'} />
                        <div className="cart_info">
                          <div className="cart_title">{product?.title}</div>
                          {isOutOfStock ? (
                            <div className="cart_meta small" style={{ color: '#f76b6bff', fontWeight: '600' }}>
                              Producto agotado
                            </div>
                          ) : (
                            <div className="cart_meta small">Valor: {swapcoins} Swapcoins</div>
                          )}
                          <div className="seller">Usuario: {product?.user?.username}</div>
                        </div>
                        <div className="cart_controls">
                          <button className="icon_btn delete" aria-label="Remove" onClick={() => handleRemove(item.id)}><DeleteOutlineIcon /></button>
                          {!isOutOfStock && (
                            <div className="cart_qty">
                              <button className="icon_btn" aria-label="Decrease" onClick={() => handleDecrease(item.id)} disabled={item.quantity <= 1}><RemoveIcon /></button>
                              <span className="qty">{item.quantity}</span>
                              <button className="icon_btn" aria-label="Increase" onClick={() => handleIncrease(item.id)} disabled={item.quantity >= maxStock}><AddIcon /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }))}
              </div>
            </section>
          </div>

          <div className="cart_footer">
            <div className="summary">
              <div className="summary_row">
                <span>Subtotal</span>
                <span>${formatPrice(subtotalPrice)} / {subtotalSwapcoins} Swapcoins</span>
              </div>
              <div className="summary_row">
                <span>Valor de Swappaycoins del intercambio</span>
                <span>{exchangeProcessingFees} Swapcoins</span>
              </div>
              <div className="summary_row total">
                <span>Total General</span>
                <span>${formatPrice(totalPrice)} + {totalSwapcoins} Swapcoins</span>
              </div>
            </div>
            <div className="actions">
              <button className="btn light" onClick={onClose}>Continua la compra</button>
              <button className="btn primary" onClick={handleProceedPayment}>Proceder el pago</button>
            </div>
          </div>
        </div>
        <div>
          <ToastContainer position="bottom-right" autoClose={2000} hideProgressBar={false} closeOnClick pauseOnHover draggable /> {/*Paneles informativos de la aplicación.*/}
        </div>
      </div>
    );
  }

  export default CartModal;
