import { Product } from '../types/Product'

interface CompanyData {
  companyName: string
  contactName: string
  email: string
  phone: string
  rut: string
}

export const generateQuoteContent = (
  product: Product,
  quantity: number,
  unitPrice: number,
  totalPrice: number,
  savings: number,
  selectedColor?: string,
  selectedSize?: string,
  companyData?: CompanyData
) => {
  const currentDate = new Date().toLocaleDateString('es-CL')
  const quoteNumber = `COT-${Date.now()}`
  
  const content = `
═══════════════════════════════════════════════════════════════
                         COTIZACIÓN SWAG CHILE
═══════════════════════════════════════════════════════════════

📋 INFORMACIÓN GENERAL
   Número de Cotización: ${quoteNumber}
   Fecha: ${currentDate}
   Válida hasta: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CL')}

🏢 DATOS DE LA EMPRESA
   Empresa: ${companyData?.companyName || 'Sin especificar'}
   Contacto: ${companyData?.contactName || 'Sin especificar'}
   Email: ${companyData?.email || 'Sin especificar'}
   Teléfono: ${companyData?.phone || 'Sin especificar'}
   RUT: ${companyData?.rut || 'Sin especificar'}

📦 DETALLE DEL PRODUCTO
   Producto: ${product.name}
   SKU: ${product.sku}
   Categoría: ${product.category}
   ${selectedColor ? `Color: ${selectedColor}` : ''}
   ${selectedSize ? `Talla: ${selectedSize}` : ''}

💰 DETALLE DE PRECIOS
   Precio Base Unitario: $${product.basePrice.toLocaleString('es-CL')}
   Precio Aplicado: $${unitPrice.toLocaleString('es-CL')}
   Cantidad Solicitada: ${quantity} unidades
   ${savings > 0 ? `Ahorro por Volumen: $${savings.toLocaleString('es-CL')}` : ''}
   
   TOTAL: $${totalPrice.toLocaleString('es-CL')}

${product.priceBreaks && product.priceBreaks.length > 0 ? `
📊 TABLA DE DESCUENTOS POR VOLUMEN
${product.priceBreaks.map(priceBreak => {
  const discount = ((product.basePrice - priceBreak.price) / product.basePrice * 100).toFixed(0)
  return `   ${priceBreak.minQty}+ unidades: $${priceBreak.price.toLocaleString('es-CL')} (${discount}% descuento)`
}).join('\n')}
` : ''}

📝 TÉRMINOS Y CONDICIONES
   • Precios en pesos chilenos (CLP)
   • Precios no incluyen IVA
   • Cotización válida por 30 días
   • Tiempo de entrega: 7-14 días hábiles
   • Forma de pago: Por definir

═══════════════════════════════════════════════════════════════
                    SWAG CHILE - Soluciones Corporativas
                    contacto@swag.cl 
═══════════════════════════════════════════════════════════════
  `
  
  return content.trim()
}

export const downloadQuote = (content: string, companyName: string, productSku: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Cotizacion_${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${productSku}_${new Date().toISOString().split('T')[0]}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
