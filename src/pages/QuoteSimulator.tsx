import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from '../data/products'
import QuotePreviewModal from '../components/QuotePreviewModal'
import Notification from '../components/Notification'
import { generateQuoteContent, downloadQuote } from '../utils/quoteUtils'
import './QuoteSimulator.css'

interface CompanyData {
  companyName: string
  contactName: string
  email: string
  phone: string
  rut: string
}

const QuoteSimulator = () => {
  const { productId } = useParams<{ productId: string }>()
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    rut: ''
  })

  // Encontrar el producto
  const product = products.find(p => p.id === parseInt(productId || '0'))

  if (!product) {
    return (
      <div className="quote-simulator">
        <div className="container">
          <h1>Producto no encontrado</h1>
          <Link to="/" className="btn btn-primary">Volver al catálogo</Link>
        </div>
      </div>
    )
  }

  // Calcular el mejor precio según la cantidad
  const getBestPrice = () => {
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return product.basePrice
    }

    const applicableBreaks = product.priceBreaks.filter(
      priceBreak => quantity >= priceBreak.minQty
    )

    if (applicableBreaks.length === 0) {
      return product.basePrice
    }

    const bestBreak = applicableBreaks.reduce((best, current) => 
      current.price < best.price ? current : best
    )

    return bestBreak.price
  }

  const unitPrice = getBestPrice()
  const totalPrice = unitPrice * quantity
  const savings = (product.basePrice - unitPrice) * quantity

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000) // Auto-hide después de 4 segundos
  }

  const handleCompanyDataChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerateQuote = async () => {
    // Validar que todos los campos requeridos estén completos
    if (!companyData.companyName || !companyData.email || !companyData.contactName) {
      showNotification('Por favor completa todos los campos obligatorios de la empresa', 'error')
      return
    }

    setIsGenerating(true)
    
    try {
      // Simular un pequeño delay para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Generar el contenido del resumen usando la utilidad
      const quoteContent = generateQuoteContent(
        product,
        quantity,
        unitPrice,
        totalPrice,
        savings,
        selectedColor,
        selectedSize,
        companyData
      )
      
      // Crear y descargar el archivo usando la utilidad
      downloadQuote(quoteContent, companyData.companyName, product.sku)
      
      showNotification('¡Cotización generada y descargada exitosamente!', 'success')
    } catch (error) {
      showNotification('Error al generar la cotización. Por favor, intenta nuevamente.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="quote-simulator">
      <div className="container">
        <div className="quote-header">
          <Link to="/" className="back-link">
            <span className="material-icons">arrow_back</span>
            Volver al catálogo
          </Link>
          <h1>Simulador de Cotización</h1>
        </div>

        <div className="quote-content">
          {/* Información del producto */}
          <div className="product-section">
            <h2>Producto Seleccionado</h2>
            <div className="product-info">
              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-sku">SKU: {product.sku}</p>
                <p className="product-category">{product.category}</p>
                <p className="base-price">Precio base: ${product.basePrice.toLocaleString('es-CL')}</p>
              </div>

              {/* Tabla de precios por volumen */}
              {product.priceBreaks && product.priceBreaks.length > 0 && (
                <div>
                    <h4>Descuentos por Volumen</h4>
                <div className="price-breaks">
                  
                  <div className="price-breaks-table">
                    <div className="price-break-row header">
                      <span>Cantidad</span>
                      <span>Precio Unitario</span>
                      <span>Descuento</span>
                    </div>
                    
                    {/* Precio base */}
                    <div className="price-break-row">
                      <span>1 - {product.priceBreaks[0]?.minQty - 1 || 'N/A'}</span>
                      <span>${product.basePrice.toLocaleString('es-CL')}</span>
                      <span>-</span>
                    </div>

                    {/* Precios con descuento */}
                    {product.priceBreaks.map((priceBreak, index) => {
                      const discount = ((product.basePrice - priceBreak.price) / product.basePrice * 100).toFixed(0)
                      const nextBreak = product.priceBreaks![index + 1]
                      const quantityRange = nextBreak 
                        ? `${priceBreak.minQty} - ${nextBreak.minQty - 1}`
                        : `${priceBreak.minQty}+`

                      return (
                        <div 
                          key={index} 
                          className={`price-break-row ${quantity >= priceBreak.minQty ? 'active' : ''}`}
                        >
                          <span>{quantityRange}</span>
                          <span>${priceBreak.price.toLocaleString('es-CL')}</span>
                          <span>{discount}% OFF</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                </div>
              )}
            </div>

            {/* Configuración del producto */}
            <div className="product-config">
              <div className="config-row">
                <label>Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  max={product.maxQuantity || 1000}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>

              {product.colors && product.colors.length > 0 && (
                <div className="config-row">
                  <label>Color:</label>
                  <select 
                    value={selectedColor} 
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    <option value="">Seleccionar color</option>
                    {product.colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="config-row">
                  <label>Talla:</label>
                  <select 
                    value={selectedSize} 
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    <option value="">Seleccionar talla</option>
                    {product.sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Resumen de precios */}
            <div className="price-summary">
              <div className="price-row">
                <span>Precio unitario:</span>
                <span>${unitPrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="price-row">
                <span>Cantidad:</span>
                <span>{quantity}</span>
              </div>
              {savings > 0 && (
                <div className="price-row savings">
                  <span>Ahorro por volumen:</span>
                  <span>-${savings.toLocaleString('es-CL')}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total:</span>
                <span>${totalPrice.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>

          {/* Datos de la empresa */}
          <div className="company-section">
            <h2>Datos de la Empresa</h2>
            <form className="company-form">
              <div className="form-group">
                <label>Nombre de la Empresa *</label>
                <input
                  type="text"
                  value={companyData.companyName}
                  onChange={(e) => handleCompanyDataChange('companyName', e.target.value)}
                  placeholder="Ej: ACME Corp"
                  required
                />
              </div>

              <div className="form-group">
                <label>Persona de Contacto *</label>
                <input
                  type="text"
                  value={companyData.contactName}
                  onChange={(e) => handleCompanyDataChange('contactName', e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => handleCompanyDataChange('email', e.target.value)}
                  placeholder="contacto@empresa.cl"
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => handleCompanyDataChange('phone', e.target.value)}
                  placeholder="+56 9 1234 5678"
                  required
                />
              </div>

              <div className="form-group">
                <label>RUT Empresa *</label>
                <input
                  type="text"
                  value={companyData.rut}
                  onChange={(e) => handleCompanyDataChange('rut', e.target.value)}
                  placeholder="12.345.678-9"
                  required
                />
              </div>
            </form>

            <div className="quote-actions">
              <button 
                onClick={() => setShowPreview(true)}
                className="btn btn-secondary"
                disabled={!companyData.companyName || !companyData.email || isGenerating}
              >
                <span className="material-icons">visibility</span>
                Previsualizar
              </button>
              
              <button 
                onClick={handleGenerateQuote}
                className="btn btn-primary"
                disabled={!companyData.companyName || !companyData.email || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="material-icons spin">hourglass_empty</span>
                    Generando...
                  </>
                ) : (
                  <>
                    <span className="material-icons">download</span>
                    Descargar Cotización
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal de previsualización */}
        {/* Modal de previsualización */}
        <QuotePreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          quoteContent={generateQuoteContent(
            product,
            quantity,
            unitPrice,
            totalPrice,
            savings,
            selectedColor,
            selectedSize,
            companyData
          )}
          onDownload={handleGenerateQuote}
        />

        {/* Notificación */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  )
}

export default QuoteSimulator
