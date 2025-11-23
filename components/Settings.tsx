
import React, { useState, useEffect } from 'react';
import { User, PrivacyLevel } from '../types';
import { 
    CloseIcon, 
    UserPlusIcon, 
    LockClosedIcon, 
    DatabaseIcon, 
    HelpIcon, 
    ChevronRightIcon, 
    ChevronDownIcon,
    CheckIcon,
    GlobeIcon,
    UsersIcon,
    EyeOffIcon
} from './Icons';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
    onUpdateUser: (user: User) => void;
}

interface OnboardingProps {
    isOpen: boolean;
    currentUser: User;
    onComplete: (user: User) => void;
}

// --- Components ---

const PrivacySelector = ({ 
    label, 
    value, 
    onChange 
}: { 
    label: string, 
    value: PrivacyLevel, 
    onChange: (val: PrivacyLevel) => void 
}) => {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value as PrivacyLevel)}
                className="bg-gray-100 dark:bg-[#252525] text-xs font-bold px-3 py-1.5 rounded-lg outline-none dark:text-white border-none cursor-pointer"
            >
                <option value="public">Public</option>
                <option value="contacts">Contacts</option>
                <option value="private">Private</option>
            </select>
        </div>
    );
};

export const OnboardingModal: React.FC<OnboardingProps> = ({ isOpen, currentUser, onComplete }) => {
    const [formData, setFormData] = useState<User>({ ...currentUser });
    const [error, setError] = useState('');

    useEffect(() => {
        // Auto-calculate age if DOB is present
        if (formData.dob) {
            const birthDate = new Date(formData.dob);
            const ageDifMs = Date.now() - birthDate.getTime();
            const ageDate = new Date(ageDifMs);
            const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
            if (formData.age !== calculatedAge) {
                setFormData(prev => ({ ...prev, age: calculatedAge }));
            }
        }
    }, [formData.dob]);

    if (!isOpen) return null;

    const isValid = () => {
        return (
            formData.firstName?.trim() &&
            formData.lastName?.trim() &&
            formData.dob &&
            formData.email?.trim() &&
            formData.phoneNumber?.trim() &&
            formData.pincode?.trim()
        );
    };

    const handleSubmit = () => {
        if (!isValid()) {
            setError("Please fill in all required fields.");
            return;
        }
        onComplete({ ...formData, isProfileComplete: true });
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <h2 className="text-2xl font-black mb-2">Welcome to MyConnect!</h2>
                    <p className="opacity-90 text-sm">Let's get your profile set up. This helps us connect you with the right people.</p>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg text-sm font-bold text-center">{error}</div>}
                    
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">First Name *</label>
                                <input 
                                    value={formData.firstName || ''}
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                    placeholder="First Name"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Last Name *</label>
                                <input 
                                    value={formData.lastName || ''}
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                    placeholder="Last Name"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Date of Birth *</label>
                                <input 
                                    type="date"
                                    value={formData.dob || ''}
                                    onChange={e => setFormData({...formData, dob: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                />
                            </div>
                            <div className="w-20">
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Age</label>
                                <input 
                                    value={formData.age || ''}
                                    disabled
                                    className="w-full p-3 bg-gray-100 dark:bg-[#333] rounded-xl border border-transparent outline-none dark:text-gray-400 font-bold text-center cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Contact Info *</label>
                            <div className="flex gap-2 mb-3">
                                <select 
                                    value={formData.countryCode || '+1'}
                                    onChange={e => setFormData({...formData, countryCode: e.target.value})}
                                    className="w-24 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                >
                                    <option value="+1">+1 US</option>
                                    <option value="+44">+44 UK</option>
                                    <option value="+91">+91 IN</option>
                                </select>
                                <input 
                                    value={formData.phoneNumber || ''}
                                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                    className="flex-1 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                    placeholder="Phone Number"
                                    type="tel"
                                />
                            </div>
                            <input 
                                value={formData.email || ''}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                placeholder="Email Address"
                                type="email"
                            />
                            <p className="text-[10px] text-gray-400 mt-1 ml-1">Email and Primary Phone cannot be changed later.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Location *</label>
                            <div className="flex gap-2 mb-3">
                                <input 
                                    value={formData.pincode || ''}
                                    onChange={e => setFormData({...formData, pincode: e.target.value})}
                                    className="w-32 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                    placeholder="Pincode"
                                />
                                <input 
                                    value={formData.address || ''}
                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                    className="flex-1 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                    placeholder="Address (Optional)"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Secondary Phone (Optional)</label>
                            <input 
                                value={formData.optionalPhoneNumber || ''}
                                onChange={e => setFormData({...formData, optionalPhoneNumber: e.target.value})}
                                className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white"
                                placeholder="Backup Phone Number"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 dark:border-[#333] bg-white dark:bg-[#1a1a1a]">
                    <button 
                        onClick={handleSubmit} 
                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition shadow-lg"
                    >
                        Complete Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SettingsModal: React.FC<SettingsProps> = ({ isOpen, onClose, currentUser, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'backup' | 'help'>('profile');
    const [formData, setFormData] = useState<User>(currentUser);
    const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'done'>('idle');

    useEffect(() => {
        setFormData(currentUser);
    }, [currentUser, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdateUser(formData);
        // Simulate save delay or toast?
        onClose();
    };

    const handlePrivacyChange = (field: keyof NonNullable<User['privacySettings']>, level: PrivacyLevel) => {
        setFormData(prev => ({
            ...prev,
            privacySettings: {
                ...prev.privacySettings!,
                [field]: level
            }
        }));
    };

    const handleBackup = () => {
        setBackupStatus('backing_up');
        setTimeout(() => {
            setBackupStatus('done');
        }, 2000);
    };

    const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: any }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all ${activeTab === id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252525]'}`}
        >
            {icon}
            <span>{label}</span>
            {activeTab === id && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full"></div>}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex overflow-hidden animate-slide-up">
                {/* Sidebar */}
                <div className="w-64 bg-gray-50 dark:bg-[#151515] p-6 border-r border-gray-100 dark:border-[#252525] hidden md:block">
                    <h2 className="text-xl font-black mb-8 dark:text-white">Settings</h2>
                    <div className="space-y-2">
                        <TabButton id="profile" label="Edit Profile" icon={<UserPlusIcon className="w-5 h-5" />} />
                        <TabButton id="privacy" label="Privacy" icon={<LockClosedIcon className="w-5 h-5" />} />
                        <TabButton id="backup" label="Data & Backup" icon={<DatabaseIcon className="w-5 h-5" />} />
                        <TabButton id="help" label="Help & Support" icon={<HelpIcon className="w-5 h-5" />} />
                    </div>
                </div>

                {/* Mobile Sidebar Replacement (Header) */}
                <div className="flex flex-col flex-1">
                    <div className="md:hidden p-4 border-b border-gray-100 dark:border-[#252525] flex items-center justify-between bg-white dark:bg-[#1a1a1a]">
                        <select 
                            value={activeTab} 
                            onChange={(e) => setActiveTab(e.target.value as any)}
                            className="bg-transparent text-lg font-bold dark:text-white outline-none"
                        >
                            <option value="profile">Edit Profile</option>
                            <option value="privacy">Privacy</option>
                            <option value="backup">Data & Backup</option>
                            <option value="help">Help & Support</option>
                        </select>
                        <button onClick={onClose}><CloseIcon className="w-6 h-6 text-gray-500" /></button>
                    </div>

                    {/* Desktop Header */}
                    <div className="hidden md:flex justify-between items-center p-6 border-b border-gray-100 dark:border-[#252525]">
                        <h3 className="text-xl font-bold dark:text-white">
                            {activeTab === 'profile' && 'Edit Profile'}
                            {activeTab === 'privacy' && 'Privacy Settings'}
                            {activeTab === 'backup' && 'Data & Backup'}
                            {activeTab === 'help' && 'Help & Support'}
                        </h3>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg font-bold transition">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-bold hover:opacity-80 transition">Save Changes</button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white dark:bg-[#1a1a1a]">
                        {activeTab === 'profile' && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">First Name</label>
                                        <input 
                                            value={formData.firstName}
                                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                                            className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Last Name</label>
                                        <input 
                                            value={formData.lastName}
                                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                                            className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Date of Birth & Age</label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="date"
                                            value={formData.dob}
                                            onChange={e => setFormData({...formData, dob: e.target.value})}
                                            className="flex-1 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none dark:text-white"
                                        />
                                        <div className="w-24 p-3 bg-gray-100 dark:bg-[#333] rounded-xl border border-transparent text-center font-bold text-gray-500">
                                            {formData.age} yrs
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl">
                                    <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-2 flex items-center gap-2"><LockClosedIcon className="w-4 h-4" /> Locked Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Email</label>
                                            <div className="text-sm font-mono">{formData.email}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Phone</label>
                                            <div className="text-sm font-mono">{formData.countryCode} {formData.phoneNumber}</div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] mt-2 text-yellow-700/70 dark:text-yellow-500/70">Contact support to update these details.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Address</label>
                                    <div className="flex gap-2 mb-2">
                                        <input 
                                            value={formData.pincode}
                                            onChange={e => setFormData({...formData, pincode: e.target.value})}
                                            className="w-32 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none dark:text-white"
                                            placeholder="Pincode"
                                        />
                                        <input 
                                            value={formData.address}
                                            onChange={e => setFormData({...formData, address: e.target.value})}
                                            className="flex-1 p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none dark:text-white"
                                            placeholder="Street Address"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Optional Phone</label>
                                    <input 
                                        value={formData.optionalPhoneNumber}
                                        onChange={e => setFormData({...formData, optionalPhoneNumber: e.target.value})}
                                        className="w-full p-3 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none dark:text-white"
                                        placeholder="Secondary Number"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="max-w-2xl">
                                <p className="text-gray-500 mb-6 text-sm">Control who can see your personal details on your profile.</p>
                                <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-[#333] p-2">
                                    <PrivacySelector 
                                        label="Email Address" 
                                        value={formData.privacySettings?.email || 'private'} 
                                        onChange={(v) => handlePrivacyChange('email', v)}
                                    />
                                    <PrivacySelector 
                                        label="Phone Number" 
                                        value={formData.privacySettings?.phoneNumber || 'private'} 
                                        onChange={(v) => handlePrivacyChange('phoneNumber', v)}
                                    />
                                    <PrivacySelector 
                                        label="Date of Birth" 
                                        value={formData.privacySettings?.dob || 'contacts'} 
                                        onChange={(v) => handlePrivacyChange('dob', v)}
                                    />
                                    <PrivacySelector 
                                        label="Address / Location" 
                                        value={formData.privacySettings?.address || 'private'} 
                                        onChange={(v) => handlePrivacyChange('address', v)}
                                    />
                                    <PrivacySelector 
                                        label="Active Status" 
                                        value={formData.privacySettings?.lastActive || 'public'} 
                                        onChange={(v) => handlePrivacyChange('lastActive', v)}
                                    />
                                </div>
                                
                                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex gap-4 items-start">
                                    <EyeOffIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-sm dark:text-white mb-1">Private Mode</h4>
                                        <p className="text-xs text-gray-600 dark:text-gray-300">When enabled, your profile is hidden from search engines and non-contacts.</p>
                                    </div>
                                    <div className="ml-auto w-10 h-6 bg-gray-300 dark:bg-gray-600 rounded-full cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full m-1 shadow"></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'backup' && (
                            <div className="max-w-2xl space-y-8">
                                <div className="text-center py-10 bg-gray-50 dark:bg-[#252525] rounded-3xl border-2 border-dashed border-gray-200 dark:border-[#333]">
                                    <DatabaseIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <h3 className="font-bold text-lg dark:text-white mb-2">Cloud Backup</h3>
                                    <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Backup your chats, media, and settings to our secure cloud storage.</p>
                                    
                                    {backupStatus === 'idle' && (
                                        <button onClick={handleBackup} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition shadow-lg">
                                            Backup Now
                                        </button>
                                    )}
                                    {backupStatus === 'backing_up' && (
                                        <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Backing up...
                                        </div>
                                    )}
                                    {backupStatus === 'done' && (
                                        <div className="flex items-center justify-center gap-2 text-green-500 font-bold">
                                            <CheckIcon className="w-5 h-5" /> Backup Complete
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400 mt-4">Last backup: Never</p>
                                </div>

                                <div>
                                    <h4 className="font-bold dark:text-white mb-4">Data Export</h4>
                                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-[#333] rounded-xl">
                                        <div>
                                            <div className="font-bold text-sm dark:text-white">Download Your Information</div>
                                            <div className="text-xs text-gray-500">Get a copy of what you've shared on MyConnect.</div>
                                        </div>
                                        <button className="text-blue-600 font-bold text-sm hover:underline">Request Download</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'help' && (
                            <div className="max-w-2xl space-y-2">
                                {[
                                    'How do I reset my password?',
                                    'Who can see my profile?',
                                    'How to enable Two-Factor Authentication?',
                                    'Report a bug or issue'
                                ].map((q, i) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-[#252525] rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333] transition group">
                                        <span className="font-medium text-sm dark:text-white">{q}</span>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-white" />
                                    </div>
                                ))}
                                
                                <div className="mt-8 pt-8 border-t border-gray-100 dark:border-[#333]">
                                    <h4 className="font-bold dark:text-white mb-4">Contact Support</h4>
                                    <textarea 
                                        className="w-full p-4 bg-gray-50 dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-[#333] outline-none focus:border-blue-500 dark:text-white text-sm resize-none"
                                        rows={4}
                                        placeholder="Describe your issue..."
                                    />
                                    <button className="mt-4 bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-lg font-bold text-sm hover:opacity-80 transition float-right">
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
