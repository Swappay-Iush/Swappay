import React from 'react';
import './CartModal.css';
import computerImg from '../../../../../../resources/images/computer.png';
import designerImg from '../../../../../../resources/images/Designer.png';
import discountImg from '../../../../../../resources/images/discount.png';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const CartModal = ({ open, onClose }) => {
  if (!open) return null;

  const cartItems = [
    { id: 1, title: 'Computador', price: 50, swapcoins: 500, seller: 'Usuario1', image: computerImg, qty: 1 },
    { id: 2, title: 'Swappay', price: 15, swapcoins: 150, seller: 'Usuario2', image: designerImg, qty: 1 },
  ];

  const exchangeItems = [
    { id: 3, title: 'Camara', price: 0, swapcoins: 0, seller: 'Usuario3', image: discountImg, qty: 1 }
  ];

  const subtotal = cartItems.reduce((acc, it) => acc + it.price, 0);
  const fees = 50; 
  const totalDollars = subtotal; 
  const totalSwapcoins = cartItems.reduce((acc, it) => acc + it.swapcoins, 0) + fees; 

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
            <div className="cart_section_title">Mi carrito ({cartItems.length} items)</div>
            <div className="cart_list">
              {cartItems.map(item => (
                <div key={item.id} className="cart_row">
                  <img className="cart_thumb" src={item.image} alt={item.title} />
                  <div className="cart_info">
                    <div className="cart_title">{item.title}</div>
                    <div className="cart_meta">
                      <span className="price">${item.price.toFixed(2)}</span>
                      <span className="swap">/ {item.swapcoins} Swapcoins</span>
                    </div>
                    <div className="seller">Usuario: {item.seller}</div>
                  </div>
                  <div className="cart_qty">
                    <button className="icon_btn" aria-label="Decrease"><RemoveIcon/></button>
                    <span className="qty">{item.qty}</span>
                    <button className="icon_btn" aria-label="Increase"><AddIcon/></button>
                  </div>
                  <button className="icon_btn" aria-label="Remove"><DeleteOutlineIcon/></button>
                </div>
              ))}
            </div>
          </section>

          <section className="cart_section">
            <div className="cart_section_title">Mis intercambios ({exchangeItems.length} items)</div>
            <div className="cart_list">
              {exchangeItems.map(item => (
                <div key={item.id} className="cart_row">
                  <img className="cart_thumb" src={item.image} alt={item.title} />
                  <div className="cart_info">
                    <div className="cart_title">{item.title}</div>
                    <div className="cart_meta small">Valor: 50 Swapcoins</div>
                  </div>
                  <div className="cart_qty">
                    <button className="icon_btn" aria-label="Decrease"><RemoveIcon/></button>
                    <span className="qty">{item.qty}</span>
                    <button className="icon_btn" aria-label="Increase"><AddIcon/></button>
                  </div>
                  <button className="icon_btn" aria-label="Remove"><DeleteOutlineIcon/></button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="cart_footer">
          <div className="summary">
            <div className="summary_row"><span>Subtotal</span><span>${subtotal.toFixed(2)} / {totalSwapcoins - fees} Swapcoins</span></div>
            <div className="summary_row"><span>Valor de Swappaycoins del intercambio</span><span>{fees} Swapcoins</span></div>
            <div className="summary_row total"><span>Total General</span><span>${totalDollars.toFixed(2)} + {totalSwapcoins} Swapcoins</span></div>
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
