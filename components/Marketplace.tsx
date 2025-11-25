
import React, { useState, useEffect, useRef } from 'react';
import { Product, Store, Order, User, PayoutDetails, OrderItem } from '../types';
import { ShoppingBagIcon, StoreIcon, BoxIcon, TrendingUpIcon, ShieldCheckIcon, PlusIcon, SearchIcon, FilterIcon, CloseIcon, MagicIcon, CheckIcon, CreditCardIcon, TruckIcon, StarIcon, BackIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, SlidersIcon, WalletIcon, BankIcon, LockIcon, UsersIcon, HeartIcon, ShareIcon, PencilIcon, UploadIcon, ChartBarIcon, ClockIcon, MapIcon, VideoIcon } from './Icons';
import { MARKET_ITEMS, MOCK_STORES, MOCK_ORDERS, CURRENT_USER, MARKET_BANNERS } from '../services/mockData';

// View Modes for Marketplace
type MarketView = 'BROWSE' | 'PRODUCT' | 'STORE' | 'CART' | 'CHECKOUT' | 'SELLER_DASHBOARD' | 'ADD_PRODUCT' | 'ORDERS';
type DashboardTab = 'DASHBOARD' | 'PRODUCTS' | 'ORDERS';

// --- New Components for Shopping Flow ---

const ProductDetail = ({ product, store, onBack, onAddToCart, onBuyNow, onViewStore }: { product: Product, store: Store | undefined, onBack: () => void, onAddToCart: (q: number) => void, onBuyNow: (q: number) => void, onViewStore: (s: Store) => void }) => {
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(product.images[0] || product.image);
    
    return (
        <div className="p-4 md:p-8 pb-20 animate-fade-in">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white mb-6">
                <BackIcon className="w-5 h-5" /> Back to Marketplace
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
                        <img src={mainImage} alt={product.title} className="w-full h-full object-cover transition-transform duration-300" />
                    </div>
                    {product.images.length > 1 && (
                        <div className="flex gap-3">
                            {product.images.map((img, idx) => (
                                <div key={idx} onClick={() => setMainImage(img)} className={`w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition ${mainImage === img ? 'border-blue-500' : 'border-transparent hover:border-gray-300'}`}>
                                    <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <span className="text-xs font-bold text-blue-600 uppercase">{product.category}</span>
                    <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mt-2 mb-4">{product.title}</h1>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{product.price}</div>
                        <div className="flex items-center gap-1">
                            {Array.from({length: 5}).map((_, i) => <StarIcon key={i} className="w-5 h-5 text-yellow-400" filled={i < (product.rating || 0)} />)}
                            <span className="text-sm text-gray-500 ml-1">({product.reviewCount || 0} reviews)</span>
                        </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">{product.description}</p>
                    
                    {store && (
                        <div onClick={() => onViewStore(store)} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-4 mb-8 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                            <img src={store.logo} className="w-12 h-12 rounded-full" alt={store.name} />
                            <div>
                                <h3 className="font-bold dark:text-white">{store.name}</h3>
                                <p className="text-xs text-gray-500">{store.followers} followers</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                        <label htmlFor="quantity" className="font-bold text-sm">Quantity:</label>
                        <select id="quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 outline-none font-bold">
                            {[...Array(Math.min(product.stock, 10)).keys()].map(i => <option key={i+1} value={i+1}>{i+1}</option>)}
                        </select>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => onAddToCart(quantity)} className="flex-1 py-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition active:scale-95">
                            Add to Cart
                        </button>
                         <button onClick={() => onBuyNow(quantity)} className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-80 transition shadow-lg active:scale-95">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CartView = ({ cart, products, onUpdateQuantity, onRemoveItem, onCheckout, onContinueShopping }: { cart: OrderItem[], products: Product[], onUpdateQuantity: (id: string, q: number) => void, onRemoveItem: (id: string) => void, onCheckout: () => void, onContinueShopping: () => void }) => {
    const cartDetails = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        return { ...item, ...product };
    });
    
    const subtotal = cartDetails.reduce((sum, item) => sum + (item.rawPrice || 0) * item.quantity, 0);
    const shipping = subtotal > 0 ? 5.99 : 0;
    const total = subtotal + shipping;

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-3xl font-black mb-8 dark:text-white">Your Cart</h1>
            {cart.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 mb-4">Your cart is empty.</p>
                    <button onClick={onContinueShopping} className="bg-black dark:bg-white text-white dark:text-black font-bold px-6 py-3 rounded-lg">Continue Shopping</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartDetails.map(item => (
                            <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                                <img src={item.image} className="w-20 h-20 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <h3 className="font-bold dark:text-white">{item.title}</h3>
                                    <p className="text-sm text-blue-500 font-bold">{item.price}</p>
                                </div>
                                <select value={item.quantity} onChange={e => onUpdateQuantity(item.id!, Number(e.target.value))} className="bg-gray-100 dark:bg-gray-700 rounded p-2 text-sm">
                                    {[...Array(10).keys()].map(i => <option key={i+1}>{i+1}</option>)}
                                </select>
                                <button onClick={() => onRemoveItem(item.id!)} className="p-2 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-fit sticky top-24">
                        <h2 className="text-lg font-bold border-b pb-3 mb-4 dark:text-white">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3 dark:text-white"><span>Total</span><span>${total.toFixed(2)}</span></div>
                        </div>
                        <button onClick={onCheckout} className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Proceed to Checkout</button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CheckoutView = ({ cart, products, total, onPlaceOrder, onBack }: { cart: OrderItem[], products: Product[], total: number, onPlaceOrder: () => void, onBack: () => void }) => {
    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black dark:hover:text-white mb-6">
                <BackIcon className="w-5 h-5" /> Back to Cart
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Shipping Address</h2>
                    <div className="space-y-4">
                        <input className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700" placeholder="Full Name" defaultValue={`${CURRENT_USER.firstName} ${CURRENT_USER.lastName}`} />
                        <input className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700" placeholder="Address" defaultValue="123 Market St" />
                        <div className="flex gap-4">
                            <input className="flex-1 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700" placeholder="City" defaultValue="San Francisco" />
                            <input className="flex-1 p-3 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700" placeholder="ZIP Code" defaultValue="94105" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold mt-8 mb-4 dark:text-white">Payment Method</h2>
                    <div className="space-y-3">
                        <div className="p-4 border-2 border-blue-500 rounded-lg flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20">
                            <div className="w-4 h-4 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-blue-500"></div></div>
                            <CreditCardIcon className="w-6 h-6 text-blue-500" />
                            <span className="font-bold text-sm dark:text-white">Credit/Debit Card</span>
                        </div>
                        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                            <span>PayPal</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg h-fit">
                     <h2 className="text-lg font-bold border-b pb-3 mb-4 dark:text-white">Order Summary</h2>
                     {cart.map(item => {
                         const product = products.find(p => p.id === item.productId);
                         return (
                            <div key={item.productId} className="flex justify-between items-center text-sm py-2">
                                <span className="text-gray-600 dark:text-gray-300">{item.title} x {item.quantity}</span>
                                <span className="font-bold dark:text-white">${((product?.rawPrice || 0) * item.quantity).toFixed(2)}</span>
                            </div>
                         );
                     })}
                     <div className="border-t mt-4 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>${(total - 5.99).toFixed(2)}</span></div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>Shipping</span><span>$5.99</span></div>
                        <div className="flex justify-between font-bold text-lg dark:text-white"><span>Total</span><span>${total.toFixed(2)}</span></div>
                     </div>
                     <button onClick={onPlaceOrder} className="w-full mt-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition">Place Order</button>
                </div>
            </div>
        </div>
    );
};

const OrderConfirmation = ({ order, onContinueShopping }: { order: Order, onContinueShopping: () => void }) => {
    return (
        <div className="p-4 md:p-8 animate-fade-in text-center max-w-lg mx-auto">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-black mb-4 dark:text-white">Order Confirmed!</h1>
            <p className="text-gray-600 dark:text-gray-300">Thank you for your purchase. Your order <span className="font-bold text-black dark:text-white">#{order.id}</span> is being processed.</p>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-left my-8">
                <h2 className="text-lg font-bold border-b pb-3 mb-4 dark:text-white">Order Summary</h2>
                {order.items.map(item => (
                    <div key={item.productId} className="flex justify-between items-center text-sm py-2">
                        <span className="text-gray-600 dark:text-gray-300">{item.title} x {item.quantity}</span>
                        <span className="font-bold dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
                <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg dark:text-white">
                    <span>Total</span><span>${order.total.toFixed(2)}</span>
                </div>
            </div>
            <button onClick={onContinueShopping} className="w-full mt-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">Continue Shopping</button>
        </div>
    );
};

const PromoCarousel = ({ onBannerClick }: { onBannerClick: (category: string) => void }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const timeoutRef = useRef<any>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            setCurrentSlide((prev) => (prev === MARKET_BANNERS.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => resetTimeout();
    }, [currentSlide]);

    const getCategoryForBanner = (title: string) => {
        if (title.includes('Fashion') || title.includes('Summer')) return 'Fashion';
        if (title.includes('Tech') || title.includes('Gadgets')) return 'Electronics';
        if (title.includes('Home') || title.includes('Decor')) return 'Home';
        return 'All';
    };

    return (
        <div className="relative w-full h-64 md:h-96 rounded-[2rem] overflow-hidden mb-10 group shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
            {MARKET_BANNERS.map((banner, idx) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                >
                    <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center px-8 md:px-16">
                        <div className={`transition-all duration-700 delay-100 transform ${idx === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full mb-4 border border-white/10">LIMITED TIME OFFER</span>
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-4 tracking-tight leading-none">{banner.title}</h2>
                            <p className="text-white/90 text-lg md:text-2xl mb-8 max-w-lg font-light leading-relaxed">{banner.subtitle}</p>
                            <button 
                                onClick={() => onBannerClick(getCategoryForBanner(banner.title))}
                                className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-all shadow-xl hover:shadow-white/20 transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 group/btn"
                            >
                                <ShoppingBagIcon className="w-5 h-5 transition-transform group-hover/btn:-rotate-12" /> 
                                Shop Now
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10 bg-black/20 backdrop-blur-md px-3 py-2 rounded-full">
                {MARKET_BANNERS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`}
                    />
                ))}
            </div>
            
            <button onClick={() => setCurrentSlide(prev => prev === 0 ? MARKET_BANNERS.length - 1 : prev - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0 border border-white/10">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentSlide(prev => prev === MARKET_BANNERS.length - 1 ? 0 : prev + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 border border-white/10">
                <ChevronRightIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

const FilterSidebar = ({ 
    filters, 
    setFilters, 
    isOpen, 
    onClose 
}: { 
    filters: any, 
    setFilters: any, 
    isOpen: boolean, 
    onClose: () => void 
}) => {
    return (
        <div className={`fixed inset-y-0 right-0 z-[60] w-80 bg-white dark:bg-[#1a1a1a] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 lg:w-64 lg:block lg:shadow-none lg:bg-transparent dark:lg:bg-transparent border-l lg:border-none border-gray-100 dark:border-[#333]`}>
            <div className="p-6 h-full overflow-y-auto">
                <div className="flex justify-between items-center mb-8 lg:hidden">
                    <h3 className="font-extrabold text-2xl dark:text-white">Filters</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                </div>

                {/* Price Range */}
                <div className="mb-10">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Price Range</h4>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">$</span>
                            <input 
                                type="number" 
                                value={filters.minPrice} 
                                onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                                className="w-full pl-6 pr-2 py-2 bg-gray-50 dark:bg-[#252525] rounded-xl text-sm dark:text-white outline-none focus:ring-2 ring-blue-500 transition" 
                                placeholder="0"
                            />
                        </div>
                        <span className="text-gray-300">-</span>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">$</span>
                            <input 
                                type="number" 
                                value={filters.maxPrice} 
                                onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                                className="w-full pl-6 pr-2 py-2 bg-gray-50 dark:bg-[#252525] rounded-xl text-sm dark:text-white outline-none focus:ring-2 ring-blue-500 transition" 
                                placeholder="1000"
                            />
                        </div>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="1000" 
                        value={filters.maxPrice} 
                        onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                        className="w-full accent-blue-600 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                {/* Categories */}
                <div className="mb-10">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Categories</h4>
                    <div className="space-y-3">
                        {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'].map(cat => (
                            <label key={cat} className="flex items-center gap-3 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${filters.categories.includes(cat) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-transparent'}`}>
                                    {filters.categories.includes(cat) && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={filters.categories.includes(cat)}
                                    onChange={() => {
                                        if (filters.categories.includes(cat)) {
                                            setFilters({...filters, categories: filters.categories.filter((c: string) => c !== cat)});
                                        } else {
                                            setFilters({...filters, categories: [...filters.categories, cat]});
                                        }
                                    }}
                                />
                                <span className={`text-sm font-medium transition ${filters.categories.includes(cat) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rating */}
                <div className="mb-10">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-4">Rating</h4>
                    {[4, 3, 2, 1].map(stars => (
                        <label key={stars} className="flex items-center gap-3 mb-2 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${filters.rating === stars ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                {filters.rating === stars && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                            </div>
                            <input 
                                type="radio" 
                                name="rating" 
                                checked={filters.rating === stars}
                                onChange={() => setFilters({...filters, rating: stars})}
                                className="hidden"
                            />
                            <div className="flex text-yellow-400 gap-0.5">
                                {Array.from({length: 5}).map((_, i) => (
                                    <StarIcon key={i} className="w-4 h-4" filled={i < stars} />
                                ))}
                            </div>
                            <span className="text-xs font-bold text-gray-400">& Up</span>
                        </label>
                    ))}
                </div>

                <button 
                    onClick={() => setFilters({ minPrice: 0, maxPrice: 1000, categories: [], rating: 0, sortBy: 'newest' })}
                    className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2f2f2f] transition"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};

// --- Seller Wallet & Payouts ---
const SellerWallet = ({ store, onUpdate }: { store: Store, onUpdate: (s: Store) => void }) => {
    const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank'>(store.payoutDetails?.method || 'upi');
    const [upiId, setUpiId] = useState(store.payoutDetails?.upiId || '');
    const [holderName, setHolderName] = useState(store.payoutDetails?.holderName || '');
    const [accountNumber, setAccountNumber] = useState(store.payoutDetails?.accountNumber || '');
    const [ifsc, setIfsc] = useState(store.payoutDetails?.ifsc || '');
    const [isEditing, setIsEditing] = useState(!store.payoutDetails);
    const [isRequesting, setIsRequesting] = useState(false);

    const handleSave = () => {
        if (!holderName || (payoutMethod === 'upi' && !upiId) || (payoutMethod === 'bank' && (!accountNumber || !ifsc))) {
            alert("Please fill all fields.");
            return;
        }
        onUpdate({
            ...store,
            payoutDetails: {
                method: payoutMethod,
                holderName,
                upiId: payoutMethod === 'upi' ? upiId : undefined,
                accountNumber: payoutMethod === 'bank' ? accountNumber : undefined,
                ifsc: payoutMethod === 'bank' ? ifsc : undefined
            }
        });
        setIsEditing(false);
    };

    const totalRevenue = store.totalRevenue || 12450;
    const commissionRate = 0.05; // 5%
    const totalCommission = totalRevenue * commissionRate;
    const netPayable = totalRevenue - totalCommission;

    const handleRequestPayout = () => {
        if (!store.payoutDetails) {
            alert("Please configure payout details first.");
            setIsEditing(true);
            return;
        }
        if (netPayable < 50) {
            alert("Minimum payout amount is $50.");
            return;
        }
        
        setIsRequesting(true);
        // Simulate API Call
        setTimeout(() => {
            setIsRequesting(false);
            alert(`Payout of $${netPayable.toFixed(2)} requested successfully! You will receive funds within 24-48 hours.`);
            // In a real app, we would reduce the "available" balance here.
        }, 1500);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Earnings Card */}
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110"><WalletIcon className="w-64 h-64" /></div>
                <div className="relative z-10">
                    <h3 className="text-sm font-bold text-blue-200 mb-2 uppercase tracking-widest">Net Earnings</h3>
                    <div className="text-5xl font-black mb-6 tracking-tight">${netPayable.toFixed(2)}</div>
                    
                    <div className="space-y-3 text-sm mb-8 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                        <div className="flex justify-between text-blue-100"><span>Total Revenue</span> <span className="font-mono font-bold">${totalRevenue.toFixed(2)}</span></div>
                        <div className="flex justify-between text-red-200"><span>Platform Fee (5%)</span> <span className="font-mono font-bold">-${totalCommission.toFixed(2)}</span></div>
                    </div>
                    
                    <button 
                        onClick={handleRequestPayout}
                        disabled={isRequesting}
                        className="w-full bg-white text-blue-900 hover:bg-blue-50 py-3.5 rounded-xl font-bold text-sm transition shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isRequesting ? 'Processing...' : 'Request Payout'}
                    </button>
                </div>
            </div>

            {/* Payout Settings */}
            <div className="bg-white dark:bg-[#1f1f1f] rounded-[2rem] p-8 border border-gray-100 dark:border-[#333] shadow-sm flex flex-col justify-center">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><BankIcon className="w-6 h-6 text-green-500" /> Payout Details</h3>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="text-blue-500 text-sm font-bold hover:underline">Edit</button>}
                </div>

                {isEditing ? (
                    <div className="space-y-4">
                        <div className="flex gap-2 bg-gray-100 dark:bg-[#2f2f2f] p-1.5 rounded-xl">
                            <button onClick={() => setPayoutMethod('upi')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${payoutMethod === 'upi' ? 'bg-white dark:bg-[#3f3f3f] shadow-sm dark:text-white' : 'text-gray-500'}`}>UPI</button>
                            <button onClick={() => setPayoutMethod('bank')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${payoutMethod === 'bank' ? 'bg-white dark:bg-[#3f3f3f] shadow-sm dark:text-white' : 'text-gray-500'}`}>Bank Transfer</button>
                        </div>
                        
                        <input 
                            placeholder="Account Holder Name"
                            value={holderName}
                            onChange={e => setHolderName(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-[#2f2f2f] rounded-xl outline-none dark:text-white text-sm border border-transparent focus:border-blue-500 transition"
                        />

                        {payoutMethod === 'upi' ? (
                            <input 
                                placeholder="UPI ID (e.g. name@upi)"
                                value={upiId}
                                onChange={e => setUpiId(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-[#2f2f2f] rounded-xl outline-none dark:text-white text-sm border border-transparent focus:border-blue-500 transition"
                            />
                        ) : (
                            <>
                                <input 
                                    placeholder="Account Number"
                                    value={accountNumber}
                                    onChange={e => setAccountNumber(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-[#2f2f2f] rounded-xl outline-none dark:text-white text-sm border border-transparent focus:border-blue-500 transition"
                                />
                                <input 
                                    placeholder="IFSC Code"
                                    value={ifsc}
                                    onChange={e => setIfsc(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-[#2f2f2f] rounded-xl outline-none dark:text-white text-sm border border-transparent focus:border-blue-500 transition"
                                />
                            </>
                        )}
                        <button onClick={handleSave} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 shadow-lg shadow-green-500/30 transition active:scale-95">Save Details</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-5 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30">
                            <div className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-2 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active Method
                            </div>
                            <div className="font-bold text-lg dark:text-white flex items-center gap-2 mb-1">
                                {store.payoutDetails?.method === 'upi' ? 'UPI' : 'Bank Transfer'}
                                <CheckIcon className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-gray-600 dark:text-gray-300 font-mono">
                                {store.payoutDetails?.method === 'upi' ? store.payoutDetails.upiId : `Acct: ****${store.payoutDetails?.accountNumber?.slice(-4)}`}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{store.payoutDetails?.holderName}</div>
                        </div>
                        <div className="flex gap-2 items-center text-xs text-gray-400 px-2">
                            <LockIcon className="w-3 h-3" />
                            Payments are processed securely via Razorpay/Stripe
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Seller Analytics Component ---
const SellerAnalytics = () => {
    const salesData = [40, 70, 35, 90, 60, 80, 50]; // Mock data
    const maxSale = Math.max(...salesData);

    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-[2rem] border border-gray-100 dark:border-[#333] mb-8">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <ChartBarIcon className="w-6 h-6 text-blue-500" /> Performance
                </h3>
                <select className="bg-gray-50 dark:bg-[#252525] text-sm border-none rounded-lg px-3 py-1 dark:text-white outline-none">
                    <option>Last 7 Days</option>
                    <option>Last Month</option>
                </select>
            </div>

            <div className="flex items-end justify-between h-48 gap-2 md:gap-4 mb-6">
                {salesData.map((value, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                        <div className="relative w-full flex justify-end flex-col h-full">
                            <div 
                                className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-xl transition-all duration-500 group-hover:bg-blue-500 dark:group-hover:bg-blue-600 relative"
                                style={{ height: `${(value / maxSale) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ${value * 10}
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{['M','T','W','T','F','S','S'][i]}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Orders</p>
                    <p className="text-xl font-black dark:text-white">1,240</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Product Views</p>
                    <p className="text-xl font-black dark:text-white">45.2K</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-2xl">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Conv. Rate</p>
                    <p className="text-xl font-black text-green-500">2.8%</p>
                </div>
            </div>
        </div>
    );
};

// --- Order Tracking Component ---
const OrderTracking: React.FC<{ order: Order }> = ({ order }) => {
    const steps = [
        { status: 'pending', label: 'Order Placed', date: order.date, icon: <CheckIcon className="w-4 h-4" /> },
        { status: 'confirmed', label: 'Confirmed', date: 'Processing', icon: <BoxIcon className="w-4 h-4" /> },
        { status: 'shipped', label: 'Shipped', date: 'In Transit', icon: <TruckIcon className="w-4 h-4" /> },
        { status: 'delivered', label: 'Delivered', date: 'Expected soon', icon: <ShoppingBagIcon className="w-4 h-4" /> },
    ];

    // Determine current step index based on status
    const currentStepIndex = steps.findIndex(s => s.status === order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2rem] border border-gray-100 dark:border-[#333] mb-4">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-lg dark:text-white">Order #{order.id.toUpperCase()}</h3>
                    <p className="text-sm text-gray-500">Total: ${order.total}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                    {order.status}
                </span>
            </div>

            <div className="space-y-4 mb-6">
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-[#252525] rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-sm dark:text-white">{item.title}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity} • ${item.price}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tracking Timeline */}
            {!isCancelled && (
                <div className="relative flex justify-between items-start mt-8">
                    {/* Progress Line */}
                    <div className="absolute top-4 left-0 right-0 h-1 bg-gray-100 dark:bg-[#333] -z-10 rounded-full">
                        <div 
                            className="h-full bg-green-500 rounded-full transition-all duration-500" 
                            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                        ></div>
                    </div>

                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.status} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#444] text-gray-300'}`}>
                                    {step.icon}
                                </div>
                                <div className="text-center">
                                    <p className={`text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-[10px] text-gray-400">{step.date}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// --- Add/Edit Product Screen ---
const AddProductScreen = ({ product, onSave, onBack }: { product?: Product, onSave: (p: Product) => void, onBack: () => void }) => {
    const [title, setTitle] = useState(product?.title || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.rawPrice || '');
    const [category, setCategory] = useState(product?.category || 'Electronics');
    const [stock, setStock] = useState(product?.stock || 1);
    const [images, setImages] = useState<string[]>(product?.images || []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file: File = e.target.files[0];
            setImages(prev => [...prev, URL.createObjectURL(file)]);
        }
    };
    
    const handleSave = () => {
        if (!title || !price || images.length === 0) {
            alert("Please fill title, price, and add at least one image.");
            return;
        }
        const newProduct: Product = {
            id: product?.id || `p_${Date.now()}`,
            title,
            description,
            price: `$${price}`,
            rawPrice: Number(price),
            category,
            stock: Number(stock),
            images,
            image: images[0],
            location: 'San Francisco, CA', // Mock
            sellerId: CURRENT_USER.id
        };
        onSave(newProduct);
    };

    return (
        <div className="p-4 md:p-8 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-full"><BackIcon className="w-6 h-6 dark:text-white"/></button>
                <h2 className="text-xl font-bold dark:text-white">{product ? "Edit Product" : "Add New Product"}</h2>
            </div>
            
            <div className="space-y-6 max-w-2xl mx-auto">
                {/* Image Uploader */}
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Images</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                        {images.map((img, i) => (
                            <div key={i} className="aspect-square bg-gray-100 dark:bg-[#2f2f2f] rounded-xl overflow-hidden relative group">
                                <img src={img} className="w-full h-full object-cover" />
                                <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <div 
                            onClick={() => fileInputRef.current?.click()} 
                            className="aspect-square bg-gray-50 dark:bg-[#252525] rounded-xl border-2 border-dashed border-gray-300 dark:border-[#444] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition text-gray-400 hover:text-blue-500"
                        >
                            <UploadIcon className="w-8 h-8" />
                            <span className="text-xs mt-1">Add Image</span>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Title</label>
                    <div className="relative">
                        <input 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-blue-500 transition font-medium"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Description</label>
                    <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-blue-500 transition resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Price ($)</label>
                        <input 
                            type="number"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-blue-500 transition"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Category</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-blue-500 transition"
                        >
                            {['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'].map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2 uppercase">Stock</label>
                        <input 
                            type="number"
                            value={stock}
                            onChange={e => setStock(Number(e.target.value))}
                            className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl outline-none dark:text-white border-2 border-transparent focus:border-blue-500 transition"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onBack} className="px-6 py-3 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-xl transition">Cancel</button>
                    <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg active:scale-95">
                        {product ? 'Save Changes' : 'Publish Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Marketplace Component ---
export const Marketplace = ({ initialProduct }: { initialProduct?: Product | null }) => {
    const [view, setView] = useState<MarketView>('BROWSE');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [dashboardTab, setDashboardTab] = useState<DashboardTab>('DASHBOARD');
    
    const [products, setProducts] = useState(MARKET_ITEMS);
    const [stores, setStores] = useState(MOCK_STORES);
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [myStore, setMyStore] = useState<Store | null>(() => stores.find(s => s.sellerId === CURRENT_USER.id) || null);
    
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [orderComplete, setOrderComplete] = useState<Order | null>(null);

    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 1000,
        categories: [] as string[],
        rating: 0,
        sortBy: 'newest'
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        if (initialProduct) {
            setSelectedProduct(initialProduct);
            setView('PRODUCT');
        }
    }, [initialProduct]);
    
    const myProducts = products.filter(p => p.sellerId === CURRENT_USER.id);
    const myOrders = orders; // Simplified: all orders are related to my store

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filters.categories.length === 0 || filters.categories.includes(p.category);
        const matchesPrice = (p.rawPrice || 0) >= filters.minPrice && (p.rawPrice || 0) <= filters.maxPrice;
        const matchesRating = !filters.rating || (p.rating || 0) >= filters.rating;
        return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    }).sort((a, b) => {
        if (filters.sortBy === 'price_asc') return (a.rawPrice || 0) - (b.rawPrice || 0);
        if (filters.sortBy === 'price_desc') return (b.rawPrice || 0) - (a.rawPrice || 0);
        return 0; // Default: 'newest' is pre-sorted
    });

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setView('PRODUCT');
    };

    const handleStoreClick = (store: Store) => {
        setSelectedStore(store);
        setView('STORE');
    };
    
    const handleSaveProduct = (product: Product) => {
        const exists = products.find(p => p.id === product.id);
        if (exists) {
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            setProducts([product, ...products]);
        }
        setView('SELLER_DASHBOARD');
        setDashboardTab('PRODUCTS');
    };
    
    const handleCreateStore = () => {
        const newStore: Store = {
            id: `s_${Date.now()}`,
            sellerId: CURRENT_USER.id,
            name: `${CURRENT_USER.name}'s Store`,
            logo: CURRENT_USER.avatar,
            banner: CURRENT_USER.coverImage || '',
            rating: 0,
            followers: 0,
            description: `Welcome to my store!`
        };
        setStores([...stores, newStore]);
        setMyStore(newStore);
    };

    const handleAddToCart = (product: Product, quantity: number, showAlert = true) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [...prevCart, {
                    productId: product.id,
                    quantity,
                    title: product.title,
                    price: product.rawPrice || 0
                }];
            }
        });
        if (showAlert) {
            alert(`${quantity} x "${product.title}" added to cart!`);
        }
    };

    const handleBuyNow = (product: Product, quantity: number) => {
        handleAddToCart(product, quantity, false);
        setView('CHECKOUT');
    };

    const handleUpdateCartQuantity = (productId: string, newQuantity: number) => {
        setCart(cart => cart.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
    };

    const handleRemoveFromCart = (productId: string) => {
        setCart(cart => cart.filter(item => item.productId !== productId));
    };

    const handlePlaceOrder = () => {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + 5.99;
        const newOrder: Order = {
            id: `o_${Math.floor(Math.random() * 10000)}`,
            buyerId: CURRENT_USER.id,
            items: cart,
            total,
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            shippingAddress: '123 Market St, San Francisco, CA 94105', // Mocked
            paymentMethod: 'online',
        };
        setOrders(prev => [newOrder, ...prev]);
        setCart([]);
        setOrderComplete(newOrder);
    };

    const renderContent = () => {
        switch(view) {
            case 'PRODUCT':
                if (!selectedProduct) { setView('BROWSE'); return null; }
                const store = stores.find(s => s.sellerId === selectedProduct.sellerId);
                return <ProductDetail product={selectedProduct} store={store} onBack={() => setView('BROWSE')} onAddToCart={(q) => handleAddToCart(selectedProduct, q)} onBuyNow={(q) => handleBuyNow(selectedProduct, q)} onViewStore={handleStoreClick} />;

            case 'CART':
                return <CartView cart={cart} products={products} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveFromCart} onCheckout={() => setView('CHECKOUT')} onContinueShopping={() => setView('BROWSE')} />;

            case 'CHECKOUT':
                const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
                const total = subtotal + (subtotal > 0 ? 5.99 : 0);
                return orderComplete ? (
                    <OrderConfirmation order={orderComplete} onContinueShopping={() => { setOrderComplete(null); setView('BROWSE'); }} />
                ) : (
                    <CheckoutView cart={cart} products={products} total={total} onPlaceOrder={handlePlaceOrder} onBack={() => setView('CART')} />
                );

            case 'ADD_PRODUCT':
                return <AddProductScreen product={selectedProduct || undefined} onSave={handleSaveProduct} onBack={() => { setView('SELLER_DASHBOARD'); setDashboardTab('PRODUCTS'); }} />;
            // Add other cases for STORE, ORDERS later
            case 'SELLER_DASHBOARD':
                 if (!myStore) {
                    return (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-[#1f1f1f] rounded-full flex items-center justify-center mb-6">
                                <StoreIcon className="w-12 h-12 text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-bold dark:text-white">Become a Seller on MyConnect</h2>
                            <p className="text-gray-500 mt-2 mb-6 max-w-sm">Set up your own store to sell products directly to your followers and the MyConnect community.</p>
                            <button onClick={handleCreateStore} className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-bold hover:opacity-80 transition shadow-lg">
                                Create Your Store
                            </button>
                        </div>
                    );
                 }
                 return (
                     <div className="p-4 md:p-8 pb-20">
                         <div className="flex items-center gap-4 mb-8">
                             <button onClick={() => setView('BROWSE')} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2f2f2f] rounded-full"><BackIcon className="w-6 h-6 dark:text-white"/></button>
                             <img src={myStore.logo} className="w-12 h-12 rounded-full" />
                             <div>
                                <h2 className="text-xl font-bold dark:text-white">{myStore.name}</h2>
                                <p className="text-xs text-gray-500">Seller Dashboard</p>
                             </div>
                         </div>

                         {/* Tabs */}
                         <div className="flex gap-2 p-1.5 bg-gray-100 dark:bg-[#1f1f1f] rounded-full mb-8 max-w-md">
                             {['DASHBOARD', 'PRODUCTS', 'ORDERS'].map(tab => (
                                 <button
                                     key={tab}
                                     onClick={() => setDashboardTab(tab as DashboardTab)}
                                     className={`flex-1 py-2 rounded-full text-sm font-bold transition ${dashboardTab === tab ? 'bg-white dark:bg-[#333] shadow' : 'text-gray-500'}`}
                                 >
                                     {tab.charAt(0) + tab.slice(1).toLowerCase()}
                                 </button>
                             ))}
                         </div>

                         {dashboardTab === 'DASHBOARD' && (
                             <>
                                <SellerWallet store={myStore} onUpdate={(s) => setMyStore(s)} />
                                <SellerAnalytics />
                             </>
                         )}
                         {dashboardTab === 'PRODUCTS' && (
                             <div>
                                 <div className="flex justify-between items-center mb-4">
                                     <h3 className="font-bold dark:text-white">My Products ({myProducts.length})</h3>
                                     <button onClick={() => { setSelectedProduct(null); setView('ADD_PRODUCT'); }} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg flex items-center gap-2">
                                         <PlusIcon className="w-4 h-4" /> Add Product
                                     </button>
                                 </div>
                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                     {myProducts.map(p => (
                                         <div key={p.id} className="bg-white dark:bg-[#1f1f1f] rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-[#333]">
                                             <div className="aspect-square relative group">
                                                 <img src={p.image} className="w-full h-full object-cover" />
                                                  <div className="absolute top-2 right-2 flex gap-1">
                                                      <button onClick={() => { setSelectedProduct(p); setView('ADD_PRODUCT'); }} className="p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition"><PencilIcon className="w-4 h-4"/></button>
                                                      <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-1.5 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition"><TrashIcon className="w-4 h-4"/></button>
                                                  </div>
                                             </div>
                                             <div className="p-3">
                                                 <h4 className="font-bold text-sm dark:text-white truncate">{p.title}</h4>
                                                 <p className="text-xs text-gray-500">{p.price} • {p.stock} in stock</p>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                          {dashboardTab === 'ORDERS' && (
                             <div>
                                 <h3 className="font-bold dark:text-white mb-4">Customer Orders ({myOrders.length})</h3>
                                 <div className="space-y-4">
                                     {myOrders.map(o => <OrderTracking key={o.id} order={o} />)}
                                 </div>
                             </div>
                         )}
                     </div>
                 );
            default: // BROWSE
                return (
                    <div className="flex flex-1">
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                                <PromoCarousel onBannerClick={(cat) => setFilters(prev => ({ ...prev, categories: [cat] }))}/>
                                
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Marketplace</h2>
                                    <div className="hidden lg:flex items-center gap-2">
                                        <select 
                                            value={filters.sortBy}
                                            onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                                            className="bg-gray-100 dark:bg-[#1f1f1f] text-sm border-none rounded-lg px-3 py-1.5 dark:text-white outline-none"
                                        >
                                            <option value="newest">Newest</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                        </select>
                                    </div>
                                    <button onClick={() => setIsFilterOpen(true)} className="lg:hidden p-2 rounded-full bg-gray-100 dark:bg-[#1f1f1f]"><FilterIcon className="w-5 h-5"/></button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                    {filteredProducts.map(p => (
                                        <div key={p.id} onClick={() => handleProductClick(p)} className="cursor-pointer group">
                                            <div className="aspect-[4/5] rounded-2xl overflow-hidden relative mb-3">
                                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                                <div className="absolute bottom-3 left-3 text-white">
                                                    <h3 className="font-bold text-shadow">{p.title}</h3>
                                                    <p className="text-xs text-shadow">{p.location}</p>
                                                </div>
                                                <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full font-bold">{p.price}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-20 text-gray-500">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBagIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 dark:text-gray-300">No products found</h3>
                                        <p className="text-sm">Try adjusting your search or filters.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <FilterSidebar filters={filters} setFilters={setFilters} isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
                    </div>
                );
        }
    }

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
        <div className="h-full bg-gray-50 dark:bg-black overflow-y-auto flex flex-col transition-colors">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md">
                <div className="p-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex-1 max-w-lg mx-auto">
                        <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-full flex items-center px-4 py-3 transition-colors group focus-within:ring-2 ring-blue-500">
                            <SearchIcon className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" />
                            <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search Marketplace..." 
                              className="bg-transparent w-full ml-3 outline-none text-gray-900 dark:text-white placeholder-gray-500"
                            />
                        </div>
                    </div>
                    
                    <button onClick={() => setView('SELLER_DASHBOARD')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#1f1f1f] rounded-full text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition whitespace-nowrap">
                       {myStore ? <><img src={myStore.logo} className="w-5 h-5 rounded-full"/> My Store</> : <> <StoreIcon className="w-4 h-4" /> Start Selling</>}
                    </button>
                    <button onClick={() => setView('CART')} className="relative p-2 bg-gray-100 dark:bg-[#1f1f1f] rounded-full text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-[#2f2f2f] transition">
                        <ShoppingBagIcon className="w-5 h-5" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-short">
                                {cartItemCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            {renderContent()}
        </div>
    );
};
