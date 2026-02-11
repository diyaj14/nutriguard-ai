import React from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Database, Activity, Layers } from 'lucide-react';

const steps = [
    {
        icon: <ScanLine className="w-8 h-8 text-primary" />,
        title: "1. Scan",
        desc: "Scan product barcode.",
    },
    {
        icon: <Database className="w-8 h-8 text-secondary" />,
        title: "2. Extract",
        desc: "AI gets nutrition data.",
    },
    {
        icon: <Activity className="w-8 h-8 text-warning" />,
        title: "3. Score",
        desc: "Match with your health.",
    },
    {
        icon: <Layers className="w-8 h-8 text-danger" />,
        title: "4. Swap",
        desc: "Get better options.",
    }
];

export function HowItWorks() {
    return (
        <section className="h-full w-full flex flex-col items-center justify-center px-6 pb-24">
            <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl font-heading font-bold text-white mb-2">
                    The Process
                </h2>
                <p className="text-gray-400 text-sm">
                    From scan to score in milliseconds.
                </p>
            </motion.div>

            <div className="w-full max-w-md space-y-4">
                {steps.map((step, idx) => (
                    <motion.div
                        key={idx}
                        className="flex items-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div className="w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center mr-5 border border-white/5 flex-shrink-0">
                            {step.icon}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {step.title}
                            </h3>
                            <p className="text-gray-400 text-sm">
                                {step.desc}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
