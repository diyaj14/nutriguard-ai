import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Lenis from 'lenis';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Navbar } from './components/Navbar';
import { Stats } from './components/Stats';
import { FeaturesGrid } from './components/FeaturesGrid';
import { Science } from './components/Science';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { AuthForm } from './components/AuthForm';
import { BusinessPlan } from './components/BusinessPlan';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { NeuralFoodScene } from './components/NeuralFoodScene';
import { VideoShowcase } from './components/VideoShowcase';
import { VoiceAssistant } from './components/VoiceAssistant';

function App() {
  const { scrollYProgress } = useScroll();
  const [isAppActive, setIsAppActive] = useState(false);
  const [appView, setAppView] = useState('dashboard'); // 'landing' or 'dashboard'
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
    return () => lenis.destroy();
  }, []);

  // Scan State
  const [scanState, setScanState] = useState('scanner'); // scanner, result
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState(null);

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
          has_hypertension: userProfile.health_conditions?.includes('has_hypertension') || false,
          has_diabetes: userProfile.health_conditions?.includes('has_diabetes') || false,
          has_high_cholesterol: userProfile.health_conditions?.includes('has_high_cholesterol') || false,
          heart_disease: userProfile.health_conditions?.includes('heart_disease') || false,
          kidney_disease: userProfile.health_conditions?.includes('kidney_disease') || false,
          obesity: userProfile.health_conditions?.includes('obesity') || false,

          peanut_allergy: userProfile.allergies?.includes('peanut_allergy') || false,
          gluten_intolerance: userProfile.allergies?.includes('gluten_intolerance') || false,
          lactose_intolerance: userProfile.allergies?.includes('lactose_intolerance') || false,
          soy_allergy: userProfile.allergies?.includes('soy_allergy') || false,
          egg_allergy: userProfile.allergies?.includes('egg_allergy') || false,

          goal_weight_loss: userProfile.goal_weight_loss || false,
          goal_muscle_gain: userProfile.goal_muscle_gain || false,
          goal_high_protein: userProfile.goal_high_protein || false,
          goal_low_carb: userProfile.goal_low_carb || false,
          age: userProfile.age || 30
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

  const handleGoHome = () => {
    setIsAppActive(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--text-main)] font-sans selection:bg-primary/30 relative transition-colors duration-300">
      {/* GLOBAL 3D SCENE BACKGROUND */}
      {!isAppActive && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Canvas shadows dpr={[1, 2]}>
            <Suspense fallback={null}>
              <NeuralFoodScene scrollProgress={scrollYProgress} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {!isAppActive && (
        <Navbar
          onGoHome={handleGoHome}
          isAppActive={isAppActive}
          onSetView={setAppView}
          currentView={appView}
          hasProfile={!!profile}
          currentUser={currentUser}
          onLoginClick={() => setIsAuthOpen(true)}
          onLogout={() => setCurrentUser(null)}
        />
      )}

      <AuthForm
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(user) => {
          setCurrentUser(user);
          setIsAppActive(true);
        }}
      />

      <main>
        <AnimatePresence mode="wait">
          {!isAppActive ? (
            <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
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
              <VideoShowcase />
              <HowItWorks />
              <Stats />
              <FeaturesGrid />
              <div id="plans"><BusinessPlan /></div>
              <div id="science"><Science /></div>
            </motion.div>
          ) : (
            <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen">
               <Dashboard 
                  onScan={handleScan} 
                  scanLoading={scanLoading} 
                  scanResult={scanResult}
                  scanState={scanState}
                  resetScan={resetScan}
                  scanError={scanError}
                  profile={profile}
                  setProfile={setProfile}
                  onGoHome={handleGoHome}
                  currentUser={currentUser}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isAppActive && (
        <div id="footer">
          <Footer />
        </div>
      )}

      <VoiceAssistant 
        scanResult={scanResult} 
        isAppActive={isAppActive}
        profile={profile}
        onScanRequest={() => {
          setIsAppActive(true);
          // Scanner is now part of dashboard, we handle it there
        }}
      />
    </div>
  );
}

export default App;
