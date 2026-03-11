import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Shield, Zap, Crown } from 'lucide-react';

const PlanCard = ({ title, price, features, icon: Icon, color, isPopular }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`glass-card p-8 rounded-3xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${isPopular ? 'ring-2 ring-primary bg-primary/5' : ''}`}
        >
            {isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-xl tracking-widest">
                    Most Popular
                </div>
            )}

            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6`}>
                <Icon className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-2xl font-black mb-1">{title}</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">${price}</span>
                <span className="text-white/40 text-sm">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-white/70">
                        {feature.included ? (
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                            <X className="w-5 h-5 text-white/20 flex-shrink-0" />
                        )}
                        <span className={feature.included ? '' : 'text-white/30'}>{feature.name}</span>
                    </li>
                ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition-all ${isPopular ? 'bg-primary text-black hover:bg-primary/90' : 'bg-white/5 hover:bg-white/10'}`}>
                Get Started
            </button>
        </motion.div>
    );
};

export const BusinessPlan = () => {
    const plans = [
        {
            title: "Free",
            price: "0",
            icon: Shield,
            color: "bg-white/10",
            features: [
                { name: "Basic Scanner (10 scans/mo)", included: true },
                { name: "Single Health Profile", included: true },
                { name: "Nutritional Breakdown", included: true },
                { name: "Ad-supported experience", included: true },
                { name: "Advanced ML Analysis", included: false },
                { name: "Family Health Management", included: false },
            ],
        },
        {
            title: "Pro",
            price: "9",
            icon: Zap,
            color: "bg-primary/20",
            isPopular: true,
            features: [
                { name: "Unlimited Scans", included: true },
                { name: "Unlimited Health Profiles", included: true },
                { name: "Deep ML Analysis & Scoring", included: true },
                { name: "Ad-free experience", included: true },
                { name: "Personalized Alternatives", included: true },
                { name: "Family Dashboard", included: false },
            ],
        },
        {
            title: "Plus",
            price: "29",
            icon: Crown,
            color: "bg-accent/30",
            features: [
                { name: "Everything in Pro", included: true },
                { name: "Enterprise-grade Reporting", included: true },
                { name: "Family Health Management", included: true },
                { name: "Priority AI Support", included: true },
                { name: "Early Access to Features", included: true },
                { name: "Multi-device Sync", included: true },
            ],
        },
    ];

    return (
        <section className="py-24 px-4 max-w-7xl mx-auto" id="plans">
            <div className="text-center mb-16">
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black mb-4"
                >
                    Choose Your <span className="text-primary">Shield</span>
                </motion.h2>
                <p className="text-white/50 max-w-2xl mx-auto">
                    Scale your health tracking with our premium plans designed for everyone from individuals to whole families.
                </p>
            </div>

            <div className="flex overflow-x-auto pb-12 gap-8 md:grid md:grid-cols-3 md:gap-8 snap-x snap-mandatory scroll-smooth no-scrollbar px-4 -mx-4">
                {plans.map((plan, idx) => (
                    <div key={idx} className="w-[300px] snap-center shrink-0">
                        <PlanCard {...plan} />
                    </div>
                ))}
            </div>
        </section>
    );
};
