import React, { useState, useEffect } from 'react';
import { Activity, Menu, X, ArrowRight, Scan, User, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar({ onGoHome, isAppActive, onToggleProfile, currentView, hasProfile }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '#home', onClick: (e) => { e.preventDefault(); onGoHome(); setMobileMenuOpen(false); } },
        { name: 'How It Works', href: '#how-it-works', onClick: () => { setMobileMenuOpen(false); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
        { name: 'Features', href: '#features', onClick: () => { setMobileMenuOpen(false); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
        { name: 'Science', href: '#science', onClick: () => { setMobileMenuOpen(false); setTimeout(() => document.getElementById('science')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
        { name: 'Contact', href: '#footer', onClick: () => { setMobileMenuOpen(false); setTimeout(() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' }), 100); } },
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${mobileMenuOpen ? 'bg-transparent py-4' : isScrolled ? 'bg-[#0B0F14]/90 backdrop-blur-2xl border-b border-white/5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-[110]">
                    <a href="#home" onClick={(e) => { e.preventDefault(); onGoHome(); }} className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary transition-all duration-500">
                            <Activity className="text-primary w-6 h-6 group-hover:text-black transition-colors" />
                        </div>
                        <span className="font-heading font-bold text-2xl tracking-tight text-white flex items-center gap-2">
                            NutriGuard <span className="text-primary text-[10px] font-black bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 tracking-widest uppercase">AI</span>
                        </span>
                    </a>

                    <div className="flex items-center gap-6 md:gap-10">
                        {/* Desktop Links */}
                        {!isAppActive && (
                            <div className="hidden lg:flex items-center gap-10">
                                {navLinks.slice(0, 4).map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={link.onClick}
                                        className="text-sm font-semibold text-gray-400 hover:text-white transition-all relative group flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                        {link.name}
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary/50 transition-all duration-300 group-hover:w-full"></span>
                                    </a>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3 md:gap-4">
                            {isAppActive && (
                                <button
                                    onClick={onToggleProfile}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${currentView === 'profile' ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${hasProfile ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                                        <User className={`w-3.5 h-3.5 ${hasProfile ? 'text-emerald-400' : 'text-gray-400'}`} />
                                    </div>
                                    <span className="text-xs font-bold hidden xs:block">{currentView === 'profile' ? 'View App' : 'My Profile'}</span>
                                </button>
                            )}

                            {!isAppActive && !mobileMenuOpen && (
                                <div className="hidden sm:flex">
                                    <button
                                        onClick={() => { onGoHome(); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                                        className="px-8 py-3 bg-white text-black font-bold rounded-full text-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2 hover:-translate-y-0.5 active:scale-95 border-2 border-white"
                                    >
                                        Try Sandbox
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Menu Toggle */}
                            {!isAppActive && (
                                <button
                                    className={`text-white p-3 rounded-full transition-all duration-300 ${mobileMenuOpen ? 'bg-white/10 rotate-90' : 'hover:bg-white/5 active:scale-90'}`}
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            )}

                            {isAppActive && (
                                <button
                                    onClick={onGoHome}
                                    className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                                    title="Exit to Home"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Full Screen Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-[#0B0F14] z-[150] flex flex-col p-6 md:p-12 overflow-hidden"
                    >
                        {/* Menu Header */}
                        <div className="flex items-center justify-between w-full mb-12">
                            <div className="flex items-center gap-2">
                                <Activity className="text-primary w-8 h-8" />
                                <span className="font-heading font-bold text-2xl text-white flex items-center gap-1">
                                    NutriGuard <span className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">AI</span>
                                </span>
                            </div>
                            <button
                                className="text-white p-2 rounded-full hover:bg-white/10 transition-colors bg-white/5"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-8 justify-center flex-grow py-8 overflow-y-auto">
                            {navLinks.map((link, i) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    onClick={link.onClick}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-4xl xs:text-5xl sm:text-7xl font-heading font-black text-white hover:text-primary transition-all duration-300 tracking-tighter flex items-center gap-4 group"
                                >
                                    <span className="text-primary/20 text-xl font-mono group-hover:text-primary transition-colors">0{i + 1}</span>
                                    {link.name}
                                </motion.a>
                            ))}
                        </div>

                        {/* Bottom Section */}
                        <div className="mt-auto pt-8 border-t border-white/5 bg-[#0B0F14]/50 backdrop-blur-sm -mx-6 px-6">
                            <div className="flex flex-col xs:flex-row gap-6 items-center justify-between pb-8">
                                <div className="flex gap-4">
                                    {[Scan, User, BarChart2].map((Icon, idx) => (
                                        <div key={idx} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors cursor-pointer bg-white/5">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => { setMobileMenuOpen(false); onGoHome(); }}
                                    className="w-full xs:w-auto px-8 py-4 bg-primary text-black font-extrabold rounded-full text-base flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] hover:scale-105 active:scale-95 transition-all"
                                >
                                    Get Started
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
