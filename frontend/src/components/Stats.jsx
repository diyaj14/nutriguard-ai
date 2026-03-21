import React, { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

function Counter({ value, sub = "" }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    
    // Extract base number and suffix (e.g., "10M+", "%", "<2s")
    const numericPart = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
    const suffix = value.replace(/[0-9.]/g, '');
    const isPrefix = value.startsWith('<');
    const cleanSuffix = isPrefix ? suffix.replace('<', '') : suffix;

    const spring = useSpring(0, {
        stiffness: 80,
        damping: 30,
        duration: 2
    });

    const displayValue = useTransform(spring, (current) => {
        const rounded = Math.floor(current);
        if (isPrefix) return `<${rounded}${cleanSuffix}`;
        return `${rounded}${cleanSuffix}`;
    });

    useEffect(() => {
        if (isInView) {
            spring.set(numericPart);
        }
    }, [isInView, numericPart, spring]);

    return (
        <motion.div ref={ref} className="text-4xl xs:text-5xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-primary mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] duration-500">
            {displayValue}
        </motion.div>
    );
}

const stats = [
    { label: 'Accuracy Rate', value: '98%', sub: 'in nutritional matching' },
    { label: 'Products Scanned', value: '10M+', sub: 'and growing daily' },
    { label: 'Instant Results', value: '<2s', sub: 'per scan analysis' },
    { label: 'DNA Markers', value: '50+', sub: 'analyzed per profile' },
];

export function Stats() {
    return (
        <section className="py-24 bg-transparent relative overflow-hidden">
            <div className="w-full px-6 md:px-12 lg:px-20 relative z-10">
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
                        className="text-5xl md:text-7xl font-heading font-bold text-[var(--text-main)] tracking-tight"
                    >
                        Numbers That <span className="text-primary">Matter</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4 lg:gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card hover:bg-white/5 transition-all p-8 md:p-6 lg:p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center group relative overflow-hidden w-full h-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Counter value={stat.value} />
                            <div className="text-xl font-black text-[var(--text-main)] mb-2 tracking-tight group-hover:text-primary transition-colors">
                                {stat.label}
                            </div>
                            <div className="text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-[0.2em] group-hover:opacity-80 transition-opacity">
                                {stat.sub}
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
