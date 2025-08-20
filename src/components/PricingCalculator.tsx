import { useState } from 'react'
import { Product } from '../types/Product'
import { useCart } from '../contexts'
import './PricingCalculator.css'

interface PricingCalculatorProps {
  product: Product
  canAddToCart?: boolean // Optional prop to control add to cart button
}

const PricingCalculator = ({ product, canAddToCart }: PricingCalculatorProps) => {
  const [quantity, setQuantity] = useState<number>(1)
  const [selectedColor, setSelectedColor] = useState<string>(product.colors?.[0] || '')
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '')
  const { addToCart } = useCart()
  const [selectedBreak, setSelectedBreak] = useState<number>(0)

  // Calculate best pricing for quantity
  const calculatePrice = (qty: number) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return product.basePrice * qty
    }

    const applicableBreaks = product.priceBreaks.filter(breakPoint => breakPoint.minQty <= qty)

    if (applicableBreaks.length === 0) {
      return product.basePrice * qty
    }

    // Find  best applicable  price break
    const bestBreak = applicableBreaks.reduce((best, current) => current.price < best.price ? current : best)

    return bestBreak.price * qty
  }

  // Calculate discount amount
  const getDiscount = (qty: number) => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return 0
    }

    const baseTotal = product.basePrice * qty
    const discountedTotal = calculatePrice(qty)

    // Calculate savings percentage
    return ((baseTotal - discountedTotal) / baseTotal) * 100
  }

  // Format price display
  const formatPrice = (price: number) => {
    return `${price.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}` // Should be CLP formatting
  }

  const currentPrice = calculatePrice(quantity)
  const discountPercent = getDiscount(quantity)

  return (
    <div className="pricing-calculator">
      <div className="calculator-header">
        <h3 className="calculator-title p1-medium">Calculadora de Precios</h3>
        <p className="calculator-subtitle l1">
          Calcula el precio según la cantidad que necesitas
        </p>
      </div>

      <div className="calculator-content">
        {/* Color Selection */}
        {product.colors && product.colors.length > 1 && (
          <div className="selection-section">
            <label className="selection-label p1-medium">Color</label>
            <div className="color-options">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 1 && (
          <div className="selection-section">
            <label className="selection-label p1-medium">Talla</label>
            <div className="size-options">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <div className="quantity-section">
          <label className="quantity-label p1-medium">Cantidad</label>
          <div className="quantity-input-group">
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1
                const validatedQuantity = Math.max(1, Math.min(value, product.stock))
                setQuantity(validatedQuantity)
              }}
              className="quantity-input p1"
              min="1"
              max={product.stock}
            />
            <span className="quantity-unit l1">unidades</span>
          </div>
        </div>

        {/* Price Breaks */}
        {product.priceBreaks && product.priceBreaks.length > 0 && (
          <div className="price-breaks-section">
            <h4 className="breaks-title p1-medium">Descuentos por volumen</h4>
            <div className="price-breaks">
              {product.priceBreaks.map((priceBreak, index) => {
                const isActive = quantity >= priceBreak.minQty
                const isSelected = selectedBreak === index

                return (
                  <div
                    key={index}
                    className={`price-break ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedBreak(index)
                      setQuantity(priceBreak.minQty)
                    }}
                  >
                    <div className="break-quantity l1">
                      {priceBreak.minQty}+ unidades
                    </div>
                    <div className="break-price p1-medium">
                      {formatPrice(priceBreak.price)}
                    </div>
                    {priceBreak.discount && (
                      <div className="break-discount l1">
                        -{priceBreak.discount}%
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="price-summary">
          <div className="summary-row">
            <span className="summary-label p1">Precio unitario:</span>
            <span className="summary-value p1-medium">
              {formatPrice(calculatePrice(quantity) / quantity)}
            </span>
          </div>

          <div className="summary-row">
            <span className="summary-label p1">Cantidad:</span>
            <span className="summary-value p1-medium">{quantity} unidades</span>
          </div>

          {discountPercent > 0 && (
            <div className="summary-row discount-row">
              <span className="summary-label p1">Descuento:</span>
              <span className="summary-value discount-value p1-medium">
                -{discountPercent.toFixed(1)}%
              </span>
            </div>
          )}

          <div className="summary-row total-row">
            <span className="summary-label p1-medium">Total:</span>
            <span className="summary-value total-value h2">
              {formatPrice(currentPrice)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="calculator-actions">
          <button
            className="btn btn-secondary cta1"
            onClick={() => {
              // Handle quote request
              alert(`Cotización solicitada para ${quantity} unidades de ${product.name}`)
            }}
          >
            <span className="material-icons">email</span>
            Solicitar cotización oficial
          </button>

          <button
            className={`btn btn-primary cta1 ${!canAddToCart ? 'disabled' : ''}`}
            disabled={!canAddToCart}
            onClick={() => {
              addToCart(product, quantity, selectedColor, selectedSize)
              const colorText = selectedColor ? ` en ${selectedColor}` : '';
              const sizeText = selectedSize ? ` talla ${selectedSize}` : '';
              alert(`¡${quantity} unidades de ${product.name}${colorText}${sizeText} agregadas al carrito!`)
            }}
          >
            <span className="material-icons">shopping_cart</span>
            {canAddToCart ? 'Agregar al carrito' : 'No disponible'}
          </button>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-item">
            <span className="material-icons">local_shipping</span>
            <div className="info-content">
              <span className="info-title l1">Envío gratis</span>
              <span className="info-detail l1">En pedidos sobre $50.000</span>
            </div>
          </div>

          <div className="info-item">
            <span className="material-icons">schedule</span>
            <div className="info-content">
              <span className="info-title l1">Tiempo de producción</span>
              <span className="info-detail l1">7-10 días hábiles</span>
            </div>
          </div>

          <div className="info-item">
            <span className="material-icons">verified</span>
            <div className="info-content">
              <span className="info-title l1">Garantía</span>
              <span className="info-detail l1">30 días de garantía</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingCalculator