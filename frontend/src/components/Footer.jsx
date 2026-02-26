import React from 'react';
import { Shield, Instagram, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-black py-20 border-t border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <Shield className="text-primary w-10 h-10" />
                            <span className="font-heading font-black text-3xl text-white tracking-tighter">NutriGuard</span>
                        </div>
                        <p className="text-gray-400 text-xl max-w-md leading-relaxed">
                            Personalized nutrition powered by clinical intelligence and genomic data. Eat smarter, live better.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-widest">Platform</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Features</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Science</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-lg">Privacy</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold text-lg mb-8 uppercase tracking-widest">Connect</h4>
                        <div className="flex gap-6">
                            <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-500 font-medium">© {new Date().getFullYear()} NutriGuard. Created with precision.</p>
                    <div className="flex gap-10">
                        <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">Privacy Policy</a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
