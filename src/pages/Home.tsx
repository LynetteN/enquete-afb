import { Link } from 'react-router-dom';
import { Edit3, BarChart3, ShieldCheck, ArrowRight, Star, Users, Briefcase, Zap, Sparkles, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import logoAfb from '../assets/logo afb.png';

export const Home = () => {
    const [timeRemaining, setTimeRemaining] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const closingDate = new Date(2026, 5, 30); // June 30, 2026 (month is 0-indexed)
            const now = new Date();
            const diff = closingDate.getTime() - now.getTime();

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeRemaining({ days, hours, minutes, seconds });
            }
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pt-20 pb-12 overflow-hidden">
            {/* Background Decorative Circles */}
            <div className="absolute -top-40 -right-20 w-96 h-96 bg-[#E2001A]/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-[#FFD700]/5 rounded-full blur-3xl -z-10"></div>

            {/* Hero Section */}
            <section className="text-center mb-24">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 flex flex-col items-center"
                >
                    <div className="h-16 sm:h-20 mb-4">
                        <img
                            src={logoAfb}
                            alt="Afriland First Bank"
                            className="h-full object-contain"
                        />
                    </div>
                    <div className="inline-flex items-center gap-2 py-2 px-4 bg-white shadow-xl shadow-red-500/5 rounded-full border border-gray-100">
                        <span className="flex h-2 w-2 rounded-full bg-[#E2001A] animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Baromètre 2026 en cours</span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black mb-6 sm:mb-8 tracking-tight leading-[1.1] md:leading-[0.9]"
                >
                    L'excellence <br />
                    <span className="gradient-text">est un dialogue.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-base sm:text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-12 font-medium leading-relaxed px-4"
                >
                    Afriland First Bank s'engage à vos côtés. Exprimez vos idées,
                    participez à la construction d'un cadre de travail exceptionnel.
                    <span className="block mt-2 font-bold text-gray-900 border-b-2 border-[#FFD700] inline-block">100% Anonyme. 100% Impact.</span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col items-center gap-6"
                >
                    <Link id="start-survey" to="/repondre" className="btn btn-primary px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-xl group no-underline shadow-2xl shadow-red-500/40">
                        <Sparkles size={20} sm:size={24} className="text-[#FFD700] animate-pulse" />
                        <span>Participer à l'enquête</span>
                    </Link>
                </motion.div>

                {/* Countdown Timer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="mt-8 sm:mt-12"
                >
                    <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
                        <Clock size={20} className="text-[#E2001A] animate-pulse sm:size-24" />
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">{timeRemaining.days}</div>
                                <div className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jours</div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-gray-300">:</div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">{timeRemaining.hours.toString().padStart(2, '0')}</div>
                                <div className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Heures</div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-gray-300">:</div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">{timeRemaining.minutes.toString().padStart(2, '0')}</div>
                                <div className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Minutes</div>
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-gray-300">:</div>
                            <div className="text-center">
                                <div className="text-2xl sm:text-3xl font-black text-[#1A1A1A]">{timeRemaining.seconds.toString().padStart(2, '0')}</div>
                                <div className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Secondes</div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-2 sm:mt-3">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Clôture le 30 Juin 2026</p>
                    </div>
                </motion.div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-16 sm:mb-24">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="md:col-span-2 card-premium bg-gradient-to-br from-[#1A1A1A] to-[#333] text-white p-6 sm:p-8 md:p-12 overflow-hidden relative group"
                        >
                            <div className="relative z-10">
                                <Zap className="text-[#FFD700] mb-4 sm:mb-8" size={32} sm:size={48} />
                                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 tracking-tighter">Engagement en Temps Réel</h3>
                                <p className="text-gray-400 max-w-md text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                                    Ne perdez plus de temps avec des formulaires papier. Visualisez les tendances
                                    au moment même où vos collaborateurs s'expriment.
                                </p>
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                    <Link to="/resultats" className="bg-white/10 hover:bg-[#E2001A] transition-colors backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-widest no-underline text-white">
                                        Voir Dashboard
                                    </Link>
                                    <div className="bg-white/10 backdrop-blur-md px-3 sm:px-4 py-2 rounded-lg border border-white/10 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Analytics</div>
                                </div>
                            </div>
                            <div className="absolute top-10 -right-20 w-48 sm:w-64 h-48 sm:h-64 bg-[#E2001A] rounded-full blur-[80px] sm:blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="card-premium flex flex-col justify-between border-t-4 sm:border-t-8 border-[#FFD700]"
                        >
                            <div>
                                <ShieldCheck className="text-[#E2001A] mb-4 sm:mb-6" size={28} sm:size={40} />
                                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 tracking-tight">Anonymat Absolu</h3>
                                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                                    Le secret de votre participation est protégé par un système de clés
                                    asymétriques uniques. Personne, pas même la DSI, ne peut faire le lien.
                                </p>
                            </div>
                            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 italic text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Certifié par la charte éthique
                            </div>
                        </motion.div>

                        <FeatureCard
                            icon={<Star className="text-[#E2001A]" size={24} sm:size={32} />}
                            title="Index de Satisfaction"
                            description="Une mesure scientifique basée sur 12 leviers d'engagement reconnus internationalement."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon={<Users className="text-[#E2001A]" size={24} sm:size={32} />}
                            title="Collaboration Agile"
                            description="Transformez les critiques en opportunités grâce à nos modules de feedback croisés."
                            delay={0.2}
                        />

                        <Link to="/creer" className="no-underline group">
                            <FeatureCard
                                icon={<Edit3 className="text-[#E2001A]" size={24} sm:size={32} />}
                                title="Créer une Enquête"
                                description="Configurez de nouveaux sondages personnalisés pour vos équipes en quelques secondes."
                                delay={0.3}
                            />
                        </Link>
                    </div>

                {/* Support Client Section */}
                <div className="mt-12 sm:mt-16 max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-[#E2001A]/5 to-[#FFD700]/5 rounded-3xl border border-gray-100 p-8 sm:p-12 text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <Phone size={20} className="text-[#E2001A]" />
                            <h3 className="text-lg sm:text-xl font-black text-gray-900">Support Client</h3>
                        </div>
                        <p className="text-base sm:text-lg font-bold text-gray-700 mb-6">
                            Une question sur le baromètre de satisfaction ?
                        </p>
                        <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-100">
                            <span className="text-sm sm:text-base font-medium text-gray-600">Contacter la DRH :</span>
                            <span className="text-lg sm:text-xl font-black text-[#E2001A]">Cisco 01411</span>
                        </div>
                    </div>
                </div>

                {/* Trusted By Section */}
                <div className="text-center px-4">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-400 mb-6 sm:mb-8 underline decoration-[#FFD700] decoration-2 sm:decoration-4 underline-offset-6 sm:underline-offset-8">
                        NOS VALEURS FONDAMENTALES
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        <span className="font-black text-lg sm:text-xl md:text-2xl tracking-tighter">TRANS-PARENCE</span>
                        <span className="font-black text-lg sm:text-xl md:text-2xl tracking-tighter">ÉCONOMIE D'AFRIQUE</span>
                        <span className="font-black text-lg sm:text-xl md:text-2xl tracking-tighter">EX-CELLENCE</span>
                        <span className="font-black text-lg sm:text-xl md:text-2xl tracking-tighter">INNO-VATION</span>
                    </div>
                </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, delay = 0 }: { icon: React.ReactNode; title: string; description: string; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay }}
        whileHover={{ y: -10, boxShadow: '0 40px 80px -15px rgba(0,0,0,0.1)' }}
        className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-gray-100 transition-all duration-500"
    >
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl inline-block">{icon}</div>
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 tracking-tight">{title}</h3>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">{description}</p>
    </motion.div>
);
