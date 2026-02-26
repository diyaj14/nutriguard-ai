import React from 'react';
import { motion } from 'framer-motion';

const stats = [
    { label: 'Accuracy Rate', value: '98%', sub: 'in nutritional matching' },
    { label: 'Products Scanned', value: '10M+', sub: 'and growing daily' },
    { label: 'Instant Results', value: '<2s', sub: 'per scan analysis' },
    { label: 'DNA Markers', value: '50+', sub: 'analyzed per profile' },
];

export function Stats() {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-primary font-bold tracking-[0.2em] uppercase text-sm mb-4 block"
                    >
                        Field-Tested. Science-Backed.
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-heading font-bold text-white tracking-tight"
                    >
                        Numbers That <span className="text-primary">Matter</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-center flex flex-col items-center"
                        >
                            <div className="text-6xl md:text-8xl font-black text-primary mb-4 tracking-tighter">
                                {stat.value}
                            </div>
                            <div className="text-xl md:text-2xl font-bold text-white mb-2">
                                {stat.label}
                            </div>
                            <div className="text-gray-500 font-medium">
                                {stat.sub}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
