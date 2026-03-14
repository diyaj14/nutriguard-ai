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
        <section id="features" className="py-24 bg-transparent relative">
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
                        className="text-5xl md:text-7xl font-heading font-bold text-[var(--text-main)] tracking-tight leading-tight"
                    >
                        Built for Your <br /> Well-Being.
                    </motion.h2>
                </div>

                <div className="flex overflow-x-auto pb-8 gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 snap-x snap-mandatory scroll-smooth no-scrollbar">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card glass-card-hover p-10 rounded-[2.5rem] flex flex-col items-center text-center group overflow-hidden relative w-[300px] shrink-0 snap-center"
                        >
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary transition-colors">
                                <f.icon className="w-8 h-8 text-primary group-hover:text-black transition-colors" />
                            </div>
                            <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4">{f.title}</h3>
                            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
