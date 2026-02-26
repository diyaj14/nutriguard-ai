import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Lenis from 'lenis';
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
import { Check, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [isAppActive, setIsAppActive] = useState(false);
  const [appView, setAppView] = useState('scanner'); // 'scanner' or 'profile'
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-4 overflow-hidden"
                  >
                    <div className="w-full max-w-md h-full flex flex-col justify-center">
                      <div className="glass-card rounded-[2.5rem] p-4 md:p-8 flex flex-col backdrop-blur-3xl border border-white/10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none"></div>
                        <div className="relative z-10 w-full">
                          <HealthProfileForm onComplete={handleProfileComplete} />
                        </div>
                      </div>
                    </div>
                  </motion.section>
                ) : (
                  <motion.section
                    key="scanner-view"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-4 overflow-hidden"
                  >
                    <div className="w-full max-w-md flex flex-col items-center justify-center h-full">
                      {scanState === 'scanner' ? (
                        <motion.div
                          key="scanner-ui"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full glass-card p-4 sm:p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden shadow-2xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 pointer-events-none"></div>

                          {profile ? (
                            <div className="mb-4 flex items-center justify-center gap-2 bg-primary/10 py-2 px-4 rounded-xl border border-primary/20">
                              <Check className="w-3.5 h-3.5 text-primary" />
                              <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none">Personalized mode active</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAppView('profile')}
                              className="w-full mb-4 flex flex-col items-center justify-center gap-1.5 bg-yellow-400/5 py-2 px-4 rounded-xl border border-yellow-400/10 hover:bg-yellow-400/10 transition-all group"
                            >
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                                <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest leading-none">Baseline mode • Tap to personalize</span>
                              </div>
                            </button>
                          )}

                          <BarcodeScanner onScan={handleScan} loading={scanLoading} />
                          {scanError && <p className="text-red-400 text-center mt-3 text-xs bg-red-500/5 p-2 rounded-lg border border-red-500/10">{scanError}</p>}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="result-ui"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="w-full h-full max-h-full overflow-y-auto custom-scrollbar"
                        >
                          <ScoreDisplay result={scanResult} onReset={resetScan} />
                        </motion.div>
                      )}
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isAppActive && (
        <div id="footer">
          <Footer />
        </div>
      )}
    </div>
  );
}

export default App;

