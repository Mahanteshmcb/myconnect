
import React, { useState, useEffect, useRef } from 'react';
import { Product, Store, Order, User, PayoutDetails, OrderItem } from '../types';
import { ShoppingBagIcon, StoreIcon, BoxIcon, TrendingUpIcon, ShieldCheckIcon, PlusIcon, SearchIcon, FilterIcon, CloseIcon, MagicIcon, CheckIcon, CreditCardIcon, TruckIcon, StarIcon, BackIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, SlidersIcon, WalletIcon, BankIcon, LockIcon, UsersIcon, HeartIcon, ShareIcon, PencilIcon, UploadIcon, ChartBarIcon, ClockIcon, MapIcon, VideoIcon } from './Icons';
import { MARKET_ITEMS, MOCK_STORES, MOCK_ORDERS, CURRENT_USER, MARKET_BANNERS } from '../services/mockData';
import { generateProductDetails } from '../services/geminiService';

// View Modes for Marketplace
type MarketView = 'BROWSE' | 'PRODUCT' | 'STORE' | 'CART' | 'CHECKOUT' | 'SELLER_DASHBOARD' | 'ADD_PRODUCT' | 'ORDERS';

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
const OrderTracking = ({ order }: { order: Order }) => {
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
                                    <p className={`text-[10px] font-bold uppercase tracking-wide ${isCurrent ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>{step.label}</p>
                                    {isCompleted && <p className="text-[10px] text-gray-400">{step.date}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {isCancelled && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl text-center text-red-600 dark:text-red-400 text-sm font-bold">
                    This order has been cancelled.
                </div>
            )}
        </div>
    );
};

export const Marketplace = ({ initialProduct }: { initialProduct?: Product | null }) => {
  const [view, setView] = useState<MarketView>('BROWSE');
  const [products, setProducts] = useState<Product[]>(MARKET_ITEMS);
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [cart, setCart] = useState<Product[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
      minPrice: 0,
      maxPrice: 1000,
      categories: [] as string[],
      rating: 0,
      sortBy: 'newest'
  });

  const gridRef = useRef<HTMLDivElement>(null);

  const [myStore, setMyStore] = useState<Store | undefined>(stores.find(s => s.sellerId === CURRENT_USER.id));

  const [newProduct, setNewProduct] = useState<Partial<Product>>({ title: '', price: '', description: '' });
  const [mediaPreviews, setMediaPreviews] = useState<Array<{url: string, type: 'image' | 'video'}>>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProduct) {
        setSelectedProduct(initialProduct);
        setView('PRODUCT');
    } else {
        if(view === 'PRODUCT') {
            setView('BROWSE');
            setSelectedProduct(null);
        }
    }
  }, [initialProduct]);

  const filteredProducts = products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filters.categories.length === 0 || filters.categories.includes(p.category);
      const matchesPrice = (p.rawPrice || 0) >= filters.minPrice && (p.rawPrice || 0) <= filters.maxPrice;
      const matchesRating = (p.rating || 0) >= filters.rating;
      return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  }).sort((a, b) => {
      if (filters.sortBy === 'price_low') return (a.rawPrice || 0) - (b.rawPrice || 0);
      if (filters.sortBy === 'price_high') return (b.rawPrice || 0) - (a.rawPrice || 0);
      return 0; // Default newest (mock order)
  });

  const hotDeals = products.filter(p => p.discount);

  const addToCart = (product: Product) => {
      setCart([...cart, product]);
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-24 md:bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full z-[100] animate-slide-up shadow-2xl font-bold text-sm flex items-center gap-3 border border-gray-700';
      toast.innerHTML = `<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Added ${product.title} to Cart`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.rawPrice || 0), 0);

  const handleMagicFill = async () => {
      if (!newProduct.title) return;
      setIsGeneratingAI(true);
      const details = await generateProductDetails(newProduct.title);
      if (details) {
          setNewProduct(prev => ({
              ...prev,
              description: details.description,
              category: details.category,
              price: details.suggestedPrice ? `$${details.suggestedPrice}` : prev.price,
              tags: details.tags
          }));
      }
      setIsGeneratingAI(false);
  };

  const handleBannerClick = (category: string) => {
      if (category === 'All') {
          setFilters(prev => ({ ...prev, categories: [] }));
      } else {
          setFilters(prev => ({ ...prev, categories: [category] }));
      }
      if (gridRef.current) {
          gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          const newPreviews = files.map(file => ({
              url: URL.createObjectURL(file),
              type: file.type.startsWith('video') ? 'video' : 'image' as 'video' | 'image'
          }));
          setMediaPreviews(prev => [...prev, ...newPreviews]);
      }
  };

  const removeMedia = (index: number) => {
      setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const renderHeader = () => (
      <div className="sticky top-0 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl z-40 py-3 px-4 md:px-6 border-b border-gray-100 dark:border-[#222] flex items-center justify-between transition-all">
          <h1 className="text-2xl font-black flex items-center gap-2 dark:text-white cursor-pointer tracking-tight" onClick={() => setView('BROWSE')}>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
                  <ShoppingBagIcon className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline">Market</span>
          </h1>
          
          <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => setView('ORDERS')} className="p-3 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition group" title="My Orders">
                  <ClockIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition" />
              </button>
              <button onClick={() => setView('CART')} className="relative p-3 hover:bg-gray-100 dark:hover:bg-[#222] rounded-full transition group">
                  <ShoppingBagIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition" />
                  {cart.length > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-black animate-bounce-short">{cart.length}</span>}
              </button>
              {myStore ? (
                  <button onClick={() => setView('SELLER_DASHBOARD')} className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-xs md:text-sm hover:opacity-90 transition shadow-lg">
                      <StoreIcon className="w-4 h-4" /> <span className="hidden sm:inline">My Store</span>
                  </button>
              ) : (
                  <button onClick={() => { 
                        const newStore: Store = {
                            id: `s_${Date.now()}`,
                            sellerId: CURRENT_USER.id,
                            name: `${CURRENT_USER.name}'s Store`,
                            logo: CURRENT_USER.avatar,
                            banner: 'https://picsum.photos/1200/400',
                            rating: 0,
                            followers: 0,
                            description: 'New store',
                            isVerified: false,
                            totalRevenue: 0
                        };
                        setStores([...stores, newStore]);
                        setMyStore(newStore);
                        setView('SELLER_DASHBOARD');
                  }} className="flex items-center gap-2 px-3 py-2 md:px-5 md:py-2.5 border border-gray-200 dark:border-[#333] rounded-full font-bold text-xs md:text-sm dark:text-white hover:bg-gray-50 dark:hover:bg-[#222] transition">
                      <PlusIcon className="w-4 h-4" /> <span className="hidden sm:inline">Start Selling</span>
                  </button>
              )}
          </div>
      </div>
  );

  const renderBrowse = () => (
      <div className="px-4 md:px-8 pb-40 md:pb-32 pt-6 max-w-7xl mx-auto">
          <PromoCarousel onBannerClick={handleBannerClick} />

          <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-[72px] z-30 py-2 -mx-4 px-4 md:mx-0 md:px-0 pointer-events-none">
              <div className="pointer-events-auto flex-1 bg-white/90 dark:bg-[#151515]/90 backdrop-blur-lg rounded-2xl flex items-center px-5 py-3.5 shadow-lg shadow-gray-200/20 dark:shadow-none border border-gray-200/50 dark:border-[#333] transition-all focus-within:ring-2 ring-blue-500/50 focus-within:border-blue-500">
                  <SearchIcon className="w-5 h-5 text-gray-400" />
                  <input 
                    className="bg-transparent w-full ml-3 outline-none dark:text-white placeholder-gray-400 font-medium text-base" 
                    placeholder="Search products, brands..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
              </div>
              <div className="pointer-events-auto flex gap-3 overflow-x-auto no-scrollbar">
                  <select 
                    className="bg-white/90 dark:bg-[#151515]/90 backdrop-blur-lg px-5 py-3.5 rounded-2xl text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-[#222] transition border border-gray-200/50 dark:border-[#333] shadow-sm"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  >
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                  </select>
                  <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className="px-5 py-3.5 bg-white/90 dark:bg-[#151515]/90 backdrop-blur-lg rounded-2xl flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-white lg:hidden hover:bg-gray-50 dark:hover:bg-[#222] transition border border-gray-200/50 dark:border-[#333] shadow-sm"
                  >
                      <SlidersIcon className="w-5 h-5" />
                  </button>
              </div>
          </div>

          <div className="flex gap-8 items-start">
              <FilterSidebar 
                  filters={filters} 
                  setFilters={setFilters} 
                  isOpen={showFilters} 
                  onClose={() => setShowFilters(false)} 
              />

              <div className="flex-1 w-full min-w-0">
                  {!searchQuery && filters.categories.length === 0 && (
                      <div className="mb-12">
                          <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-black dark:text-white flex items-center gap-2 tracking-tight">
                                  <span className="text-3xl">🔥</span> Hot Deals
                              </h2>
                              <span className="text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-red-500/30 animate-pulse">Ending Soon</span>
                          </div>
                          <div className="flex gap-5 overflow-x-auto no-scrollbar pb-8 snap-x -mx-4 px-4 md:mx-0 md:px-0">
                              {hotDeals.map(product => (
                                  <div 
                                    key={product.id} 
                                    onClick={() => { setSelectedProduct(product); setView('PRODUCT'); }}
                                    className="min-w-[200px] w-[200px] snap-start bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-3xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative"
                                  >
                                      <div className="aspect-[3/4] relative overflow-hidden bg-gray-100 dark:bg-[#222]">
                                          <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                          <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm z-10 border border-white/10">{product.discount}</span>
                                          
                                          <button 
                                            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                            className="absolute bottom-3 right-3 w-10 h-10 bg-white dark:bg-black text-black dark:text-white rounded-full shadow-lg flex items-center justify-center transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-gray-100 dark:border-[#444]"
                                            title="Quick Add"
                                          >
                                              <PlusIcon className="w-5 h-5" />
                                          </button>
                                      </div>
                                      <div className="p-4">
                                          <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm mb-1">{product.title}</h3>
                                          <div className="flex items-baseline gap-2">
                                              <span className="font-extrabold text-lg text-red-500">{product.price}</span>
                                              <span className="text-xs text-gray-400 line-through decoration-gray-400/50">$199</span>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  <div ref={gridRef} className="flex items-center gap-3 mb-6">
                      <h2 className="text-2xl font-black dark:text-white tracking-tight">
                          {searchQuery ? `Results for "${searchQuery}"` : (filters.categories.length > 0 ? filters.categories.join(', ') : 'Just For You')} 
                      </h2>
                      <span className="text-sm font-bold text-gray-500 bg-gray-100 dark:bg-[#252525] px-2.5 py-0.5 rounded-full">{filteredProducts.length}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {filteredProducts.map(product => (
                          <div key={product.id} onClick={() => { setSelectedProduct(product); setView('PRODUCT'); }} className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-3xl overflow-hidden cursor-pointer group hover:shadow-2xl dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full">
                              <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-[#222]">
                                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                                  {product.discount && <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">{product.discount}</span>}
                                  
                                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                                        className="w-10 h-10 bg-white dark:bg-black text-black dark:text-white rounded-full shadow-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors flex items-center justify-center border border-gray-100 dark:border-[#444]"
                                        title="Add to Cart"
                                      >
                                          <PlusIcon className="w-5 h-5" />
                                      </button>
                                  </div>
                              </div>
                              <div className="p-5 flex-1 flex flex-col">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{product.category}</div>
                                  <h3 className="font-bold text-gray-900 dark:text-white truncate text-base mb-1 leading-snug group-hover:text-blue-600 transition-colors">{product.title}</h3>
                                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50 dark:border-[#252525]">
                                      <span className="font-black text-xl dark:text-white">{product.price}</span>
                                      <div className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                                          <StarIcon className="w-3.5 h-3.5 text-yellow-400" filled /> {product.rating || 4.5}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  {filteredProducts.length === 0 && (
                      <div className="py-32 text-center text-gray-500 bg-white dark:bg-[#1a1a1a] rounded-3xl border border-dashed border-gray-200 dark:border-[#333]">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-4">
                              <SearchIcon className="w-10 h-10 opacity-20" />
                          </div>
                          <h3 className="text-lg font-bold dark:text-gray-300 mb-1">No products found</h3>
                          <p className="text-sm mb-6">Try adjusting your filters or search query.</p>
                          <button 
                            onClick={() => { setSearchQuery(''); setFilters({ minPrice: 0, maxPrice: 1000, categories: [], rating: 0, sortBy: 'newest' }); }}
                            className="text-blue-600 font-bold hover:underline text-sm"
                          >
                              Clear all filters
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  const renderProductDetails = () => {
      if (!selectedProduct) return null;
      const seller = stores.find(s => s.sellerId === selectedProduct.sellerId) || MOCK_STORES[0]; // Fallback for demo

      return (
          <div className="pb-48 md:pb-32 px-4 md:px-8 pt-6 max-w-7xl mx-auto animate-fade-in">
              <button onClick={() => setView('BROWSE')} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition font-bold text-sm group">
                  <div className="p-2 bg-gray-100 dark:bg-[#252525] rounded-full group-hover:bg-gray-200 dark:hover:bg-[#333] transition"><BackIcon className="w-4 h-4" /></div> Back to browse
              </button>
              
              <div className="flex flex-col lg:flex-row gap-12">
                  {/* Images */}
                  <div className="flex-1">
                      <div className="aspect-square bg-gray-100 dark:bg-[#1a1a1a] rounded-[2rem] overflow-hidden mb-4 border border-gray-100 dark:border-[#333] shadow-sm relative group">
                          <img src={selectedProduct.image} className="w-full h-full object-cover transition duration-500" />
                          <button className="absolute top-4 right-4 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-full hover:scale-110 transition text-gray-900 dark:text-white">
                              <HeartIcon className="w-6 h-6" />
                          </button>
                      </div>
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                          {(selectedProduct.images || [selectedProduct.image]).map((img, i) => (
                              <img key={i} src={img} className="w-24 h-24 rounded-2xl object-cover cursor-pointer border-2 border-transparent hover:border-blue-600 transition shadow-sm" />
                          ))}
                      </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 lg:max-w-xl">
                      <div className="mb-6">
                          <div className="flex items-center gap-3 mb-3">
                              <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">{selectedProduct.category}</span>
                              {selectedProduct.stock < 5 && <span className="text-red-500 text-xs font-bold animate-pulse">Only {selectedProduct.stock} left!</span>}
                          </div>
                          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">{selectedProduct.title}</h1>
                          <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1 text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                  <StarIcon className="w-4 h-4" filled />
                                  <span className="text-sm font-bold text-gray-900 dark:text-white ml-1">{selectedProduct.rating || 4.8}</span>
                              </div>
                              <span className="text-gray-300">|</span>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 underline cursor-pointer hover:text-blue-500 transition">{selectedProduct.reviewCount || 42} reviews</span>
                          </div>
                      </div>

                      <div className="flex items-end gap-4 mb-8 bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-3xl border border-gray-100 dark:border-[#333] w-full">
                          <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">{selectedProduct.price}</span>
                          {selectedProduct.discount && (
                              <div className="flex flex-col items-start mb-1">
                                  <span className="text-base text-gray-400 line-through font-medium">$199.00</span>
                                  <span className="text-red-500 text-sm font-bold">Save {selectedProduct.discount}</span>
                              </div>
                          )}
                      </div>

                      {/* Seller Card */}
                      <div className="mb-8 p-4 rounded-2xl border border-gray-200 dark:border-[#333] flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition cursor-pointer group" onClick={() => { setSelectedStore(seller); setView('STORE'); }}>
                          <img src={seller.logo} className="w-14 h-14 rounded-full border border-gray-200 dark:border-[#444] object-cover" />
                          <div className="flex-1">
                              <h4 className="font-bold dark:text-white flex items-center gap-1 group-hover:text-blue-600 transition">
                                  {seller.name} {seller.isVerified && <CheckIcon className="w-4 h-4 text-blue-500 bg-white rounded-full" />}
                              </h4>
                              <p className="text-xs text-gray-500">{seller.followers} followers • 98% Positive</p>
                          </div>
                          <button className="px-4 py-2 bg-gray-100 dark:bg-[#252525] rounded-full text-xs font-bold text-gray-900 dark:text-white group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">Visit Store</button>
                      </div>

                      <div className="prose dark:prose-invert text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-sm">
                          {selectedProduct.description}
                      </div>

                      {selectedProduct.variants && selectedProduct.variants.map(v => (
                          <div key={v.name} className="mb-6">
                              <h4 className="font-bold text-xs mb-3 dark:text-white uppercase text-gray-400 tracking-wide">{v.name}</h4>
                              <div className="flex flex-wrap gap-3">
                                  {v.options.map(opt => (
                                      <button key={opt} className="px-6 py-2.5 border border-gray-200 dark:border-[#333] rounded-xl text-sm font-bold hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-500 dark:text-white transition bg-white dark:bg-[#1a1a1a] shadow-sm hover:shadow-md">
                                          {opt}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}

                      <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl flex items-center gap-4 border border-blue-100 dark:border-blue-900/30">
                              <div className="bg-white dark:bg-blue-900/30 p-2.5 rounded-full text-blue-600 dark:text-blue-300 shadow-sm"><TruckIcon className="w-5 h-5" /></div>
                              <div>
                                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase mb-0.5 tracking-wide">Delivery</div>
                                  <div className="text-sm font-bold dark:text-white">{selectedProduct.shippingTime || '3-5 days'}</div>
                              </div>
                          </div>
                          <div className="bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-2xl flex items-center gap-4 border border-purple-100 dark:border-purple-900/30">
                              <div className="bg-white dark:bg-purple-900/30 p-2.5 rounded-full text-purple-600 dark:text-purple-300 shadow-sm"><BoxIcon className="w-5 h-5" /></div>
                              <div>
                                  <div className="text-[10px] font-bold text-purple-600 dark:text-purple-300 uppercase mb-0.5 tracking-wide">Returns</div>
                                  <div className="text-sm font-bold dark:text-white">{selectedProduct.returnPolicy || 'No returns'}</div>
                              </div>
                          </div>
                      </div>

                      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-t border-gray-100 dark:border-[#333] lg:static lg:border-none lg:p-0 lg:bg-transparent z-40 shadow-lg dark:shadow-none">
                          <div className="max-w-7xl mx-auto flex gap-4">
                              <button 
                                onClick={() => addToCart(selectedProduct)} 
                                className="flex-1 bg-gray-100 dark:bg-[#222] text-gray-900 dark:text-white py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-[#333] transition flex items-center justify-center gap-2 active:scale-95"
                              >
                                  <ShoppingBagIcon className="w-5 h-5" /> Add to Cart
                              </button>
                              <button 
                                onClick={() => { addToCart(selectedProduct); setView('CHECKOUT'); }} 
                                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 group active:scale-95"
                              >
                                  Buy Now <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition" />
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderStore = () => {
      if (!selectedStore) return null;
      const storeProducts = products.filter(p => p.sellerId === selectedStore.sellerId);

      return (
          <div className="pb-32 animate-slide-up">
              <div className="h-64 md:h-80 w-full relative group">
                  <img src={selectedStore.banner} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <button onClick={() => setView('BROWSE')} className="absolute top-6 left-6 flex items-center gap-2 text-white bg-black/30 backdrop-blur-md px-4 py-2 rounded-full hover:bg-black/50 transition">
                      <BackIcon className="w-5 h-5" /> Back
                  </button>
              </div>

              <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
                  <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-white dark:border-[#0f0f0f] shadow-2xl overflow-hidden bg-white">
                          <img src={selectedStore.logo} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 mb-2 text-white md:text-gray-900 md:dark:text-white">
                          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-2 drop-shadow-md md:drop-shadow-none">
                              {selectedStore.name} {selectedStore.isVerified && <CheckIcon className="w-7 h-7 text-blue-500 bg-white rounded-full" />}
                          </h1>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium opacity-90">
                              <span className="flex items-center gap-1"><UsersIcon className="w-4 h-4" /> {selectedStore.followers} Followers</span>
                              <span className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-yellow-400" filled /> {selectedStore.rating} Rating</span>
                              <span className="flex items-center gap-1"><BoxIcon className="w-4 h-4" /> {storeProducts.length} Products</span>
                          </div>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto mb-2">
                          <button className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg hover:shadow-blue-500/30 active:scale-95">Follow Store</button>
                          <button className="p-3 bg-gray-100 dark:bg-[#222] rounded-xl hover:bg-gray-200 dark:hover:bg-[#333] transition dark:text-white"><ShareIcon className="w-5 h-5" /></button>
                      </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-3xl border border-gray-100 dark:border-[#333] mb-10">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">About Store</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{selectedStore.description}</p>
                  </div>

                  <h2 className="text-2xl font-black dark:text-white mb-6 flex items-center gap-2">Latest Arrivals <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-[#252525] px-3 py-1 rounded-full">{storeProducts.length}</span></h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {storeProducts.map(p => (
                          <div key={p.id} onClick={() => { setSelectedProduct(p); setView('PRODUCT'); }} className="bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#333] rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                              <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-[#222]">
                                  <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                  <button className="absolute bottom-3 right-3 p-2.5 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                      <PlusIcon className="w-5 h-5 dark:text-white" />
                                  </button>
                              </div>
                              <div className="p-4">
                                  <h3 className="font-bold text-sm dark:text-white truncate mb-1">{p.title}</h3>
                                  <div className="font-extrabold text-blue-600 text-lg">{p.price}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const renderCart = () => (
      <div className="pb-48 md:pb-32 px-4 md:px-8 pt-6 max-w-5xl mx-auto animate-fade-in">
          <button onClick={() => setView('BROWSE')} className="mb-8 flex items-center gap-2 text-gray-500 font-bold text-sm group"><div className="p-2 bg-gray-100 dark:bg-[#252525] rounded-full group-hover:bg-gray-200 transition"><BackIcon className="w-4 h-4" /></div> Back to Cart</button>
          <h1 className="text-4xl font-black dark:text-white mb-8 flex items-center gap-3">
              Shopping Cart <span className="text-lg font-medium text-gray-500 bg-gray-100 dark:bg-[#252525] px-3 py-1 rounded-full">{cart.length} items</span>
          </h1>
          
          {cart.length === 0 ? (
              <div className="text-center py-32 bg-gray-50 dark:bg-[#1a1a1a] rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-[#333]">
                  <div className="w-24 h-24 bg-white dark:bg-[#252525] rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-sm">
                      <ShoppingBagIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold dark:text-white mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-8 max-w-xs mx-auto">Looks like you haven't added anything yet. Go ahead and explore!</p>
                  <button onClick={() => setView('BROWSE')} className="bg-black dark:bg-white text-white dark:text-black px-10 py-4 rounded-full font-bold hover:scale-105 transition shadow-lg">Start Shopping</button>
              </div>
          ) : (
              <div className="flex flex-col lg:flex-row gap-12">
                  <div className="flex-1 space-y-4">
                      {cart.map((item, idx) => (
                          <div key={`${item.id}-${idx}`} className="flex gap-6 p-4 bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-[#333] shadow-sm hover:shadow-md transition group">
                              <div className="w-32 h-32 bg-gray-100 dark:bg-[#252525] rounded-2xl overflow-hidden flex-shrink-0">
                                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              </div>
                              <div className="flex-1 flex flex-col justify-between py-1">
                                  <div>
                                      <div className="flex justify-between items-start">
// FIX: The Marketplace component was not returning a JSX element.
// I have added a return statement to conditionally render views based on the `view` state.
return (
    <div className="h-full bg-white dark:bg-[#0f0f0f] flex flex-col">
      {renderHeader()}
      <div className="flex-1 overflow-y-auto">
        {view === 'BROWSE' && renderBrowse()}
        {view === 'PRODUCT' && renderProductDetails()}
        {view === 'STORE' && renderStore()}
        {view === 'CART' && renderCart()}
        {/* The following render functions are defined in the file but were not being called */}
        {view === 'CHECKOUT' && (
             <div className="p-8">
                 <h1 className="text-2xl font-bold">Checkout</h1>
                 <p>This is a placeholder for the checkout process.</p>
                 <p>Total: ${cartTotal}</p>
             </div>
         )}
         {view === 'SELLER_DASHBOARD' && myStore && (
             <div className="p-8">
                <SellerWallet store={myStore} onUpdate={(s) => setMyStore(s)} />
                <SellerAnalytics />
             </div>
         )}
        {view === 'ADD_PRODUCT' && (
             <div className="p-8">
                 <h1 className="text-2xl font-bold">Add Product</h1>
                 <p>This is a placeholder for the add product form.</p>
             </div>
         )}
         {view === 'ORDERS' && (
             <div className="p-8">
                 <h1 className="text-2xl font-bold">My Orders</h1>
                 {orders.map(order => <OrderTracking key={order.id} order={order} />)}
             </div>
         )}
      </div>
    </div>
  );
};
