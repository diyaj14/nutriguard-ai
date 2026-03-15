import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function VoiceAssistant({ scanResult, onScanRequest, profile, isAppActive }) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [showAssistant, setShowAssistant] = useState(false);
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Your browser does not support speech recognition. Use Chrome, Safari, or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
            handleCommand(currentTranscript.toLowerCase());
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                setError("Microphone access denied.");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [scanResult, profile]);

    const speak = useCallback((text) => {
        if (!synthRef.current) return;

        // Cancel any ongoing speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        // Find a natural sounding voice if available
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        synthRef.current.speak(utterance);
        setResponse(text);
    }, []);

    const handleCommand = (cmd) => {
        if (cmd.includes('why') || cmd.includes('score') || cmd.includes('explain')) {
            if (!scanResult) {
                speak("I haven't analyzed a product yet. Please scan something first.");
            } else {
                const reasons = scanResult.reasons.join(". ");
                const warnings = scanResult.warnings.length > 0 ? " However, there are some warnings: " + scanResult.warnings.join(". ") : "";
                speak(`I gave this product a score of ${scanResult.suitability_score.toFixed(0)} because: ${reasons}. ${warnings}`);
            }
        } 
        else if (cmd.includes('alternative') || cmd.includes('better') || cmd.includes('suggest')) {
            if (!scanResult || !scanResult.recommendations || scanResult.recommendations.length === 0) {
                speak("I don't have enough data to suggest alternatives right now.");
            } else {
                const bestRec = scanResult.recommendations[0];
                const recNames = scanResult.recommendations.map(r => r.name).join(", ");
                let responseText = `Based on your profile, I found better alternatives: ${recNames}. `;
                
                if (bestRec.reason) {
                    responseText += `For instance, ${bestRec.name} is a great choice because it is ${bestRec.reason.toLowerCase()}.`;
                } else {
                    responseText += `These products have higher suitability scores for your health goals.`;
                }
                
                speak(responseText);
            }
        }
        else if (cmd.includes('analyze') || cmd.includes('scan')) {
            speak("Ready. I'm opening the scanner now.");
            if (onScanRequest) onScanRequest();
        }
        else if (cmd.includes('health') || cmd.includes('status') || cmd.includes('summary')) {
            if (profile) {
                speak(`Your health profile is set up. Based on your activity, your current vitality is 78%. You are doing great on your ${profile.goal_weight_loss ? 'weight loss' : 'fitness'} goals.`);
            } else {
                speak("I don't have enough data about your health profile yet. Please set up your profile in the health section.");
            }
        }
        else if (cmd.includes('hello') || cmd.includes('hi') || cmd.includes('who are you')) {
            speak("Hello! I am NutriGuard AI. I can analyze your food and help you make healthier choices. You can ask me why a product got a certain score or ask for better alternatives.");
        }
        else {
            speak("I heard you say: " + cmd + ". I'm not sure how to help with that yet. Try asking 'Why did you give this score?' or 'Suggest better alternatives'.");
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            setResponse('');
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
            <AnimatePresence>
                {showAssistant && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        className="glass-card w-80 md:w-96 p-6 rounded-[2.5rem] border border-primary/30 shadow-2xl pointer-events-auto mb-4 backdrop-blur-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isSpeaking ? 'bg-primary' : 'bg-gray-500'}`}></div>
                                    {isListening && <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40"></div>}
                                </div>
                                <span className="text-[10px] md:text-sm font-black uppercase tracking-widest text-[var(--text-secondary)]">NutriGuard AI Assistant</span>
                            </div>
                            <button onClick={() => setShowAssistant(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                                <X className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-main)]" />
                            </button>
                        </div>

                        <div className="min-h-[80px] mb-6 bg-[var(--background)]/30 rounded-2xl p-4 border border-[var(--glass-border)]">
                            {transcript && (
                                <p className="text-xs md:text-sm text-[var(--text-secondary)] italic mb-3 opacity-70">"{transcript}"</p>
                            )}
                            {response ? (
                                <p className="text-sm md:text-base text-[var(--text-main)] font-semibold leading-relaxed">{response}</p>
                            ) : (
                                <div className="space-y-2">
                                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-tighter opacity-40">Quick Commands:</p>
                                    <p className="text-[11px] md:text-xs text-[var(--text-secondary)] opacity-60">"Why this score?"</p>
                                    <p className="text-[11px] md:text-xs text-[var(--text-secondary)] opacity-60">"Suggest alternatives"</p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-lg mb-3 border border-red-500/20">
                                <AlertCircle className="w-3 h-3 text-red-500" />
                                <span className="text-[10px] text-red-500">{error}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={toggleListening}
                                className={`p-4 rounded-full transition-all active:scale-90 ${
                                    isListening 
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
                                    : 'bg-primary text-black hover:scale-110 shadow-lg shadow-primary/20'
                                }`}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                            
                            {isSpeaking && (
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [4, 12, 4] }}
                                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                                            className="w-1 bg-primary rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setShowAssistant(!showAssistant)}
                className={`p-4 md:p-5 rounded-3xl backdrop-blur-xl border border-primary/40 shadow-2xl pointer-events-auto transition-all hover:scale-105 active:scale-95 group relative ${
                    showAssistant ? 'bg-primary text-black' : 'bg-[var(--card-bg)] text-primary'
                }`}
            >
                <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {showAssistant ? (
                    <X className="relative z-10 w-6 h-6 md:w-7 md:h-7" />
                ) : (
                    <div className="relative z-10 flex items-center gap-2">
                        <Mic className="w-6 h-6 md:w-7 md:h-7 animate-pulse-slow" />
                        {!showAssistant && (
                            <span className="hidden md:block text-xs font-black uppercase tracking-widest mr-2">Ask AI</span>
                        )}
                    </div>
                )}
            </button>
        </div>
    );
}
