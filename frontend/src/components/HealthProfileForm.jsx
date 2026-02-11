import React, { useState } from 'react';
import { CircularAgeInput } from './CircularAgeInput';
import { Heart, Activity, AlertTriangle, Check, ChevronRight, ChevronLeft, Dumbbell, Feather, Flame, Wheat, Milk, Egg, Nut, Ban, Droplet, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function HealthProfileForm({ onComplete }) {
    const [step, setStep] = useState(0); // 0: Age, 1: Conditions, 2: Allergies, 3: Goals
    const [profile, setProfile] = useState({
        age: 30,
        health_conditions: [],
        allergies: [],
        // boolean flags mapped later
        goal_weight_loss: false,
        goal_muscle_gain: false,
        goal_high_protein: false,
        goal_low_carb: false
    });

    const nextStep = () => setStep(s => Math.min(3, s + 1));
    const prevStep = () => setStep(s => Math.max(0, s - 1));

    const toggleCondition = (id) => {
        setProfile(prev => ({
            ...prev,
            health_conditions: prev.health_conditions.includes(id)
                ? prev.health_conditions.filter(i => i !== id)
                : [...prev.health_conditions, id]
        }));
    };

    const toggleAllergy = (id) => {
        setProfile(prev => ({
            ...prev,
            allergies: prev.allergies.includes(id)
                ? prev.allergies.filter(i => i !== id)
                : [...prev.allergies, id]
        }));
    };

    const toggleGoal = (id) => {
        setProfile(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // --- DATA ---
    const conditions = [
        { id: 'has_hypertension', label: 'Hypertension', icon: <Activity /> },
        { id: 'has_diabetes', label: 'Diabetes', icon: <Droplet /> },
        { id: 'has_high_cholesterol', label: 'High Chol.', icon: <Flame /> },
        { id: 'heart_disease', label: 'Heart Issue', icon: <Heart /> },
        { id: 'kidney_disease', label: 'Kidney', icon: <Zap /> },
    ];

    const allergies = [
        { id: 'peanut_allergy', label: 'Peanut', icon: <Nut /> },
        { id: 'gluten_intolerance', label: 'Gluten', icon: <Wheat /> },
        { id: 'lactose_intolerance', label: 'Dairy', icon: <Milk /> },
        { id: 'egg_allergy', label: 'Egg', icon: <Egg /> },
        { id: 'soy_allergy', label: 'Soy', icon: <Ban /> },
    ];

    const goals = [
        { id: 'goal_weight_loss', label: 'Wt. Loss', icon: <Feather /> },
        { id: 'goal_muscle_gain', label: 'Muscle', icon: <Dumbbell /> },
        { id: 'goal_high_protein', label: 'Protein', icon: <Dumbbell /> },
        { id: 'goal_low_carb', label: 'Keto', icon: <Flame /> },
    ];

    const renderChips = (items, selectedList, toggleFn, isGoal = false) => (
        <div className="flex flex-wrap gap-4 justify-center">
            {items.map(item => {
                const isSelected = isGoal ? profile[item.id] : selectedList.includes(item.id);
                return (
                    <button
                        key={item.id}
                        onClick={() => toggleFn(item.id)}
                        className={`relative px-6 py-4 rounded-full border-2 flex items-center gap-3 transition-all duration-300 transform active:scale-95 shadow-lg
                        ${isSelected
                                ? 'bg-primary/10 border-primary text-white shadow-[0_0_20px_rgba(22,224,160,0.3)]'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                            }
                    `}
                    >
                        <span className={`${isSelected ? 'text-primary' : 'text-gray-500'}`}>{item.icon}</span>
                        <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                        {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-primary text-black rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    );

    return (
        <div className="w-full max-w-lg mx-auto h-full flex flex-col justify-between pt-10 pb-20 px-6">
            <div className="flex-1 flex flex-col items-center">

                {/* Progress Indicator */}
                <div className="flex gap-2 mb-8">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'w-8 bg-primary' : 'w-2 bg-white/10'}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="age"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full text-center"
                        >
                            <h2 className="text-3xl font-heading font-bold text-white mb-2">How old are you?</h2>
                            <p className="text-gray-400 mb-12">Drag the dial to adjust.</p>
                            <CircularAgeInput value={profile.age} onChange={v => setProfile({ ...profile, age: v })} />
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="conditions"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full text-center"
                        >
                            <h2 className="text-3xl font-heading font-bold text-white mb-2">Any Conditions?</h2>
                            <p className="text-gray-400 mb-8">Select all that apply.</p>
                            {renderChips(conditions, profile.health_conditions, toggleCondition)}
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="allergies"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full text-center"
                        >
                            <h2 className="text-3xl font-heading font-bold text-white mb-2">Any Allergies?</h2>
                            <p className="text-gray-400 mb-8">We will filter these out for you.</p>
                            {renderChips(allergies, profile.allergies, toggleAllergy)}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="goals"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full text-center"
                        >
                            <h2 className="text-3xl font-heading font-bold text-white mb-2">Your Goals?</h2>
                            <p className="text-gray-400 mb-8">What are you striving for?</p>
                            {renderChips(goals, null, toggleGoal, true)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full mt-8">
                {step < 3 ? (
                    <button
                        onClick={nextStep}
                        className="w-full py-5 bg-gradient-to-r from-primary to-emerald-500 rounded-full text-black font-bold text-lg shadow-[0_0_25px_rgba(22,224,160,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Continue <ChevronRight className="w-5 h-5" />
                    </button>
                ) : (
                    <button
                        onClick={() => onComplete(profile)}
                        className="w-full py-5 bg-gradient-to-r from-secondary to-blue-500 rounded-full text-white font-bold text-lg shadow-[0_0_25px_rgba(0,194,255,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Finish & Start Scan <Check className="w-5 h-5" />
                    </button>
                )}

                {step > 0 && (
                    <button
                        onClick={prevStep}
                        className="w-full py-3 mt-2 text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                )}
            </div>
        </div>
    );
}
