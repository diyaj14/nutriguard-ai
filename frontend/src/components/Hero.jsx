import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { NeuralFood } from './NeuralFood';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero({ onStart, onLearnMore }) {
    return (
        <section className="relative min-h-[100svh] flex flex-col justify-center items-center overflow-hidden bg-black pt-24 md:pt-0">

            {/* Background Image with Effects */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-bg.png"
                    alt="Hero Background"
                    className="w-full h-full object-cover opacity-60 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black z-0"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(22,224,160,0.15)_0%,transparent_70%)] z-0"></div>
            </div>

            {/* Text Content */}
            <div className="relative z-10 text-center px-6 w-full max-w-5xl mx-auto mt-20 md:mt-0 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <a href="#scan" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 shadow-2xl hover:bg-white/10 transition-colors cursor-pointer animate-fade-in-up">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-200 font-bold tracking-wide">Next-Gen AI Nutrition Scanner</span>
                        <ArrowRight className="w-3 h-3 text-gray-400 ml-1" />
                    </a>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.1] font-heading tracking-tight drop-shadow-2xl">
                        <span className="block text-white mb-2">Eat Smarter.</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-secondary animate-pulse-slow">
                            Live Better.
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-gray-300 mb-12 font-medium leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
                        Scan any food barcode. Get instant, personalized health scores powered by <span className="text-primary font-bold">clinical intelligence</span> and your unique DNA profile.
                    </p>

                    <motion.div
                        className="w-full flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <button
                            onClick={onStart}
                            className="px-8 py-5 bg-gradient-to-r from-primary to-emerald-400 text-black font-extrabold rounded-full shadow-[0_0_40px_rgba(22,224,160,0.4)] hover:shadow-[0_0_60px_rgba(22,224,160,0.6)] hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 text-lg md:w-auto w-full group"
                        >
                            Try Demo Sandbox
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </motion.div>
            </div>

        </section>
    );
}
