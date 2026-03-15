import React from 'react';
import { motion } from 'framer-motion';
import { Scan, Activity, ShieldCheck, BarChart3 } from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Scan Any Barcode',
        desc: 'Point your camera at any food product. Our AI reads the barcode instantly.',
        icon: Scan,
    },
    {
        number: '02',
        title: 'DNA-Matched Analysis',
        desc: 'Your genetic profile meets nutritional data — personalized scoring in seconds.',
        icon: Activity,
    },
    {
        number: '03',
        title: 'Health Score',
        desc: "Get a clear, actionable health score. Know exactly what's good for your body.",
        icon: ShieldCheck,
    },
    {
        number: '04',
        title: 'Track Progress',
        desc: 'Build healthier habits over time with detailed nutrition tracking and insights.',
        icon: BarChart3,
    }
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-transparent relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex overflow-x-auto pb-8 gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 snap-x snap-mandatory scroll-smooth no-scrollbar">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card glass-card-hover p-10 rounded-[2.5rem] flex flex-col items-center text-center gap-8 group w-[300px] shrink-0 md:w-full md:shrink snap-center"
                        >
                             <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                <step.icon className="w-10 h-10 text-primary group-hover:text-black transition-colors" />
                            </div>
                            <div>
                                <span className="text-[var(--text-main)] font-bold text-lg mb-2 block">{step.number}</span>
                                <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
