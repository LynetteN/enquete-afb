import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, BarChart3, Edit3, Home as HomeIcon, Menu, X, Users, Phone, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { isAuthenticated, AUTH_EVENT_NAME } from '../utils/auth';
import logoAfb from '../assets/logo afb.png';

export const Layout = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [showContactPopup, setShowContactPopup] = useState(false);

    // Check admin authentication status
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = isAuthenticated();
            console.log('Layout - Checking auth status:', authStatus);
            setIsAdminAuthenticated(authStatus);
        };

        checkAuth();

        // Listen for auth state changes (same tab)
        const handleAuthChange = () => {
            console.log('Layout - Auth state changed, rechecking...');
            checkAuth();
        };

        // Listen for storage changes (in case admin logs in/out in another tab)
        const handleStorageChange = () => {
            console.log('Layout - Storage changed, rechecking...');
            checkAuth();
        };

        // Listen for window focus (in case user comes back from another tab)
        const handleFocus = () => {
            console.log('Layout - Window focused, rechecking...');
            checkAuth();
        };

        // Add event listeners
        window.addEventListener(AUTH_EVENT_NAME, handleAuthChange);
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocus);

        // Cleanup
        return () => {
            window.removeEventListener(AUTH_EVENT_NAME, handleAuthChange);
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFDFD]">
            {/* Decorative top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#E2001A] via-[#FFD700] to-[#E2001A]" style={{ height: '4px' }}></div>

            <nav className="glass-panel sticky top-4 z-50 px-3 sm:px-4 py-2 sm:py-3 mx-2 sm:mx-4 rounded-2xl border-white/40 shadow-xl shadow-black/[0.03]">
                <div className="container-fluid flex justify-between items-center max-w-7xl mx-auto">
                    <Link to="/" className="flex items-center gap-2 sm:gap-3 no-underline group shrink-0">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            className="h-8 sm:h-10 md:h-12 flex items-center"
                        >
                            <img
                                src={logoAfb}
                                alt="Afriland First Bank"
                                className="h-full object-contain"
                            />
                        </motion.div>
                        <div className="flex flex-col border-l border-gray-200 pl-2 sm:pl-3 ml-1 hidden sm:flex">
                            <span className="font-bold text-sm sm:text-lg md:text-xl tracking-tighter text-[#1A1A1A] font-premium leading-none uppercase">Survey</span>
                            <span className="text-[7px] sm:text-[8px] md:text-[9px] text-[#E2001A] font-extrabold tracking-[0.15em] sm:tracking-[0.2em] leading-none mt-0.5 sm:mt-1">EXCELLENCE</span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                        <NavLink to="/" active={location.pathname === '/'} icon={<HomeIcon size={16} sm:size={18} />} label="Accueil" />
                        <NavLink to="/repondre" active={location.pathname === '/repondre'} icon={<Shield size={16} sm:size={18} />} label="Répondre" />

                        {/* Admin Navigation - Only show when authenticated */}
                        {isAdminAuthenticated && (
                            <>
                                <div className="w-[1px] h-5 sm:h-6 bg-gray-300 mx-1.5 sm:mx-2"></div>
                                <NavLink to="/creer" active={location.pathname === '/creer'} icon={<Edit3 size={16} sm:size={18} />} label="Admin DRH" />
                                <NavLink to="/resultats" active={location.pathname === '/resultats'} icon={<BarChart3 size={16} sm:size={18} />} label="Dashboard" />
                                <NavLink to="/admin" active={location.pathname === '/admin'} icon={<Users size={16} sm:size={18} />} label="Gestion Admins" />
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden">
                        <button
                            className="p-1.5 sm:p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={20} sm:size={24} /> : <Menu size={20} sm:size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="lg:hidden overflow-hidden"
                        >
                            <div className="pt-3 sm:pt-4 pb-1 sm:pb-2 flex flex-col gap-1.5 sm:gap-2 border-t border-gray-100 mt-3 sm:mt-4">
                                <MobileNavLink to="/" active={location.pathname === '/'} icon={<HomeIcon size={18} sm:size={20} />} label="Accueil" />
                                <MobileNavLink to="/repondre" active={location.pathname === '/repondre'} icon={<Shield size={18} sm:size={20} />} label="Répondre au sondage" />

                                {/* Admin Navigation - Only show when authenticated */}
                                {isAdminAuthenticated && (
                                    <>
                                        <div className="h-[1px] bg-gray-100 my-1.5 sm:my-2 mx-3 sm:mx-4"></div>
                                        <MobileNavLink to="/creer" active={location.pathname === '/creer'} icon={<Edit3 size={18} sm:size={20} />} label="Éditeur d'enquêtes" />
                                        <MobileNavLink to="/resultats" active={location.pathname === '/resultats'} icon={<BarChart3 size={18} sm:size={20} />} label="Tableau de bord" />
                                        <MobileNavLink to="/admin" active={location.pathname === '/admin'} icon={<Users size={18} sm:size={20} />} label="Gestion Admins" />
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="flex-1 pb-12">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>

            <footer className="mt-auto relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                <div className="container py-8 sm:py-12 md:py-16 px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4 sm:mb-6">
                                <Shield className="text-[#E2001A] w-6 h-6 sm:w-8 sm:h-8" />
                                <span className="font-bold text-xl sm:text-2xl tracking-tighter font-premium">AFRILAND <span className="text-[#E2001A]">SURVEY</span></span>
                            </div>
                            <p className="text-gray-500 max-w-sm text-xs sm:text-sm leading-relaxed mb-6 sm:mb-8">
                                Plateforme d'excellence dédiée à l'écoute des collaborateurs.
                                Nous transformons vos retours en leviers de performance et de bien-être au sein d'Afriland First Bank.
                            </p>
                            <div className="flex gap-3 sm:gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#E2001A] hover:text-white transition-all cursor-pointer">
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-sm border-2 border-current"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 sm:mb-6 text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#E2001A]">Navigation</h4>
                            <ul className="space-y-3 sm:space-y-4 text-gray-600 text-xs sm:text-sm font-medium p-0 list-none">
                                <li><Link to="/" className="hover:text-[#E2001A] transition-colors no-underline flex items-center gap-2">Accueil</Link></li>
                                <li><Link to="/repondre" className="hover:text-[#E2001A] transition-colors no-underline flex items-center gap-2">Participer</Link></li>
                                {isAdminAuthenticated && (
                                    <>
                                        <li><Link to="/creer" className="hover:text-[#E2001A] transition-colors no-underline flex items-center gap-2">Créer Enquête</Link></li>
                                        <li><Link to="/resultats" className="hover:text-[#E2001A] transition-colors no-underline flex items-center gap-2">Résultats</Link></li>
                                        <li><Link to="/admin" className="hover:text-[#E2001A] transition-colors no-underline flex items-center gap-2">Gestion Admins</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 sm:mb-6 text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-gray-900">Support Client</h4>
                            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100">
                                <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 leading-relaxed">Une question sur le baromètre de satisfaction ?</p>
                                <button
                                    onClick={() => setShowContactPopup(true)}
                                    className="text-[#E2001A] font-bold text-[10px] sm:text-xs flex items-center gap-2 group p-0 bg-transparent border-none cursor-pointer hover:underline"
                                >
                                    Contacter la DRH <Edit3 size={12} sm:size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                        <p className="text-[10px] sm:text-[11px] text-gray-400 font-medium tracking-wide text-center md:text-left">
                            &copy; {new Date().getFullYear()} AFRILAND FIRST BANK — SOLUTIONS RH ÉTHIQUES & INNOVANTES
                        </p>
                        <div className="flex gap-4 sm:gap-8 text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                            <span className="hover:text-gray-600 cursor-pointer">Confidentialité</span>
                            <span className="hover:text-gray-600 cursor-pointer">Données</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Contact Popup */}
            <AnimatePresence>
                {showContactPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowContactPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowContactPopup(false)}
                                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <CloseIcon size={20} className="text-gray-400" />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#E2001A] to-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Phone size={32} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-black tracking-tight mb-2">Support Client</h2>
                                <p className="text-gray-500 text-sm">Une question sur le baromètre de satisfaction ?</p>
                            </div>

                            <div className="bg-gradient-to-br from-[#E2001A]/5 to-[#FFD700]/5 rounded-2xl border border-gray-100 p-6 text-center">
                                <p className="text-sm font-medium text-gray-600 mb-3">Contacter la DRH :</p>
                                <div className="text-3xl font-black text-[#E2001A] tracking-tight">
                                    Cisco 01411
                                </div>
                            </div>

                            <button
                                onClick={() => setShowContactPopup(false)}
                                className="w-full mt-6 bg-gradient-to-r from-[#E2001A] to-[#FFD700] text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
                            >
                                Fermer
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NavLink = ({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) => (
    <Link
        to={to}
        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all no-underline ${active
            ? 'bg-white text-[#E2001A] shadow-sm'
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

const MobileNavLink = ({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-bold transition-all no-underline mx-1.5 sm:mx-2 ${active
            ? 'bg-[#E2001A] text-white shadow-lg'
            : 'text-gray-600 hover:bg-gray-50'
            }`}
    >
        {icon}
        <span>{label}</span>
    </Link>
);

