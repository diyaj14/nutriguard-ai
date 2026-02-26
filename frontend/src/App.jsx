import React, { useState } from 'react';
import axios from 'axios';
import { HealthProfileForm } from './components/HealthProfileForm';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ScoreDisplay } from './components/ScoreDisplay';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Navbar } from './components/Navbar';
import { Stats } from './components/Stats';
import { FeaturesGrid } from './components/FeaturesGrid';
import { Science } from './components/Science';
import { Footer } from './components/Footer';
import { Check, AlertTriangle, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isAppActive, setIsAppActive] = useState(false);
  const [appView, setAppView] = useState('scanner'); // 'scanner' or 'profile'
  const [profile, setProfile] = useState(null);

  // Scan State
  const [scanState, setScanState] = useState('scanner'); // scanner, result
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState(null);

  const handleProfileComplete = (newProfile) => {
    setProfile(newProfile);
    setAppView('scanner');
    window.scrollTo(0, 0);
  };

  const handleScan = async (barcode) => {
    setScanLoading(true);
    setScanError(null);
    try {
      const userProfile = profile || {
        age: 30,
        health_conditions: [],
        allergies: [],
        goal_weight_loss: false,
        goal_muscle_gain: false,
        goal_high_protein: false,
        goal_low_carb: false
      };

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

      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      const response = await axios.post(`${apiUrl}/scan/barcode/personalized`, payload);
      setScanResult(response.data);
      setScanState('result');
    } catch (err) {
      console.error(err);
      setScanError(err.response?.data?.detail || "Failed to analyze.");
    } finally {
      setScanLoading(false);
    }
  };

  const resetScan = () => {
    setScanState('scanner');
    setScanResult(null);
    setScanError(null);
  };

  return (
    <div className="min-h-screen w-full bg-background text-white font-sans selection:bg-primary/30">
      <Navbar
        onGoHome={() => { setIsAppActive(false); window.scrollTo(0, 0); }}
        isAppActive={isAppActive}
        onToggleProfile={() => setAppView(prev => prev === 'scanner' ? 'profile' : 'scanner')}
        currentView={appView}
        hasProfile={!!profile}
      />

      <main>
        <AnimatePresence mode="wait">
          {!isAppActive ? (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              {/* HERO SECTION */}
              <section id="home">
                <Hero
                  onStart={() => {
                    setIsAppActive(true);
                    window.scrollTo(0, 0);
                  }}
                  onLearnMore={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              </section>

              {/* STATS SECTION */}
              <Stats />

              {/* HOW IT WORKS SECTION */}
              <HowItWorks />

              {/* FEATURES SECTION */}
              <FeaturesGrid />

              {/* SCIENCE SECTION */}
              <div id="science">
                <Science />
              </div>
            </motion.div>
          ) : (
            <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-20">
              <AnimatePresence mode="wait">
                {appView === 'profile' ? (
                  <motion.section
                    key="profile-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    id="profile"
                    className="py-12 md:py-24 bg-[#0B0F14]"
                  >
                    <div className="max-w-7xl mx-auto px-6">
                      <div className="text-center mb-12">
                        <motion.h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white">
                          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-400">Health Identity</span>
                        </motion.h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                          Personalize your AI engine by configuring your health profile, allergies, and nutritional goals.
                        </p>
                      </div>

                      <div className="glass-card rounded-3xl p-6 md:p-12 shadow-2xl max-w-2xl mx-auto bg-black/40 backdrop-blur-2xl border border-white/10 relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="relative z-10">
                          <HealthProfileForm onComplete={handleProfileComplete} />
                        </div>
                      </div>

                      <div className="mt-12 text-center">
                        <button
                          onClick={() => setAppView('scanner')}
                          className="text-gray-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 mx-auto"
                        >
                          Cancel and return to scanner
                        </button>
                      </div>
                    </div>
                  </motion.section>
                ) : (
                  <motion.section
                    key="scanner-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    id="scan"
                    className="py-12 md:py-24 bg-black min-h-[85vh] flex items-center"
                  >
                    <div className="max-w-7xl mx-auto px-6 w-full relative z-10 flex flex-col items-center">
                      <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md mb-6">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-xs text-primary font-bold tracking-wide uppercase">AI Processing Hub</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white text-glow">Live AI Engine</h2>
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                          Scan any product barcode for instantaneous clinical nutritional analysis.
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center w-full">
                        {scanState === 'scanner' ? (
                          <motion.div
                            key="scanner-ui"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md glass-card p-6 sm:p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative bg-gradient-to-b from-[#111821] to-[#0B0F14]"
                          >
                            <div className="absolute inset-0 border border-primary/10 rounded-3xl animate-pulse-slow pointer-events-none"></div>

                            {profile ? (
                              <div className="mb-6 flex items-center justify-center gap-2 bg-primary/10 py-3 px-5 rounded-xl border border-primary/20">
                                <Check className="w-4 h-4 text-primary" />
                                <span className="text-xs text-primary font-bold uppercase tracking-widest">Personalized Mode Active</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAppView('profile')}
                                className="w-full mb-6 flex flex-col items-center justify-center gap-2 bg-yellow-400/5 py-4 px-5 rounded-xl border border-yellow-400/10 hover:bg-yellow-400/10 transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm text-yellow-500 font-bold tracking-tight">Standard Baseline Mode</span>
                                </div>
                                <span className="text-[10px] text-yellow-500/60 font-medium uppercase tracking-wider">Click to set health profile for personalized score</span>
                              </button>
                            )}

                            <BarcodeScanner onScan={handleScan} loading={scanLoading} />
                            {scanError && <p className="text-red-400 text-center mt-6 text-sm bg-red-500/5 p-4 rounded-xl font-medium border border-red-500/10">{scanError}</p>}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="result-ui"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full max-w-lg"
                          >
                            <ScoreDisplay result={scanResult} onReset={resetScan} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div id="footer">
        <Footer />
      </div>
    </div>
  );
}

export default App;

