import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import QuoteSimulator from './pages/QuoteSimulator'
import { CartProvider } from './contexts'
import './App.css'

function App() {
  return (
    <CartProvider>
      <div className="App">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/quote/:productId" element={<QuoteSimulator />} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  )
}

export default App