
import React, { useState } from 'react';
import { MailIcon, PhoneIcon, LockIcon, CloseIcon } from './Icons';
import { REGISTERED_USERS } from '../services/mockData';

interface AuthProps {
    onAuthSuccess: () => void;
}

const TermsModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold dark:text-white">Terms of Service</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><CloseIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 text-gray-600 dark:text-gray-300">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">1. Acceptance of Terms</h3>
          <p className="text-sm leading-relaxed">By accessing or using the MyConnect application ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.</p>
          
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">2. User Accounts</h3>
          <p className="text-sm leading-relaxed">When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
          
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">3. User Conduct and Content</h3>
          <p className="text-sm leading-relaxed">You are responsible for your conduct and any data, text, files, information, usernames, images, graphics, photos, profiles, audio and video clips, sounds, musical works, works of authorship, applications, links and other content or materials (collectively, "Content") that you submit, post or display on or via the Service. You must not post violent, nude, partially nude, discriminatory, unlawful, infringing, hateful, pornographic or sexually suggestive photos or other content via the Service.</p>
          
           <h3 className="font-bold text-lg text-gray-900 dark:text-white">4. Termination</h3>
          <p className="text-sm leading-relaxed">We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.</p>

        </div>
        <div className="p-4 border-t dark:border-gray-700 text-right bg-gray-50 dark:bg-gray-800/50">
          <button onClick={onClose} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition">I Understand & Agree</button>
        </div>
      </div>
    </div>
);

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp' | 'reset'>('login');
    const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
    type OtpContext = 'login' | 'reset';
    const [otpContext, setOtpContext] = useState<OtpContext>('login');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [identifier, setIdentifier] = useState(''); // for login/forgot
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill(""));

    const handleOtpChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
    
        if (element.nextSibling && element.value) {
          (element.nextSibling as HTMLInputElement).focus();
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);

            switch(mode) {
                case 'login':
                    if (loginMethod === 'password') {
                        const user = REGISTERED_USERS.find(u => (u.email === identifier || u.phoneNumber === identifier) && u.password === password);
                        if (user) {
                            onAuthSuccess();
                        } else {
                            setError('Invalid credentials. Hint: use hello@alexrivera.dev / password123');
                        }
                    } else { // login with OTP
                        const userExists = REGISTERED_USERS.some(u => u.email === identifier || u.phoneNumber === identifier);
                        if (userExists) {
                            setMode('otp');
                        } else {
                            setError('No account found with that email/phone.');
                        }
                    }
                    break;

                case 'signup':
                    if (!agreedToTerms) {
                        setError("You must agree to the Terms of Service.");
                        return;
                    }
                    if (password !== confirmPassword) {
                        setError("Passwords do not match.");
                        return;
                    }
                    if (!fullName || !email || !phone || !password) {
                        setError("Please fill all required fields.");
                        return;
                    }
                    console.log("Simulating new user creation:", { fullName, email, phone });
                    onAuthSuccess();
                    break;
                
                case 'otp':
                    if (otp.join('') === '123456') {
                        if (otpContext === 'login') {
                            onAuthSuccess();
                        } else {
                            setMode('reset');
                        }
                    } else {
                        setError('Invalid OTP code. Hint: 123456');
                    }
                    break;

                case 'forgot':
                    const userExists = REGISTERED_USERS.some(u => u.email === identifier || u.phoneNumber === identifier);
                    if (userExists) {
                        setMode('otp');
                    } else {
                        setError('No account found with that email/phone.');
                    }
                    break;

                case 'reset':
                    if (!password || password !== confirmPassword) {
                        setError("Passwords do not match or are empty.");
                        return;
                    }
                    alert("Password has been reset successfully!");
                    setMode('login');
                    setPassword('');
                    setConfirmPassword('');
                    break;
            }
        }, 1000);
    };
    
    const handleModeChange = (newMode: 'login' | 'signup') => {
        setMode(newMode);
        setError('');
        setLoginMethod('password');
        setIdentifier('');
        setPassword('');
        setFullName('');
        setEmail('');
        setPhone('');
        setConfirmPassword('');
        setOtp(new Array(6).fill(""));
    }

    const renderFormContent = () => {
        switch(mode) {
            case 'otp':
                return (
                    <>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                            Enter the 6-digit code sent to your device.
                        </p>
                         <div className="flex justify-center gap-2 mb-6">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    value={data}
                                    onChange={e => handleOtpChange(e.target, index)}
                                    onFocus={e => e.target.select()}
                                />
                            ))}
                        </div>
                        <button type="button" className="text-center text-sm text-blue-600 hover:underline w-full">Resend Code</button>
                    </>
                );
            case 'forgot':
            case 'reset':
                return (
                    <>
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                            {mode === 'forgot' ? "Enter your email or phone to receive a recovery code." : "Set a new password for your account."}
                        </p>
                        {mode === 'forgot' && (
                             <div className="relative mb-4">
                                <MailIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                                <input type="text" placeholder="Email or Phone" value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                            </div>
                        )}
                        {mode === 'reset' && (
                            <>
                                <div className="relative mb-4">
                                    <LockIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                                    <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                                </div>
                                <div className="relative mb-4">
                                    <LockIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                                    <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                                </div>
                            </>
                        )}
                    </>
                );
            case 'signup':
                return (
                    <>
                        <div className="relative mb-4">
                            <input type="text" placeholder="Full Name" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                        </div>
                        <div className="relative mb-4">
                            <MailIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                            <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                        </div>
                        <div className="flex gap-2 mb-4">
                            <select className="w-28 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition px-2">
                                <option>🇺🇸 +1</option>
                                <option>🇬🇧 +44</option>
                                <option>🇮🇳 +91</option>
                            </select>
                            <div className="relative flex-1">
                                <PhoneIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                                <input type="tel" placeholder="Phone Number" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                            </div>
                        </div>
                        <div className="relative mb-4">
                            <LockIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                            <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                        </div>
                        <div className="relative mb-4">
                            <LockIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                            <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                        </div>
                        <div className="flex items-center">
                            <input id="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                I agree to the <button type="button" onClick={() => setShowTerms(true)} className="font-medium text-blue-600 hover:underline">Terms of Service</button>
                            </label>
                        </div>
                    </>
                );
            case 'login':
            default:
                return (
                    <>
                        {loginMethod === 'password' ? (
                            <>
                                <div className="relative mb-4">
                                    <MailIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                                    <input type="text" placeholder="Email or Phone" required value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                                </div>
                                <div className="relative mb-4">
                                    <LockIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                                    <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <button type="button" onClick={() => { setMode('forgot'); setOtpContext('reset'); }} className="font-medium text-blue-600 hover:underline">Forgot password?</button>
                                    <button type="button" onClick={() => { setMode('login'); setLoginMethod('otp'); setOtpContext('login'); }} className="font-medium text-blue-600 hover:underline">Sign in with OTP</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">We'll send a one-time code to your device.</p>
                                <div className="relative mb-4">
                                    <MailIcon className="w-5 h-5 text-gray-400 absolute top-1/2 left-4 transform -translate-y-1/2" />
                                    <input type="text" placeholder="Email or Phone" required value={identifier} onChange={e => setIdentifier(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500 outline-none transition" />
                                </div>
                                <button type="button" onClick={() => { setMode('login'); setLoginMethod('password'); }} className="text-sm font-medium text-blue-600 hover:underline w-full text-center">Sign in with Password instead</button>
                            </>
                        )}
                    </>
                );
        }
    };
    
    const getButtonText = () => {
        if (isLoading) return "Processing...";
        switch(mode) {
            case 'login': return loginMethod === 'password' ? 'Sign In' : 'Send OTP';
            case 'signup': return 'Create Account';
            case 'otp': return 'Verify Code';
            case 'forgot': return 'Send Recovery Code';
            case 'reset': return 'Reset Password';
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-gray-100 dark:bg-black p-4">
            {showTerms && <TermsModal onClose={() => { setShowTerms(false); setAgreedToTerms(true); }} />}

            <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex">
                {/* Left side panel (visible on md+) */}
                <div className="hidden md:block w-1/2 bg-cover bg-center p-12" style={{backgroundImage: "url('https://picsum.photos/id/10/800/1200')"}}>
                    <div className="flex flex-col h-full justify-between bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 text-white">
                        <div>
                             <h1 className="text-4xl font-black tracking-tight">Connect. Share. Discover.</h1>
                             <p className="mt-4 opacity-80 max-w-sm">Join a vibrant community where your stories matter and connections flourish.</p>
                        </div>
                        <div className="text-xs opacity-60">
                            &copy; 2025 MyConnect Corp. All rights reserved.
                        </div>
                    </div>
                </div>

                {/* Right side form */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                             <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">M</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MyConnect</h1>
                        </div>
                        {mode !== 'forgot' && mode !== 'reset' && (
                            <div className="flex justify-center bg-gray-100 dark:bg-gray-800 p-1 rounded-full mt-4">
                                <button onClick={() => handleModeChange('login')} className={`w-1/2 py-2 rounded-full text-sm font-bold transition ${mode === 'login' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>Sign In</button>
                                <button onClick={() => handleModeChange('signup')} className={`w-1/2 py-2 rounded-full text-sm font-bold transition ${mode === 'signup' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500'}`}>Sign Up</button>
                            </div>
                        )}
                        {(mode === 'forgot' || mode === 'reset') && (
                            <p className="text-center font-bold mt-4 text-gray-700 dark:text-gray-300">Password Recovery</p>
                        )}
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                       {renderFormContent()}
                        
                       <button type="submit" disabled={isLoading} className="w-full py-3 mt-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-95 disabled:bg-blue-400">
                            {getButtonText()}
                        </button>
                    </form>
                    
                    {(mode === 'forgot' || mode === 'reset') && (
                        <div className="text-center mt-4">
                             <button onClick={() => handleModeChange('login')} className="font-medium text-sm text-blue-600 hover:underline">
                                &larr; Back to Sign In
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
