import React, { useState } from 'react';
import axios from 'axios';
import { HealthProfileForm } from './HealthProfileForm';
import { BarcodeScanner } from './BarcodeScanner';
import { ScoreDisplay } from './ScoreDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

export function LiveDemo() {
    const [step, setStep] = useState('profile'); // profile, scan, result
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleProfileComplete = (profile) => {
        setUserProfile(profile);
        setStep('scan');
    };

    const handleScan = async (barcode) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                barcode: barcode,
                user_profile: {
                    has_hypertension: userProfile.health_conditions.includes('has_hypertension'),
                    has_diabetes: userProfile.health_conditions.includes('has_diabetes'),
                    has_high_cholesterol: userProfile.health_conditions.includes('has_high_cholesterol'),
                    heart_disease: userProfile.health_conditions.includes('heart_disease'),
                    kidney_disease: userProfile.health_conditions.includes('kidney_disease'),
                    obesity: userProfile.health_conditions.includes('obesity'),

                    peanut_allergy: userProfile.allergies.includes('peanut_allergy'),
                    gluten_intolerance: userProfile.allergies.includes('gluten_intolerance'),
                    lactose_intolerance: userProfile.allergies.includes('lactose_intolerance'),
                    soy_allergy: userProfile.allergies.includes('soy_allergy'),
                    egg_allergy: userProfile.allergies.includes('egg_allergy'),

                    goal_weight_loss: userProfile.goal_weight_loss,
                    goal_muscle_gain: userProfile.goal_muscle_gain,
                    goal_high_protein: userProfile.goal_high_protein,
                    goal_low_carb: userProfile.goal_low_carb,
                    age: userProfile.age
                }
            };

            console.log("Sending payload:", payload);

            const response = await axios.post('http://127.0.0.1:8000/scan/barcode/personalized', payload);
            setResult(response.data);
            setStep('result');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to analyze product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setStep('scan');
        setResult(null);
        setError(null);
    };

    const resetProfile = () => {
        setStep('profile');
        setResult(null);
        setError(null);
        setUserProfile(null);
    }

    return (
        <section id="demo" className="min-h-screen py-12 md:py-24 bg-gradient-to-b from-gray-900 to-black relative">
            <div className="container mx-auto px-4 max-w-3xl">
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Live Demo
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Try the personalization engine.
                    </p>
                </motion.div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl relative overflow-hidden min-h-[600px]">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />

                    <AnimatePresence mode="wait">
                        {step === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <HealthProfileForm onComplete={handleProfileComplete} />
                            </motion.div>
                        )}

                        {step === 'scan' && (
                            <motion.div
                                key="scan"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full flex flex-col items-center"
                            >
                                <div className="w-full flex justify-start mb-4">
                                    <button
                                        onClick={resetProfile}
                                        className="flex items-center text-gray-400 hover:text-white transition-colors bg-white/5 px-3 py-2 rounded-lg"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        <span className="text-sm">Profile</span>
                                    </button>
                                </div>
                                <BarcodeScanner onScan={handleScan} loading={loading} />
                                {error && (
                                    <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center w-full text-sm">
                                        {error}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 'result' && result && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <div className="w-full flex justify-between mb-4">
                                    <button
                                        onClick={resetScan}
                                        className="flex items-center text-gray-400 hover:text-white transition-colors bg-white/5 px-3 py-2 rounded-lg"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        <span className="text-sm">Back</span>
                                    </button>
                                </div>
                                <ScoreDisplay result={result} onReset={resetScan} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
