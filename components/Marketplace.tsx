import React from 'react';
import { Product } from '../types';

interface MarketplaceProps {
  products: Product[];
}

export const Marketplace: React.FC<MarketplaceProps> = ({ products }) => {
  return (
    <div className="p-4 max-w-6xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden group cursor-pointer border border-gray-100">
            <div className="relative aspect-square overflow-hidden">
              <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            </div>
            <div className="p-3">
              <p className="font-bold text-lg text-gray-900">{product.price}</p>
              <h3 className="text-sm text-gray-700 truncate">{product.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{product.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
