import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import { products as allProducts } from '../data/products'
import { Product } from '../types/Product'
import './ProductList.css'

const ProductList = () => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(allProducts)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSupplier, setSelectedSupplier] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 })

  // Initialize filters on component mount
  useEffect(() => {
    filterProducts('all', 'all', '', 'name', { min: 0, max: 50000 })
  }, [])

  // Filter and sort products based on criteria
  const filterProducts = (category: string, supplier: string, search: string, sort: string, priceFilter: { min: number, max: number }) => {
    let filtered = [...allProducts]

    // Category filter
    if (category !== 'all') {
      filtered = filtered.filter(product => product.category === category)
    }

    // Supplier filter
    if (supplier !== 'all') {
      filtered = filtered.filter(product => product.supplier === supplier)
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.basePrice >= priceFilter.min && product.basePrice <= priceFilter.max
    )

    // Search filter
    if (search) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sorting logic
    switch (sort) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price':
       filtered.sort((a, b) => b.basePrice - a.basePrice)
        break
      case 'stock':
        filtered.sort((a, b) => b.stock - a.stock)
        break
      default:
        break
    }

    setFilteredProducts(filtered)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    filterProducts(category, selectedSupplier, searchQuery, sortBy, priceRange)
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    filterProducts(selectedCategory, selectedSupplier, search, sortBy, priceRange)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    filterProducts(selectedCategory, selectedSupplier, searchQuery, sort, priceRange)
  }
  
  const handleSortBySupplier = (supplier: string) => {
    setSelectedSupplier(supplier)
    filterProducts(selectedCategory, supplier, searchQuery, sortBy, priceRange)
  }

  const handlePriceRangeChange = (newPriceRange: { min: number, max: number }) => {
    setPriceRange(newPriceRange)
    filterProducts(selectedCategory, selectedSupplier, searchQuery, sortBy, newPriceRange)
  }

  const handleClearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedSupplier('all')
    setSortBy('name')
    const defaultPriceRange = { min: 0, max: 50000 }
    setPriceRange(defaultPriceRange)
    filterProducts('all', 'all', '', 'name', defaultPriceRange)
  }

  return (
    <div className="product-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-info">
            <h1 className="page-title h2">Catálogo de Productos</h1>
            <p className="page-subtitle p1">
              Descubre nuestra selección de productos promocionales premium
            </p>
          </div>
          
          <div className="page-stats">
            <div className="stat-item">
              <span className="stat-value p1-medium">{filteredProducts.length}</span>
              <span className="stat-label l1">productos</span>
            </div>
            <div className="stat-item">
              <span className="stat-value p1-medium">6</span>
              <span className="stat-label l1">categorías</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <ProductFilters
          selectedCategory={selectedCategory}
          selectedSupplier={selectedSupplier}
          searchQuery={searchQuery}
          sortBy={sortBy}
          priceRange={priceRange}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          onSortBySupplier={handleSortBySupplier}
          onPriceRangeChange={handlePriceRangeChange}
          onClearAllFilters={handleClearAllFilters}
        />

        {/* Products Grid */}
        <div className="products-section">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons">search_off</span>
              <h3 className="h2">No hay productos</h3>
              <p className="p1">No se encontraron productos que coincidan con tu búsqueda.</p>
              <button 
                className="btn btn-primary cta1"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedSupplier('all')
                  const defaultPriceRange = { min: 0, max: 50000 }
                  setPriceRange(defaultPriceRange)
                  filterProducts('all', 'all', '', sortBy, defaultPriceRange)
                }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductList