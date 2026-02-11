import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { NeuralFood } from './NeuralFood';
import { ArrowRight } from 'lucide-react';

export function Hero({ onStart, onLearnMore }) {
    return (
        <section className="relative h-[90vh] md:h-screen flex flex-col justify-end md:justify-center items-center overflow-hidden bg-gradient-to-b from-background via-gray-900 to-black pb-20 md:pb-0">

            {/* 3D Neural Food Background - Adjusted for mobile */}
            <div className="absolute inset-0 z-0 opacity-50 md:opacity-60">
                <Canvas>
                    <Suspense fallback={null}>
                        <NeuralFood />
                        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Gradient Overlay for Text Readability on Mobile */}
            <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-background via-background/80 to-transparent z-0 md:hidden"></div>

            {/* Text Content */}
            <div className="relative z-10 text-center px-6 w-full max-w-lg mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-xs text-primary font-medium tracking-wide">AI-POWERED ANALYSIS</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-extrabold mb-4 leading-tight font-heading">
                        <span className="block text-white">Eat Smarter.</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            Live Better.
                        </span>
                    </h1>

                    <p className="text-base md:text-2xl text-gray-300 mb-8 font-light leading-relaxed max-w-sm mx-auto">
                        Scan any food barcode. Get instant, personalized health scores based on <span className="text-white font-medium">your unique DNA.</span>
                    </p>

                    <motion.div
                        className="w-full flex flex-col gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <button
                            onClick={onStart}
                            className="w-full py-4 bg-primary text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(22,224,160,0.4)] hover:shadow-[0_0_40px_rgba(22,224,160,0.6)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                        >
                            Start Scan
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onLearnMore}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white font-medium rounded-2xl active:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                        >
                            See How It Works
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
