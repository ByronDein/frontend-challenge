import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product } from '../types/Product';

// Definir qué es un item del carrito
interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedPriceBreak?: any;
}

// Definir qué funciones y datos tendrá el context
interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (productId: number, selectedColor?: string, selectedSize?: string) => void;
  updateQuantity: (productId: number, quantity: number, selectedColor?: string, selectedSize?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

// Provider que maneja el estado y la lógica
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('swag-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    setIsLoaded(true); 
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('swag-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Función para agregar al carrito (CON VALIDACIÓN como el input)
  const addToCart = (product: Product, quantity: number, selectedColor?: string, selectedSize?: string) => {
    // VALIDACIÓN: igual que el input de cantidad
    const validatedQuantity = Math.max(1, Math.min(quantity, product.stock));
    
    setItems(prevItems => {
      // Buscar item existente por producto + color + talla
      const existingItem = prevItems.find(item => 
        item.product.id === product.id && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize
      );
      
      if (existingItem) {
        // Si ya existe, actualizar cantidad (con validación)
        return prevItems.map(item =>
          item.product.id === product.id && 
          item.selectedColor === selectedColor && 
          item.selectedSize === selectedSize
            ? { ...item, quantity: Math.min(item.quantity + validatedQuantity, product.stock) }
            : item
        );
      } else {
        // Si no existe, agregarlo con color y talla
        return [...prevItems, { 
          product, 
          quantity: validatedQuantity,
          selectedColor,
          selectedSize
        }];
      }
    });
  };

  // Función para remover del carrito
  const removeFromCart = (productId: number, selectedColor?: string, selectedSize?: string) => {
    setItems(prevItems => prevItems.filter(item => 
      !(item.product.id === productId && 
        item.selectedColor === selectedColor && 
        item.selectedSize === selectedSize)
    ));
  };

  // Función para actualizar cantidad (CON VALIDACIÓN)
  const updateQuantity = (productId: number, quantity: number, selectedColor?: string, selectedSize?: string) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product.id === productId && 
            item.selectedColor === selectedColor && 
            item.selectedSize === selectedSize) {
          // MISMA VALIDACIÓN que el input: min 1, max stock
          const validatedQuantity = Math.max(1, Math.min(quantity, item.product.stock));
          return { ...item, quantity: validatedQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce((total, item) => {
    const { product, quantity } = item;
    
    if (!product.priceBreaks || product.priceBreaks.length === 0) {
      return total + (product.basePrice * quantity);
    }

    const applicableBreaks = product.priceBreaks.filter(
      priceBreak => quantity >= priceBreak.minQty
    );

    if (applicableBreaks.length === 0) {
      return total + (product.basePrice * quantity);
    }

    const bestBreak = applicableBreaks.reduce((best, current) => 
      current.price < best.price ? current : best
    );

    return total + (bestBreak.price * quantity);
  }, 0);

  const contextValue: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

