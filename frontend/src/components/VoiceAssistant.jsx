import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ────────────────────────────────────────────────────────
//  API CHAIN:  Gemini  →  OpenRouter  →  Rule-based fallback
// ────────────────────────────────────────────────────────

// 1. GEMINI (Google AI Studio – free tier, no billing)
//    Set VITE_GEMINI_API_KEY in frontend/.env
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

async function askGemini(prompt) {
    if (!GEMINI_API_KEY) return null;
    try {
        const res = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
            }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
    } catch {
        return null;
    }
}

// 2. OPENROUTER  (openrouter.ai – free models available)
//    Set VITE_OPENROUTER_API_KEY in frontend/.env
//    Recommended free model: mistralai/mistral-7b-instruct:free
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'mistralai/mistral-7b-instruct:free';

async function askOpenRouter(systemPrompt, userMessage) {
    if (!OPENROUTER_API_KEY) return null;
    try {
        const res = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://nutriguard-ai.vercel.app',
                'X-Title': 'NutriGuard AI'
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 200,
                temperature: 0.7
            }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data?.choices?.[0]?.message?.content?.trim() || null;
    } catch {
        return null;
    }
}

// ────────────────────────────────────────────────────────
//  Robust rule-based fallback (always works, no API needed)
// ────────────────────────────────────────────────────────
function buildSystemContext(scanResult, profile) {
    if (!scanResult) return '';
    const n = scanResult.nutrition || {};
    const score = Math.round(scanResult.suitability_score ?? 0);
    const recs = (scanResult.recommendations || []).map(r => r.name).join(', ');
    const warnings = (scanResult.warnings || []).join('; ');
    const reasons = (scanResult.reasons || []).join('; ');
    const additives = (scanResult.additive_details || []).map(a => `${a.name} (${a.risk} risk)`).join(', ');
    const goals = profile ? [
        profile.goal_weight_loss && 'weight loss',
        profile.goal_muscle_gain && 'muscle gain',
        profile.goal_high_protein && 'high protein',
        profile.goal_low_carb && 'low carb'
    ].filter(Boolean).join(', ') : '';
    const conditions = profile ? [
        profile.has_hypertension && 'hypertension',
        profile.has_diabetes && 'diabetes',
        profile.has_high_cholesterol && 'high cholesterol'
    ].filter(Boolean).join(', ') : '';

    return `
Product: ${scanResult.name}
Suitability Score: ${score}/100
Score Reasons: ${reasons || 'N/A'}
Warnings: ${warnings || 'None'}
Alternatives: ${recs || 'None found'}
Nutrition (per 100g): Calories=${n.energy_kcal_100g ?? '?'} kcal, Sugar=${n.sugars_100g ?? '?'}g, Fat=${n.fat_100g ?? '?'}g, Protein=${n.proteins_100g ?? '?'}g, Salt=${n.sodium_100g ?? '?'}g
Additives: ${additives || 'None'}
User Health Conditions: ${conditions || 'None'}
User Goals: ${goals || 'None'}
    `.trim();
}

function ruleBasedResponse(cmd, scanResult, profile) {
    const lower = cmd.toLowerCase();

    // GREETINGS
    if (/^(hi|hello|hey|what's up|good morning|good evening)/i.test(lower)) {
        return "Hey there! I'm NutriGuard, your personal food health assistant. I can tell you about any product you scan — its score, what's in it, why it scored that way, and suggest healthier swaps. Go ahead, ask me anything!";
    }

    // WHO ARE YOU
    if (/who are you|what (are|can) you do|tell me about yourself/i.test(lower)) {
        return "I'm NutriGuard AI — your smart nutrition buddy. I analyse food products, give them a personalized health score based on your profile, warn you about dangerous ingredients, and recommend better alternatives. Just scan a product and fire away your questions!";
    }

    // SCORE EXPLANATION
    if (/\b(why|how|explain|reason|score|rating|what.*score|scored)\b/i.test(lower)) {
        if (!scanResult) return "I haven't analysed anything yet! Scan a product first, then ask me why it got that score.";
        const score = Math.round(scanResult.suitability_score ?? 0);
        const reasons = scanResult.reasons || [];
        const warnings = scanResult.warnings || [];
        const n = scanResult.nutrition || {};

        let reply = `${scanResult.name} got a score of ${score} out of 100. `;

        if (score >= 80) reply += "That's actually a great score — this product is a solid fit for your health goals. ";
        else if (score >= 50) reply += "It's a moderate score — okay in small amounts, but there are better options out there. ";
        else reply += "Unfortunately this is a low score, meaning this product isn't ideal for your health profile. ";

        if (reasons.length > 0) {
            reply += `Here's why: ${reasons.join('. ')}. `;
        }
        if (warnings.length > 0) {
            reply += `Also, a heads up — ${warnings[0].replace(/⚠️/g, '').trim()}.`;
        }
        if (n.sugars_100g > 20) reply += ` It's particularly high in sugar — ${n.sugars_100g}g per 100g, which is quite a lot.`;
        if (n.sodium_100g > 1) reply += ` The salt content is also on the higher side at ${n.sodium_100g}g per 100g.`;

        return reply.trim();
    }

    // ALTERNATIVES / SUGGESTIONS
    if (/\b(alternative|suggest|better|swap|replace|instead|what else|recommend|healthier|switch)\b/i.test(lower)) {
        if (!scanResult) return "Scan a product first, and I'll find healthier alternatives for you right away!";
        const recs = scanResult.recommendations || [];
        if (recs.length === 0) return `I looked for alternatives for ${scanResult.name} but couldn't find any that are clearly better for your profile right now. Try setting up your health profile — it helps me find much smarter suggestions!`;
        
        const best = recs[0];
        let reply = `Great question! Instead of ${scanResult.name}, I'd suggest trying: ${recs.map(r => r.name).join(', ')}. `;
        if (best.reason) reply += `Take ${best.name} for example — ${best.reason.toLowerCase()}. `;
        reply += `It scores ${Math.round(best.suitability_score)} out of 100 for you, which is ${Math.round(best.improvement_score)} points better than what you scanned.`;
        return reply;
    }

    // INGREDIENTS / ADDITIVES
    if (/\b(ingredient|additive|chemical|e\d{3}|harmful|safe|contain)\b/i.test(lower)) {
        if (!scanResult) return "Please scan a product first so I can tell you about its ingredients!";
        const additives = scanResult.additive_details || [];
        if (additives.length === 0) return `Good news — ${scanResult.name} doesn't have any concerning additives that I can flag. That's always a positive sign!`;
        const highRisk = additives.filter(a => a.risk === 'high');
        const modRisk = additives.filter(a => a.risk === 'moderate');
        let reply = `${scanResult.name} contains ${additives.length} additive(s). `;
        if (highRisk.length > 0) reply += `⚠️ A concern — ${highRisk.map(a => a.name).join(', ')} ${highRisk.length > 1 ? 'are' : 'is'} high-risk. ${highRisk[0].description} `;
        if (modRisk.length > 0) reply += `There are also some moderate-risk ones like ${modRisk.map(a => a.name).join(', ')} — generally okay in small amounts.`;
        return reply;
    }

    // NUTRITION FACTS
    if (/\b(nutrition|calorie|protein|fat|sugar|sodium|carb|fibre|fiber)\b/i.test(lower)) {
        if (!scanResult) return "Scan a product first and I'll break down its nutrition for you!";
        const n = scanResult.nutrition || {};
        return `Here's the nutrition breakdown for ${scanResult.name} per 100g: ${n.energy_kcal_100g ?? '?'} calories, ${n.proteins_100g ?? '?'}g protein, ${n.fat_100g ?? '?'}g fat, ${n.sugars_100g ?? '?'}g sugar, and ${n.sodium_100g ?? '?'}g sodium. ${n.sugars_100g > 15 ? "The sugar content is quite high, so enjoy in moderation." : n.proteins_100g > 15 ? "The protein level is impressive!" : "The nutrition profile is fairly balanced."}`;
    }

    // PROFILE / HEALTH STATUS
    if (/\b(my profile|health status|my goals|my condition|my allerg)\b/i.test(lower)) {
        if (!profile) return "You haven't set up a health profile yet. Tap the Profile button in the app and fill in your health conditions, allergies, and goals — it'll make my analysis much more accurate!";
        const goals = [
            profile.goal_weight_loss && 'weight loss',
            profile.goal_muscle_gain && 'muscle gain',
            profile.goal_high_protein && 'high protein diet',
            profile.goal_low_carb && 'low carb diet'
        ].filter(Boolean);
        const conditions = [
            profile.has_hypertension && 'hypertension',
            profile.has_diabetes && 'diabetes',
            profile.has_high_cholesterol && 'high cholesterol'
        ].filter(Boolean);
        let reply = "Your health profile is all set! ";
        if (goals.length > 0) reply += `Your goals are: ${goals.join(' and ')}. `;
        if (conditions.length > 0) reply += `I'm also factoring in your health conditions: ${conditions.join(', ')}. `;
        reply += "Every product I analyse is scored based on this profile to give you the most relevant results.";
        return reply;
    }

    // SCAN REQUEST
    if (/\b(scan|analyze|check|barcode|read)\b/i.test(lower)) {
        return "Sure! I'm opening the scanner for you right now. Just point your camera at the barcode or type it in manually.";
    }

    // GENERAL HEALTH ADVICE
    if (/\b(healthy|diet|eat|food|tip|advice)\b/i.test(lower)) {
        const tips = [
            "A great rule of thumb is to choose products with a NOVA group of 1 or 2 — those are minimally processed and much better for you.",
            "Look for products where sugar is under 5g per 100g — that's what the WHO recommends for added sugars.",
            "Protein is your friend! Aim for products with at least 10g of protein per 100g if muscle gain or satiety is your goal.",
            "If you have hypertension, watch out for anything with more than 1.5g of salt per 100g — it adds up fast.",
            "Ultra-processed foods (NOVA Group 4) are linked to a higher risk of chronic disease. The fewer ingredients, the better!"
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }

    // THANKS
    if (/\b(thanks|thank you|great|awesome|perfect|nice)\b/i.test(lower)) {
        return "You're welcome! I'm here whenever you need help making smarter food choices. Is there anything else you'd like to know?";
    }

    // DEFAULT — conversational fallback
    return `I heard you say: "${cmd}". I'm not sure about that specific question, but I'm best at helping with food analysis! Try asking: "Why did this product get that score?", "Suggest healthier alternatives", or "What are the ingredients like?"`;
}

// ────────────────────────────────────────────────────────
//  Main Component
// ────────────────────────────────────────────────────────
export function VoiceAssistant({ scanResult, onScanRequest, profile, isAppActive }) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [showAssistant, setShowAssistant] = useState(false);
    const [error, setError] = useState(null);

    // Use refs to always have fresh values inside recognition callbacks
    const scanResultRef = useRef(scanResult);
    const profileRef = useRef(profile);
    const onScanRequestRef = useRef(onScanRequest);
    
    useEffect(() => { scanResultRef.current = scanResult; }, [scanResult]);
    useEffect(() => { profileRef.current = profile; }, [profile]);
    useEffect(() => { onScanRequestRef.current = onScanRequest; }, [onScanRequest]);

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    const speak = useCallback((text) => {
        if (!synthRef.current) return;
        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        const voices = synthRef.current.getVoices();
        const preferred = voices.find(v =>
            v.name.includes('Google US English') ||
            v.name.includes('Samantha') ||
            v.name.includes('Google') ||
            v.lang === 'en-US'
        ) || voices[0];
        if (preferred) utterance.voice = preferred;
        synthRef.current.speak(utterance);
        setResponse(text);
    }, []);

    const handleCommand = useCallback(async (cmd) => {
        const currentScanResult = scanResultRef.current;
        const currentProfile = profileRef.current;

        // Check if user wants to scan
        if (/\b(scan|open scanner|check product|read barcode)\b/i.test(cmd)) {
            speak("Sure! Opening the scanner for you now.");
            onScanRequestRef.current?.();
            return;
        }

        setIsThinking(true);

        const context = buildSystemContext(currentScanResult, currentProfile);
        const sharedSystemPrompt = `You are NutriGuard AI, a friendly, conversational food health assistant embedded in a mobile app.
${context ? `Context about the currently scanned product:\n${context}` : 'No product has been scanned yet.'}
Respond in warm, human, simple language (2-4 sentences max). No markdown. No bullet points. If asked about a product and nothing is scanned, tell the user to scan one first.`;

        // ── Step 1: Try Gemini ──────────────────────────────────
        if (GEMINI_API_KEY) {
            const geminiPrompt = `${sharedSystemPrompt}\nUser: "${cmd}"`;
            const geminiResp = await askGemini(geminiPrompt);
            if (geminiResp) {
                setIsThinking(false);
                speak(geminiResp);
                return;
            }
        }

        // ── Step 2: Try OpenRouter (if Gemini fails / no key) ───
        if (OPENROUTER_API_KEY) {
            const openRouterResp = await askOpenRouter(sharedSystemPrompt, cmd);
            if (openRouterResp) {
                setIsThinking(false);
                speak(openRouterResp);
                return;
            }
        }

        // ── Step 3: Smart rule-based fallback (always works) ────
        setIsThinking(false);
        const fallbackResp = ruleBasedResponse(cmd, currentScanResult, currentProfile);
        speak(fallbackResp);
    }, [speak]);

    // Initialize Speech Recognition once
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError("Speech recognition not supported. Please use Chrome, Edge, or Safari.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => { setIsListening(true); setError(null); };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === 'not-allowed') setError("Microphone access denied. Please allow mic access and try again.");
            else if (event.error === 'no-speech') setError("Nothing heard. Try again and speak clearly.");
        };
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            setTranscript(text);
            handleCommand(text); // handleCommand is stable via useCallback + uses refs internally
        };

        recognitionRef.current = recognition;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only once — handleCommand is stable

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscript('');
            setResponse('');
            setError(null);
            try { recognitionRef.current?.start(); } catch (e) { console.error(e); }
        }
    };

    const pulseRings = isListening ? 3 : 0;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
            <AnimatePresence>
                {showAssistant && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="glass-card w-80 md:w-96 p-5 rounded-[2.5rem] border border-primary/30 shadow-2xl pointer-events-auto mb-4 backdrop-blur-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="relative flex items-center justify-center">
                                    <div className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : isSpeaking ? 'bg-primary animate-pulse' : isThinking ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`} />
                                    {isListening && <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">NutriGuard AI</p>
                                    <p className="text-[10px] text-[var(--text-secondary)] opacity-60">
                                        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : isThinking ? 'Thinking...' : 'Ready to help'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowAssistant(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-4 h-4 text-[var(--text-secondary)]" />
                            </button>
                        </div>

                        {/* Chat Bubble */}
                        <div className="min-h-[90px] mb-4 bg-[var(--background)]/40 rounded-2xl p-4 border border-[var(--glass-border)]">
                            {transcript && (
                                <p className="text-[11px] text-[var(--text-secondary)] italic mb-2 opacity-70 line-clamp-2">You: "{transcript}"</p>
                            )}
                            {isThinking ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                    <span className="text-sm text-[var(--text-secondary)]">Thinking...</span>
                                </div>
                            ) : response ? (
                                <p className="text-sm text-[var(--text-main)] font-medium leading-relaxed">{response}</p>
                            ) : (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-40 mb-2">Try asking me:</p>
                                    {['"Why did this product get that score?"', '"Suggest healthier alternatives"', '"What are the ingredients like?"', '"Give me a health tip"'].map((hint, i) => (
                                        <p key={i} className="text-[11px] text-[var(--text-secondary)] opacity-60">→ {hint}</p>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded-xl mb-3 border border-red-500/20">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                <span className="text-[10px] text-red-400">{error}</span>
                            </div>
                        )}

                        {/* Mic Button */}
                        <div className="flex items-center justify-center gap-4">
                            <motion.button
                                onClick={toggleListening}
                                whileTap={{ scale: 0.9 }}
                                disabled={isThinking}
                                className={`relative p-5 rounded-full transition-all shadow-xl disabled:opacity-50 ${
                                    isListening
                                        ? 'bg-red-500 text-white shadow-red-500/30'
                                        : 'bg-primary text-black hover:scale-105 shadow-primary/20'
                                }`}
                            >
                                {/* Animated rings when listening */}
                                {isListening && [1, 2, 3].map(i => (
                                    <span key={i} className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-10"
                                        style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1.2s' }} />
                                ))}
                                {isListening ? <MicOff className="w-5 h-5 relative z-10" /> : <Mic className="w-5 h-5 relative z-10" />}
                            </motion.button>

                            {isSpeaking && (
                                <div className="flex gap-1 items-end h-5">
                                    {[1, 2, 3, 2, 1].map((h, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ height: [4, h * 5, 4] }}
                                            transition={{ repeat: Infinity, duration: 0.5 + i * 0.05, delay: i * 0.08 }}
                                            className="w-1 bg-primary rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setShowAssistant(!showAssistant)}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                className={`p-4 md:p-5 rounded-3xl backdrop-blur-xl border border-primary/40 shadow-2xl pointer-events-auto transition-colors relative group ${
                    showAssistant ? 'bg-primary text-black' : 'bg-[var(--card-bg)] text-primary'
                }`}
            >
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                {showAssistant ? (
                    <X className="relative z-10 w-6 h-6 md:w-7 md:h-7" />
                ) : (
                    <div className="relative z-10 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                        <span className="hidden md:block text-xs font-black uppercase tracking-widest mr-1">Ask AI</span>
                    </div>
                )}
                {/* Notification dot when scan result is available */}
                {scanResult && !showAssistant && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-[var(--background)] animate-pulse" />
                )}
            </motion.button>
        </div>
    );
}
