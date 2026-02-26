import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint, Brain, Leaf, Bell, Globe } from 'lucide-react';

const features = [
    {
        title: 'DNA Personalization',
        desc: 'Every recommendation is tailored to your unique genetic makeup — no two users get the same score.',
        icon: Fingerprint,
    },
    {
        title: 'AI-Powered Engine',
        desc: 'Advanced machine learning cross-references thousands of nutritional studies in real-time.',
        icon: Brain,
    },
    {
        title: 'Clean Ingredients',
        desc: 'Instantly flags harmful additives, allergens, and ultra-processed ingredients.',
        icon: Leaf,
    },
    {
        title: 'Real-Time Alerts',
        desc: 'Get notified about food recalls, ingredient changes, and health advisories.',
        icon: Bell,
    },
    {
        title: 'Global Database',
        desc: 'Access nutritional data for products worldwide — over 10 million items and counting.',
        icon: Globe,
    }
];

export function FeaturesGrid() {
    return (
        <section id="features" className="py-24 bg-black relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block"
                    >
                        Features
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-heading font-bold text-white tracking-tight leading-tight"
                    >
                        Built for Your <br /> Well-Being.
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-[#0B0F14] border border-white/5 p-8 rounded-[2rem] hover:border-primary/20 transition-all group"
                        >
                            <div className="w-16 h-16 bg-[#16211C] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                                <f.icon className="w-8 h-8 text-primary group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{f.title}</h3>
                            <p className="text-gray-400 text-lg leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
