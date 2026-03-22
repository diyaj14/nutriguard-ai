import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ────────────────────────────────────────────────────────
//  API CHAIN:  Gemini  →  OpenRouter  →  Rule-based fallback
// ────────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = GEMINI_API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`
  : '';

async function askGemini(prompt) {
  if (!GEMINI_URL) return null;
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch {
    return null;
  }
}

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
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://nutriguard-ai.vercel.app',
        'X-Title': 'NutriGuard AI',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.7,
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
//  Helpers
// ────────────────────────────────────────────────────────

/** Safely round a number or return '?' */
const r = (v, d = 1) => (v != null && !isNaN(v) ? Number(v).toFixed(d) : '?');

/** Collect active user goals as a readable list */
function readableGoals(profile) {
  if (!profile) return [];
  return [
    profile.goal_weight_loss && 'weight loss',
    profile.goal_muscle_gain && 'muscle gain',
    profile.goal_high_protein && 'high-protein diet',
    profile.goal_low_carb && 'low-carb diet',
  ].filter(Boolean);
}

/** Collect active health conditions */
function readableConditions(profile) {
  if (!profile) return [];
  return [
    profile.has_hypertension && 'hypertension',
    profile.has_diabetes && 'diabetes',
    profile.has_high_cholesterol && 'high cholesterol',
  ].filter(Boolean);
}

// ────────────────────────────────────────────────────────
//  Build context block for AI prompts
// ────────────────────────────────────────────────────────
function buildSystemContext(scanResult, profile) {
  if (!scanResult) return '';
  const n = scanResult.nutrition || {};
  const score = Math.round(scanResult.suitability_score ?? 0);
  const reasons = (scanResult.reasons || []).join('; ');
  const warnings = (scanResult.warnings || []).map((w) => w.replace(/⚠️/g, '').trim()).join('; ');
  const additives = (scanResult.additive_details || [])
    .map((a) => `${a.name} (${a.risk} risk – ${a.description || 'no detail'})`)
    .join('; ');
  const recs = (scanResult.recommendations || [])
    .map(
      (rec) =>
        `${rec.name} (score ${Math.round(rec.suitability_score ?? 0)}/100` +
        `${rec.improvement_score != null ? `, +${Math.round(rec.improvement_score)} pts` : ''}` +
        `${rec.reason ? `, ${rec.reason}` : ''})`
    )
    .join('; ');

  const goals = readableGoals(profile).join(', ') || 'None set';
  const conditions = readableConditions(profile).join(', ') || 'None';

  return `
PRODUCT: ${scanResult.name}
SUITABILITY SCORE: ${score}/100
SCORE REASONS: ${reasons || 'N/A'}
WARNINGS: ${warnings || 'None'}
NUTRITION per 100 g: Energy ${r(n.energy_kcal_100g)} kcal | Sugar ${r(n.sugars_100g)} g | Fat ${r(n.fat_100g)} g | Sat-fat ${r(n.saturated_fat_100g)} g | Protein ${r(n.proteins_100g)} g | Salt/Sodium ${r(n.sodium_100g)} g | Fibre ${r(n.fiber_100g)} g
NOVA GROUP: ${scanResult.nova_group ?? '?'} (1 = unprocessed … 4 = ultra-processed)
NUTRI-SCORE: ${scanResult.nutri_score_grade ?? '?'}
ADDITIVES: ${additives || 'None flagged'}
RECOMMENDED ALTERNATIVES: ${recs || 'None found'}
USER GOALS: ${goals}
USER HEALTH CONDITIONS: ${conditions}
  `.trim();
}

// ────────────────────────────────────────────────────────
//  Detailed rule-based score explanation
// ────────────────────────────────────────────────────────
function explainScore(scanResult, profile) {
  if (!scanResult)
    return "I haven't analysed a product yet. Scan something first and I'll explain exactly why it got its score!";

  const score = Math.round(scanResult.suitability_score ?? 0);
  const n = scanResult.nutrition || {};
  const reasons = scanResult.reasons || [];
  const warnings = (scanResult.warnings || []).map((w) => w.replace(/⚠️/g, '').trim());
  const additives = scanResult.additive_details || [];
  const goals = readableGoals(profile);
  const conditions = readableConditions(profile);

  const lines = [];

  // ── Overall verdict ──
  if (score >= 80) lines.push(`${scanResult.name} scored ${score}/100 — that's a great result! Here's how it earned it:`);
  else if (score >= 50) lines.push(`${scanResult.name} scored ${score}/100 — decent, but there's room for improvement. Let me break it down:`);
  else lines.push(`${scanResult.name} only scored ${score}/100 — here's exactly why it fell short:`);

  // ── API-provided reasons (most important) ──
  if (reasons.length) {
    lines.push('');
    lines.push('🔍 Scoring factors:');
    reasons.forEach((reason, i) => lines.push(`  ${i + 1}. ${reason}`));
  }

  // ── Nutrition-specific penalties / bonuses ──
  const nutritionNotes = [];
  if (n.sugars_100g != null) {
    if (n.sugars_100g > 22.5) nutritionNotes.push(`Sugar is very high at ${r(n.sugars_100g)}g/100g (red zone is >22.5g). This heavily penalises the score.`);
    else if (n.sugars_100g > 12.5) nutritionNotes.push(`Sugar is moderately high at ${r(n.sugars_100g)}g/100g (amber zone 5–22.5g). This pulls the score down.`);
    else if (n.sugars_100g <= 5) nutritionNotes.push(`Sugar is low at ${r(n.sugars_100g)}g/100g — that's a positive.`);
  }
  if (n.sodium_100g != null) {
    if (n.sodium_100g > 1.5) nutritionNotes.push(`Salt is high at ${r(n.sodium_100g)}g/100g (red zone >1.5g). Big penalty${conditions.includes('hypertension') ? ', especially given your hypertension' : ''}.`);
    else if (n.sodium_100g > 0.3) nutritionNotes.push(`Salt is moderate at ${r(n.sodium_100g)}g/100g.`);
  }
  if (n.saturated_fat_100g != null && n.saturated_fat_100g > 5)
    nutritionNotes.push(`Saturated fat is high at ${r(n.saturated_fat_100g)}g/100g${conditions.includes('high cholesterol') ? ' — particularly concerning with your cholesterol' : ''}.`);
  if (n.fat_100g != null && n.fat_100g > 17.5)
    nutritionNotes.push(`Total fat is high at ${r(n.fat_100g)}g/100g (red zone >17.5g).`);
  if (n.proteins_100g != null && n.proteins_100g >= 10)
    nutritionNotes.push(`Protein is solid at ${r(n.proteins_100g)}g/100g — a plus${goals.includes('muscle gain') || goals.includes('high-protein diet') ? ' for your protein goals' : ''}.`);
  if (n.fiber_100g != null && n.fiber_100g >= 3)
    nutritionNotes.push(`Good fibre content at ${r(n.fiber_100g)}g/100g, which helps the score.`);

  if (nutritionNotes.length) {
    lines.push('');
    lines.push('📊 Nutrition breakdown:');
    nutritionNotes.forEach((note) => lines.push(`  • ${note}`));
  }

  // ── Additives ──
  const highRisk = additives.filter((a) => a.risk === 'high');
  const modRisk = additives.filter((a) => a.risk === 'moderate');
  if (highRisk.length || modRisk.length) {
    lines.push('');
    lines.push('🧪 Additives:');
    highRisk.forEach((a) => lines.push(`  ⚠️ ${a.name} — HIGH risk. ${a.description || ''}`));
    modRisk.forEach((a) => lines.push(`  ⚡ ${a.name} — moderate risk. ${a.description || ''}`));
  }

  // ── Processing level ──
  if (scanResult.nova_group != null) {
    const novaLabels = { 1: 'unprocessed / minimally processed', 2: 'processed culinary ingredients', 3: 'processed foods', 4: 'ultra-processed foods' };
    lines.push('');
    lines.push(`🏭 Processing: NOVA Group ${scanResult.nova_group} (${novaLabels[scanResult.nova_group] || 'unknown'}).${scanResult.nova_group === 4 ? ' Ultra-processed products lose significant points.' : ''}`);
  }

  // ── Health-profile impact ──
  if (conditions.length || goals.length) {
    lines.push('');
    lines.push('👤 Personalisation impact:');
    if (conditions.includes('diabetes') && n.sugars_100g > 5)
      lines.push('  • Your diabetes profile further penalises the high sugar content.');
    if (conditions.includes('hypertension') && n.sodium_100g > 0.3)
      lines.push('  • Your hypertension profile further penalises the salt level.');
    if (conditions.includes('high cholesterol') && (n.saturated_fat_100g > 3 || n.fat_100g > 10))
      lines.push('  • Your cholesterol profile further penalises the fat content.');
    if (goals.includes('weight loss') && n.energy_kcal_100g > 250)
      lines.push(`  • At ${r(n.energy_kcal_100g, 0)} kcal/100g this is calorie-dense, working against your weight-loss goal.`);
    if (goals.includes('low-carb diet') && n.sugars_100g > 10)
      lines.push('  • High sugar conflicts with your low-carb goal.');
    if ((goals.includes('muscle gain') || goals.includes('high-protein diet')) && n.proteins_100g < 8)
      lines.push(`  • Only ${r(n.proteins_100g)}g protein/100g — low for your protein-focused goal.`);
  }

  // ── Warnings ──
  if (warnings.length) {
    lines.push('');
    lines.push('⚠️ Warnings:');
    warnings.forEach((w) => lines.push(`  • ${w}`));
  }

  return lines.join('\n');
}

// ────────────────────────────────────────────────────────
//  Detailed rule-based alternatives suggestion
// ────────────────────────────────────────────────────────
function suggestAlternatives(scanResult, profile) {
  if (!scanResult)
    return "Scan a product first and I'll find healthier alternatives for you!";

  const recs = scanResult.recommendations || [];
  if (recs.length === 0)
    return `I looked for alternatives to ${scanResult.name} but couldn't find any that are clearly better right now. Try completing your health profile — that helps me make smarter suggestions!`;

  const n = scanResult.nutrition || {};
  const currentScore = Math.round(scanResult.suitability_score ?? 0);
  const lines = [];

  lines.push(`Instead of ${scanResult.name} (score ${currentScore}/100), here are better options:\n`);

  recs.forEach((rec, i) => {
    const recScore = Math.round(rec.suitability_score ?? 0);
    const improvement = rec.improvement_score != null ? Math.round(rec.improvement_score) : recScore - currentScore;
    const rn = rec.nutrition || {};

    lines.push(`${i + 1}. ${rec.name}  —  Score: ${recScore}/100 (+${improvement} pts)`);

    // Why is it better?
    const whyBetter = [];
    if (rec.reason) {
      whyBetter.push(rec.reason);
    } else {
      // Auto-generate comparison if no reason provided
      if (rn.sugars_100g != null && n.sugars_100g != null && rn.sugars_100g < n.sugars_100g)
        whyBetter.push(`${r(((n.sugars_100g - rn.sugars_100g) / n.sugars_100g) * 100, 0)}% less sugar (${r(rn.sugars_100g)}g vs ${r(n.sugars_100g)}g)`);
      if (rn.sodium_100g != null && n.sodium_100g != null && rn.sodium_100g < n.sodium_100g)
        whyBetter.push(`${r(((n.sodium_100g - rn.sodium_100g) / n.sodium_100g) * 100, 0)}% less salt`);
      if (rn.fat_100g != null && n.fat_100g != null && rn.fat_100g < n.fat_100g)
        whyBetter.push(`less fat (${r(rn.fat_100g)}g vs ${r(n.fat_100g)}g)`);
      if (rn.proteins_100g != null && n.proteins_100g != null && rn.proteins_100g > n.proteins_100g)
        whyBetter.push(`more protein (${r(rn.proteins_100g)}g vs ${r(n.proteins_100g)}g)`);
      if (rn.energy_kcal_100g != null && n.energy_kcal_100g != null && rn.energy_kcal_100g < n.energy_kcal_100g)
        whyBetter.push(`fewer calories (${r(rn.energy_kcal_100g, 0)} vs ${r(n.energy_kcal_100g, 0)} kcal)`);
    }
    if (whyBetter.length) lines.push(`   ✅ ${whyBetter.join(', ')}`);

    // Additive comparison
    const recAdditiveCount = (rec.additive_details || []).length;
    const origAdditiveCount = (scanResult.additive_details || []).length;
    if (origAdditiveCount > 0 && recAdditiveCount < origAdditiveCount)
      lines.push(`   ✅ Fewer additives (${recAdditiveCount} vs ${origAdditiveCount})`);

    lines.push(''); // blank line between alternatives
  });

  // Profile-aware tip
  const goals = readableGoals(profile);
  if (goals.length)
    lines.push(`These suggestions are tailored to your ${goals.join(' & ')} goals.`);

  return lines.join('\n');
}

// ────────────────────────────────────────────────────────
//  Full rule-based router
// ────────────────────────────────────────────────────────
function ruleBasedResponse(cmd, scanResult, profile) {
  const lower = cmd.toLowerCase();

  // GREETINGS
  if (/^(hi|hello|hey|what's up|good morning|good evening)\b/i.test(lower))
    return "Hey there! I'm NutriGuard, your personal food-health assistant. Scan any product and I'll tell you its score, what's in it, and suggest healthier swaps. Ask me anything!";

  // WHO ARE YOU
  if (/who are you|what (are|can) you do|tell me about yourself/i.test(lower))
    return "I'm NutriGuard AI — your smart nutrition buddy. I analyse food products, give them a personalised health score based on your profile, flag dangerous ingredients, and recommend better alternatives. Just scan a product and ask away!";

  // ── SCORE / WHY  (tightened regex — must mention score/rating/why explicitly) ──
  if (
    /\b(why.*(score|rating|rated|rank)|explain.*(score|rating)|how.*(score|calculated|rated)|what.*score|reason.*(score|rating|low|high)|score.*reason|scored|break\s*down.*score)\b/i.test(lower) ||
    /\bscore\b/i.test(lower)
  ) {
    return explainScore(scanResult, profile);
  }

  // ── ALTERNATIVES ──
  if (/\b(alternative|suggest|better|swap|replace|instead|what else|recommend|healthier|switch|similar|option)\b/i.test(lower)) {
    return suggestAlternatives(scanResult, profile);
  }

  // INGREDIENTS / ADDITIVES
  if (/\b(ingredient|additive|chemical|e\d{3}|harmful|safe|contain|preservative|colour|color)\b/i.test(lower)) {
    if (!scanResult) return "Please scan a product first so I can tell you about its ingredients!";
    const additives = scanResult.additive_details || [];
    if (additives.length === 0)
      return `Good news — ${scanResult.name} doesn't have any concerning additives that I can flag.`;
    const highRisk = additives.filter((a) => a.risk === 'high');
    const modRisk = additives.filter((a) => a.risk === 'moderate');
    const lowRisk = additives.filter((a) => a.risk === 'low');
    const lines = [`${scanResult.name} contains ${additives.length} additive(s):\n`];
    highRisk.forEach((a) => lines.push(`⚠️ ${a.name} — HIGH risk. ${a.description || 'Avoid if possible.'}`));
    modRisk.forEach((a) => lines.push(`⚡ ${a.name} — moderate risk. ${a.description || 'Generally okay in small amounts.'}`));
    lowRisk.forEach((a) => lines.push(`✅ ${a.name} — low risk.`));
    return lines.join('\n');
  }

  // NUTRITION FACTS
  if (/\b(nutrition|calorie|protein|fat|sugar|sodium|carb|fibre|fiber|macro|energy|kcal)\b/i.test(lower)) {
    if (!scanResult) return "Scan a product first and I'll break down its nutrition for you!";
    const n = scanResult.nutrition || {};
    let reply = `Here's the nutrition breakdown for ${scanResult.name} per 100g:\n`;
    reply += `  • Energy: ${r(n.energy_kcal_100g)} kcal\n`;
    reply += `  • Protein: ${r(n.proteins_100g)}g\n`;
    reply += `  • Fat: ${r(n.fat_100g)}g (Saturated: ${r(n.saturated_fat_100g)}g)\n`;
    reply += `  • Sugar: ${r(n.sugars_100g)}g\n`;
    reply += `  • Salt / Sodium: ${r(n.sodium_100g)}g\n`;
    reply += `  • Fibre: ${r(n.fiber_100g)}g\n`;
    if (n.sugars_100g > 15) reply += "\n⚠️ Sugar content is high — enjoy in moderation.";
    if (n.proteins_100g > 15) reply += "\n💪 Impressive protein level!";
    return reply;
  }

  // PROFILE
  if (/\b(my profile|health status|my goals|my condition|my allerg)\b/i.test(lower)) {
    if (!profile)
      return "You haven't set up a health profile yet. Tap the Profile button and fill in your health conditions, allergies, and goals — it'll make my analysis much more accurate!";
    const goals = readableGoals(profile);
    const conditions = readableConditions(profile);
    let reply = 'Your health profile is set! ';
    if (goals.length) reply += `Goals: ${goals.join(', ')}. `;
    if (conditions.length) reply += `Conditions I factor in: ${conditions.join(', ')}. `;
    reply += 'Every score is personalised using this profile.';
    return reply;
  }

  // SCAN REQUEST
  if (/\b(scan|analyze|check|barcode|read)\b/i.test(lower))
    return "Sure! Opening the scanner for you now. Point your camera at the barcode or enter it manually.";

  // GENERAL HEALTH TIP
  if (/\b(healthy|diet|eat|food|tip|advice)\b/i.test(lower)) {
    const tips = [
      "Choose products with NOVA Group 1–2 (minimally processed). They're consistently linked to better health outcomes.",
      "Look for products with under 5g of sugar per 100g — the WHO's recommended ceiling for added sugars.",
      "Aim for at least 10g protein per 100g if muscle gain or satiety is your goal.",
      "If you have hypertension, avoid anything above 1.5g salt per 100g — it adds up fast.",
      "Ultra-processed foods (NOVA 4) are linked to higher chronic-disease risk. Fewer ingredients is usually better!",
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // THANKS
  if (/\b(thanks|thank you|great|awesome|perfect|nice)\b/i.test(lower))
    return "You're welcome! I'm here whenever you need help making smarter food choices. Anything else you'd like to know?";

  // DEFAULT
  return `I'm not sure about "${cmd}", but I'm great at food analysis! Try asking:\n  • "Why did this get that score?"\n  • "Suggest healthier alternatives"\n  • "What are the ingredients like?"\n  • "Show me the nutrition facts"`;
}

// ────────────────────────────────────────────────────────
//  AI system prompt — now much more targeted
// ────────────────────────────────────────────────────────
function buildAIPrompt(context) {
  return `You are NutriGuard AI, a warm and knowledgeable food-health assistant in a mobile app.

${context ? `=== SCANNED PRODUCT DATA ===\n${context}\n=== END DATA ===` : 'No product scanned yet.'}

RULES:
1. Respond in warm, human, simple language. No markdown. No bullet points.
2. 3-5 sentences max.
3. If asked WHY a product scored the way it did: reference the specific SCORE REASONS, the nutrition numbers (sugar, salt, fat, protein), any risky additives, the NOVA processing group, and how the user's health conditions/goals affect the score. Be specific with numbers.
4. If asked for ALTERNATIVES: name each recommended product, its score, how many points better it is, and WHY it's better (compare specific nutrition values or additive counts). If none exist say so.
5. If no product is scanned and the user asks about a product, tell them to scan one first.
6. Never invent nutrition data. Only use the data above.`;
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

  // Refs so callbacks never go stale
  const scanResultRef = useRef(scanResult);
  const profileRef = useRef(profile);
  const onScanRequestRef = useRef(onScanRequest);
  const handleCommandRef = useRef(null); // ← NEW: keep handleCommand always fresh

  useEffect(() => { scanResultRef.current = scanResult; }, [scanResult]);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  useEffect(() => { onScanRequestRef.current = onScanRequest; }, [onScanRequest]);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // ── Pre-load voices (they're async in Chrome) ──
  useEffect(() => {
    const loadVoices = () => synthRef.current?.getVoices();
    loadVoices();
    synthRef.current?.addEventListener?.('voiceschanged', loadVoices);
    return () => synthRef.current?.removeEventListener?.('voiceschanged', loadVoices);
  }, []);

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
    const preferred =
      voices.find((v) => v.name.includes('Google US English')) ||
      voices.find((v) => v.name.includes('Samantha')) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices[0];
    if (preferred) utterance.voice = preferred;
    synthRef.current.speak(utterance);
    setResponse(text);
  }, []);

  const handleCommand = useCallback(
    async (cmd) => {
      const currentScanResult = scanResultRef.current;
      const currentProfile = profileRef.current;

      // Scan shortcut
      if (/\b(scan|open scanner|check product|read barcode)\b/i.test(cmd)) {
        speak('Sure! Opening the scanner for you now.');
        onScanRequestRef.current?.();
        return;
      }

      setIsThinking(true);

      const context = buildSystemContext(currentScanResult, currentProfile);
      const systemPrompt = buildAIPrompt(context);

      // ── Step 1: Gemini ──
      if (GEMINI_API_KEY) {
        const geminiResp = await askGemini(`${systemPrompt}\nUser: "${cmd}"`);
        if (geminiResp) { setIsThinking(false); speak(geminiResp); return; }
      }

      // ── Step 2: OpenRouter ──
      if (OPENROUTER_API_KEY) {
        const orResp = await askOpenRouter(systemPrompt, cmd);
        if (orResp) { setIsThinking(false); speak(orResp); return; }
      }

      // ── Step 3: Rule-based fallback ──
      setIsThinking(false);
      speak(ruleBasedResponse(cmd, currentScanResult, currentProfile));
    },
    [speak]
  );

  // Keep ref in sync so recognition callback is never stale
  useEffect(() => { handleCommandRef.current = handleCommand; }, [handleCommand]);

  // ── Initialize Speech Recognition ONCE ──
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
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
      if (event.error === 'not-allowed')
        setError('Microphone access denied. Please allow mic access and try again.');
      else if (event.error === 'no-speech')
        setError('Nothing heard. Try again and speak clearly.');
    };
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleCommandRef.current?.(text); // ← always calls the LATEST handleCommand
    };

    recognitionRef.current = recognition;
  }, []); // truly only once — no stale closure risk thanks to ref

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
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isListening
                        ? 'bg-red-400 animate-pulse'
                        : isSpeaking
                        ? 'bg-primary animate-pulse'
                        : isThinking
                        ? 'bg-yellow-400 animate-pulse'
                        : 'bg-gray-500'
                    }`}
                  />
                  {isListening && (
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[var(--text-main)]">
                    NutriGuard AI
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] opacity-60">
                    {isListening
                      ? 'Listening...'
                      : isSpeaking
                      ? 'Speaking...'
                      : isThinking
                      ? 'Thinking...'
                      : 'Ready to help'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssistant(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-[var(--text-secondary)]" />
              </button>
            </div>

            {/* Chat Bubble — now preserves newlines from detailed responses */}
            <div className="min-h-[90px] max-h-[50vh] overflow-y-auto mb-4 bg-[var(--background)]/40 rounded-2xl p-4 border border-[var(--glass-border)]">
              {transcript && (
                <p className="text-[11px] text-[var(--text-secondary)] italic mb-2 opacity-70 line-clamp-2">
                  You: &ldquo;{transcript}&rdquo;
                </p>
              )}
              {isThinking ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm text-[var(--text-secondary)]">Thinking...</span>
                </div>
              ) : response ? (
                <p className="text-sm text-[var(--text-main)] font-medium leading-relaxed whitespace-pre-line">
                  {response}
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-40 mb-2">
                    Try asking me:
                  </p>
                  {[
                    '"Why did this product get that score?"',
                    '"Suggest healthier alternatives"',
                    '"What are the ingredients like?"',
                    '"Show me the nutrition facts"',
                  ].map((hint, i) => (
                    <p key={i} className="text-[11px] text-[var(--text-secondary)] opacity-60">
                      → {hint}
                    </p>
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
                {isListening &&
                  [1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-10"
                      style={{ animationDelay: `${i * 0.2}s`, animationDuration: '1.2s' }}
                    />
                  ))}
                {isListening ? (
                  <MicOff className="w-5 h-5 relative z-10" />
                ) : (
                  <Mic className="w-5 h-5 relative z-10" />
                )}
              </motion.button>

              {isSpeaking && (
                <div className="flex gap-1 items-end h-5">
                  {[1, 2, 3, 2, 1].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, h * 5, 4] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5 + i * 0.05,
                        delay: i * 0.08,
                      }}
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
            <span className="hidden md:block text-xs font-black uppercase tracking-widest mr-1">
              Ask AI
            </span>
          </div>
        )}
        {scanResult && !showAssistant && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-[var(--background)] animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}