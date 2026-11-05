import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('farmconnect_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default starter items for demonstration
    return [
      {
        id: 'prod-1',
        name: 'Farm Fresh Organic Vine Tomatoes',
        category: 'Nightshades',
        price: 60,
        unit: 'KG',
        quantity: 2,
        availableStock: 240,
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
        farmer: {
          id: 'usr-farm-1',
          name: 'Ramesh Patil',
          channelId: 'FC-CH-00001245',
          channelName: 'Sahyadri Organic Orchards',
          location: 'Pune District, Maharashtra',
        },
      },
      {
        id: 'prod-2',
        name: 'Crisp Hydroponic Baby Spinach',
        category: 'Leafy Greens',
        price: 45,
        unit: 'Bundle',
        quantity: 3,
        availableStock: 180,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
        farmer: {
          id: 'usr-farm-1',
          name: 'Ramesh Patil',
          channelId: 'FC-CH-00001245',
          channelName: 'Sahyadri Organic Orchards',
          location: 'Pune District, Maharashtra',
        },
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('farmconnect_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === (product.id || product._id));
      if (existing) {
        return prev.map((item) =>
          item.id === (product.id || product._id)
            ? { ...item, quantity: Math.min(item.availableStock || 999, item.quantity + qty) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id || product._id,
          name: product.name,
          category: product.category,
          price: product.price,
          unit: product.unit || 'KG',
          quantity: qty,
          availableStock: product.availableStock || 100,
          image: product.images?.[0] || product.image,
          farmer: product.channel
            ? {
                id: product.channel.farmerId || 'usr-farm-1',
                name: product.channel.farmerName || 'Verified Farmer',
                channelId: product.channel.channelId,
                channelName: product.channel.name,
                location: product.channel.location,
              }
            : {
                id: 'usr-farm-1',
                name: 'Verified Farmer',
                channelId: 'FC-CH-00001245',
                channelName: 'Organic Farm Channel',
                location: 'Maharashtra',
              },
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(item.availableStock || 999, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  // Group cart items by Farmer Channel (Instruction 41)
  const groupedByFarmer = items.reduce((acc, item) => {
    const channelKey = item.farmer?.channelId || 'general';
    if (!acc[channelKey]) {
      acc[channelKey] = {
        farmer: item.farmer,
        items: [],
        subtotal: 0,
        deliveryFee: 40,
      };
    }
    acc[channelKey].items.push(item);
    acc[channelKey].subtotal += item.price * item.quantity;
    return acc;
  }, {});

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = Object.keys(groupedByFarmer).length * 40; // ₹40 per farm order
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        subtotal,
        deliveryFee,
        grandTotal,
        groupedByFarmer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
