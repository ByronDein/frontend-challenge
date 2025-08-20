import { Link } from 'react-router-dom'
import { useCart } from '../contexts'
import { Product } from '../types/Product'
import './Header.css'

const Header = () => {
  const { totalItems, items } = useCart()

  const showCartDetails = () => {
    if (items.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // Función para calcular el mejor precio para una cantidad específica
    const calculateBestPrice = (product: Product, quantity: number) => {
      if (!product.priceBreaks || product.priceBreaks.length === 0) {
        return { unitPrice: product.basePrice, hasDiscount: false, discountPercent: 0 };
      }

      const applicableBreaks = product.priceBreaks.filter(
        priceBreak => quantity >= priceBreak.minQty
      );

      if (applicableBreaks.length === 0) {
        return { unitPrice: product.basePrice, hasDiscount: false, discountPercent: 0 };
      }

      const bestBreak = applicableBreaks.reduce((best, current) => 
        current.price < best.price ? current : best
      );

      const discountPercent = ((product.basePrice - bestBreak.price) / product.basePrice) * 100;
      
      return { 
        unitPrice: bestBreak.price, 
        hasDiscount: bestBreak.price < product.basePrice,
        discountPercent: Math.round(discountPercent)
      };
    };

    let totalOriginal = 0;
    let totalWithDiscounts = 0;
    let totalSavings = 0;

    const cartDetails = items.map(item => {
      const colorText = item.selectedColor ? ` - ${item.selectedColor}` : '';
      const sizeText = item.selectedSize ? ` - Talla ${item.selectedSize}` : '';
      
      // Calcular precios
      const originalPrice = item.product.basePrice * item.quantity;
      const priceInfo = calculateBestPrice(item.product, item.quantity);
      const finalPrice = priceInfo.unitPrice * item.quantity;
      const savings = originalPrice - finalPrice;

      totalOriginal += originalPrice;
      totalWithDiscounts += finalPrice;
      totalSavings += savings;

      // Generar línea del producto
      let productLine = `• ${item.product.name}${colorText}${sizeText}\n`;
      productLine += `  ${item.quantity} × $${priceInfo.unitPrice.toLocaleString('es-CL')} = $${finalPrice.toLocaleString('es-CL')}`;
      
      if (priceInfo.hasDiscount) {
        productLine += `\n  ✅ Descuento por volumen: ${priceInfo.discountPercent}% (Ahorro: $${savings.toLocaleString('es-CL')})`;
      }

      return productLine;
    }).join('\n\n');

    // Generar resumen final
    let summary = `🛒 CARRITO DE COMPRAS (${totalItems} items)\n\n`;
    summary += `${cartDetails}\n\n`;
    summary += `📊 RESUMEN:\n`;
    summary += `• Subtotal sin descuentos: $${totalOriginal.toLocaleString('es-CL')}\n`;
    
    if (totalSavings > 0) {
      summary += `• Descuentos por volumen: -$${totalSavings.toLocaleString('es-CL')}\n`;
      summary += `• TOTAL CON DESCUENTOS: $${totalWithDiscounts.toLocaleString('es-CL')}\n`;
      summary += `\n💰 ¡Has ahorrado $${totalSavings.toLocaleString('es-CL')}!`;
    } else {
      summary += `• TOTAL: $${totalWithDiscounts.toLocaleString('es-CL')}`;
    }

    alert(summary);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span className="material-icons">store</span>
            </div>
            <span className="logo-text p1-medium">SWAG Challenge</span>
          </Link>

          {/* Navigation */}
          <nav className="nav">
            <Link to="/" className="nav-link l1">
              <span className="material-icons">home</span>
              Catálogo
            </Link>
            <button 
              className="nav-link l1" 
              onClick={showCartDetails}
            >
              <span className="material-icons">shopping_cart</span>
              Carrito ({totalItems})
            </button>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button className="btn btn-secondary cta1">
              <span className="material-icons">person</span>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header