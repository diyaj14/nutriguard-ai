import React, { useState } from 'react';
import axios from 'axios';
import { HealthProfileForm } from './components/HealthProfileForm';
import { BarcodeScanner } from './components/BarcodeScanner';
import { ScoreDisplay } from './components/ScoreDisplay';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Activity, ShieldCheck, Zap, Home, ScanLine, User, LayoutGrid, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, scan, profile, features
  const [profile, setProfile] = useState(null);
  // Scan State
  const [scanState, setScanState] = useState('scanner'); // scanner, result
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState(null);

  const handleProfileComplete = (newProfile) => {
    setProfile(newProfile);
    setActiveTab('scan');
  };

  const handleScan = async (barcode) => {
    setScanLoading(true);
    setScanError(null);
    try {
      // Default profile if not set
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

  const NavButton = ({ tab, icon: Icon, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${activeTab === tab ? 'text-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="h-screen w-full bg-background text-white overflow-hidden flex flex-col">

      {/* Mobile Header */}
      <nav className="flex-none px-6 py-4 flex justify-between items-center bg-black/40 border-b border-white/5 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <Activity className="text-primary w-6 h-6" />
          <span className="font-heading font-bold text-lg tracking-tight">NutriGuard</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-400" />
        </div>
      </nav>

      {/* Main Content Area - NO SCROLL (Content fits or internal scroll) */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <motion.div
              key="home"
              className="absolute inset-0 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Hero onStart={() => setActiveTab('scan')} onLearnMore={() => setActiveTab('features')} />
              <div className="p-6 text-center pb-24">
                <button onClick={() => setActiveTab('scan')} className="w-full bg-white/5 border border-white/10 py-4 rounded-xl text-sm font-bold text-gray-300">
                  Start Demo Scan
                </button>
              </div>
            </motion.div>
          )}

          {/* FEATURES TAB */}
          {activeTab === 'features' && (
            <motion.div
              key="features"
              className="absolute inset-0 overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <HowItWorks />
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              className="absolute inset-0 bg-background z-10 overflow-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HealthProfileForm onComplete={handleProfileComplete} />
            </motion.div>
          )}

          {/* SCAN TAB (Live Demo Logic) */}
          {activeTab === 'scan' && (
            <motion.div
              key="scan"
              className="absolute inset-0 flex flex-col items-center justify-center px-6 overflow-y-auto pb-24"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {scanState === 'scanner' ? (
                <div className="w-full max-w-md">
                  {profile ? (
                    <div className="mb-6 flex items-center justify-center gap-2 bg-primary/10 py-2 px-4 rounded-full border border-primary/20">
                      <Check className="w-4 h-4 text-primary" />
                      <span className="text-xs text-primary font-bold">Profile Active</span>
                    </div>
                  ) : (
                    <div className="mb-6 flex items-center justify-center gap-2 bg-yellow-500/10 py-2 px-4 rounded-full border border-yellow-500/20 cursor-pointer" onClick={() => setActiveTab('profile')}>
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-yellow-500 font-bold">Default Profile (Tap to Edit)</span>
                    </div>
                  )}
                  <BarcodeScanner onScan={handleScan} loading={scanLoading} />
                  {scanError && <p className="text-red-400 text-center mt-4 text-sm bg-red-500/10 p-2 rounded">{scanError}</p>}
                </div>
              ) : (
                <div className="w-full max-w-md pt-10">
                  <ScoreDisplay result={scanResult} onReset={resetScan} />
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Mobile Bottom Dock (NavBar) */}
      <nav className="flex-none bg-[#0B0F14]/90 backdrop-blur-xl border-t border-white/5 pb-6 pt-2 px-6">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <NavButton tab="home" icon={Home} label="Home" />
          <NavButton tab="features" icon={LayoutGrid} label="Features" />
          <NavButton tab="scan" icon={ScanLine} label="Scan" />
          <NavButton tab="profile" icon={User} label="Profile" />
        </div>
      </nav>

    </div>
  );
}

export default App;
