import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiSearch, FiShoppingCart, FiX, FiUser } from 'react-icons/fi';
import api from '../services/api';

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const searchProducts = async (term) => {
    if (!term) {
      fetchProducts();
      return;
    }
    try {
      const response = await api.get(`/products/search?q=${term}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Not enough stock');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      if (product.stock === 0) {
        toast.error('Out of stock');
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success('Added to cart');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.15; // 15% VAT
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const { subtotal, tax, total } = calculateTotal();
    
    try {
      const saleData = {
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })),
        payment_method: paymentMethod,
        subtotal,
        tax,
        discount: 0,
        total
      };

      await api.post('/sales', saleData);
      
      toast.success('Sale completed successfully!');
      setCart([]);
      setSelectedCustomer(null);
      setShowCheckout(false);
      fetchProducts(); // Refresh stock
    } catch (error) {
      toast.error('Failed to process sale');
    }
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="flex h-full -m-8">
      {/* Products Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Point of Sale</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products or scan barcode..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              searchProducts(e.target.value);
            }}
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="card p-4 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div 
                className="w-full h-24 rounded-lg mb-3 flex items-center justify-center text-white text-4xl"
                style={{ backgroundColor: product.category_color || '#6366f1' }}
              >
                {product.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{product.category_name}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary-600">R{product.price}</span>
                <span className={`text-xs ${product.stock <= product.min_stock ? 'text-red-500' : 'text-gray-500'}`}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white shadow-xl p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FiShoppingCart className="mr-2" /> Cart
          </h2>
          {selectedCustomer && (
            <div className="flex items-center text-sm text-gray-600">
              <FiUser className="mr-1" />
              {selectedCustomer.name}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Cart is empty</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-500">R{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateQuantity(item.id, 0)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <FiX />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>VAT (15%)</span>
            <span>R{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>R{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={() => setShowCheckout(true)}
          disabled={cart.length === 0}
          className="w-full btn-primary py-3 mt-4 disabled:opacity-50"
        >
          Checkout
        </button>

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96">
              <h3 className="text-xl font-bold mb-4">Complete Sale</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Method</label>
                  <select
                    className="input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="eft">EFT</option>
                  </select>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Due</span>
                    <span>R{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 btn-primary"
                  >
                    Complete Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
