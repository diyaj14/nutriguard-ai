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
        <section id="how-it-works" className="py-24 bg-black relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-[#0D1117] border border-white/5 p-8 md:p-10 rounded-[2.5rem] flex items-start gap-8 group hover:border-primary/20 transition-all"
                        >
                            <div className="w-20 h-20 bg-[#16211C] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                                <step.icon className="w-10 h-10 text-primary group-hover:text-black transition-colors" />
                            </div>
                            <div>
                                <span className="text-gray-500 font-bold text-lg mb-2 block">{step.number}</span>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-gray-400 text-lg leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
