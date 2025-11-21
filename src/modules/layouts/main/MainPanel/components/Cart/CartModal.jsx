import React, { useState } from 'react';
import './CartModal.css';
import mockCartData from './mockCartData.json';
import computerImg from '../../../../../../resources/images/computer.png';
import designerImg from '../../../../../../resources/images/Designer.png';
import discountImg from '../../../../../../resources/images/discount.png';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const CartModal = ({ open, onClose }) => {
  if (!open) return null;

  // Estado para manejar los items del carrito
  const [cartItems, setCartItems] = useState(mockCartData.cartItems);

  // Separar items por tipo
  const purchaseItems = cartItems.filter(item => item.itemType === 'offer');
  const exchangeItems = cartItems.filter(item => item.itemType === 'exchange');

  // Calcular totales dinámicamente
  const subtotalDollars = purchaseItems.reduce((acc, item) => acc + (item.priceSnapshot * item.quantity), 0);
  const subtotalSwapcoins = purchaseItems.reduce((acc, item) => acc + (item.swapcoinsSnapshot * item.quantity), 0);
  const exchangeProcessingFees = exchangeItems.reduce((acc, item) => acc + (item.swapcoinsSnapshot * item.quantity), 0);
  const totalDollars = subtotalDollars;
  const totalSwapcoins = subtotalSwapcoins + exchangeProcessingFees;

  // Funciones para manejar cantidad
  const handleIncrease = (itemId) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrease = (itemId) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const handleRemove = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
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
                  
                  return (
                    <div key={item.id} className="cart_row">
                    <img className="cart_thumb" src={computerImg} alt={offer.title} />
                    <div className="cart_info">
                      <div className="cart_title">{offer.title}</div>
                      <div className="cart_meta">
                        <span className="price">${item.priceSnapshot.toFixed(2)}</span>
                        <span className="swap">/ {item.swapcoinsSnapshot} Swapcoins</span>
                      </div>
                      <div className="seller">Usuario: {offer.user.username}</div>
                    </div>
                    <div className="cart_qty">
                      <button className="icon_btn" aria-label="Decrease" onClick={() => handleDecrease(item.id)}><RemoveIcon/></button>
                      <span className="qty">{item.quantity}</span>
                      <button className="icon_btn" aria-label="Increase" onClick={() => handleIncrease(item.id)}><AddIcon/></button>
                    </div>
                    <button className="icon_btn delete" aria-label="Remove" onClick={() => handleRemove(item.id)}><DeleteOutlineIcon/></button>
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
                  
                  return (
                    <div key={item.id} className="cart_row">
                    <img className="cart_thumb" src={discountImg} alt={product.title} />
                    <div className="cart_info">
                      <div className="cart_title">{product.title}</div>
                      <div className="cart_meta small">Valor: {item.swapcoinsSnapshot} Swapcoins</div>
                      <div className="seller">Usuario: {product.user.username}</div>
                    </div>
                    <div className="cart_qty">
                      <button className="icon_btn" aria-label="Decrease" onClick={() => handleDecrease(item.id)}><RemoveIcon/></button>
                      <span className="qty">{item.quantity}</span>
                      <button className="icon_btn" aria-label="Increase" onClick={() => handleIncrease(item.id)}><AddIcon/></button>
                    </div>
                    <button className="icon_btn delete" aria-label="Remove" onClick={() => handleRemove(item.id)}><DeleteOutlineIcon/></button>
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
              <span>${subtotalDollars.toFixed(2)} / {subtotalSwapcoins} Swapcoins</span>
            </div>
            <div className="summary_row">
              <span>Valor de Swappaycoins del intercambio</span>
              <span>{exchangeProcessingFees} Swapcoins</span>
            </div>
            <div className="summary_row total">
              <span>Total General</span>
              <span>${totalDollars.toFixed(2)} + {totalSwapcoins} Swapcoins</span>
            </div>
          </div>
          <div className="actions">
            <button className="btn light" onClick={onClose}>Continua la compra</button>
            <button className="btn primary">Proceder el pago</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartModal;
