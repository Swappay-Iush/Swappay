import { useState, useEffect } from "react";
import "./DialogProductInvoice.css"
import { IoMdClose } from "react-icons/io";

const DialogProductInvoice = ({ data, onClose }) => {
    if (!data) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {style: 'currency',currency: 'COP',minimumFractionDigits: 0}).format(amount || 0);
    };

    return(
        <div className="dialog-overlay" onClick={onClose}>
            <div className="dialog-invoice-container" onClick={(e) => e.stopPropagation()}>
                <button className="dialog-close-btn" onClick={onClose}>
                    <IoMdClose />
                </button>
                
                <div className="invoice-content">
                    {/* Header de la factura */}
                    <div className="invoice-header">
                        <div className="invoice-logo">
                            <h1 className="invoice-company-name">SWAPPAY</h1>
                        </div>
                        <div className="invoice-details">
                            <p style={{fontFamily:"Manrope", fontWeight:"500"}}><strong style={{fontFamily:"Outfit"}}>No. Factura:</strong> {data.idBuys || "-"}</p>
                        </div>
                    </div>

                    <div className="invoice-divider"></div>

                    {/* Información del cliente */}
                    <div className="invoice-section">
                        <h3 className="section-title">Información del Cliente</h3>
                        <div className="client-info">
                            <p style={{fontFamily:"Manrope", fontWeight:"500"}}><strong style={{fontFamily:"Outfit"}}>Nombre:</strong> {data.client?.username || "-"}</p>
                            <p style={{fontFamily:"Manrope", fontWeight:"500"}}><strong style={{fontFamily:"Outfit"}}>Email:</strong> {data.client?.email || "-"}</p>
                        </div>
                    </div>

                    <div className="invoice-divider"></div>

                    {/* Detalle de productos */}
                    <div className="invoice-section" id="tablePurchase">
                        <h3 className="section-title">Detalle de Productos</h3>
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Cantidad</th>
                                    <th className="text-right">Precio Unitario</th>
                                    <th className="text-right">Descuento</th>
                                    <th className="text-right">Precio con descuento</th>
                                    <th className="text-right">Swapcoins</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.products && data.products.length > 0 ? (
                                    data.products.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.title || "-"}</td>
                                            <td>{product.category || "-"}</td>
                                            <td>{product.amount}</td>
                                            <td>{formatCurrency(product.priceOriginal)}</td>
                                            <td>{product.discount || 0} %</td>
                                            <td>{formatCurrency(product.priceDiscount)}</td>
                                            <td>{product.priceSwapcoins || 0}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No hay productos en esta compra</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="invoice-divider"></div>

                    {/* Resumen de totales */}
                    <div className="invoice-summary">
                        <div className="summary-row">
                            <span>Total Productos:</span>
                            <span className="summary-value">{data.totalProducts || 0}</span>
                        </div>
                        <div className="summary-row">
                            <span>Subtotal:</span>
                            <span className="summary-value">{formatCurrency(data.FullPayment)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Swapcoins pagados:</span>
                            <span className="summary-value">{data.FullSwapcoins || 0}</span>
                        </div>
                        <div className="summary-row total-row">
                            <span>Total Pagado:</span>
                            <span className="summary-value">{formatCurrency(data.FullPayment)}</span>
                        </div>
                    </div>

                </div>

                {/* Botón de imprimir */}
                <div className="invoice-actions">
                    <button className="btn-print" onClick={() => window.print()}>
                        Imprimir Factura
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DialogProductInvoice;