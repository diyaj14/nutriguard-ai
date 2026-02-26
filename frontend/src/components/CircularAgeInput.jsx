import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export function CircularAgeInput({ value, onChange }) {
    const constraintsRef = useRef(null);
    const [angle, setAngle] = useState(0);

    // Map value (18-80) to degrees (0-360 approx, or simplified arc)
    // Let's go for a full rotation behavior for simplicity or a semi-circle. 
    // Custom logic: center of circle.

    const handleDrag = (event, info) => {
        const rect = constraintsRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate angle from center to pointer
        // We assume touch/mouse position in info.point is page relative
        const x = info.point.x - centerX;
        const y = info.point.y - centerY;

        let newAngle = Math.atan2(y, x) * (180 / Math.PI);
        // Adjust angle to be 0 at top or useful range
        newAngle = (newAngle + 90 + 360) % 360;

        setAngle(newAngle);

        // Map 0-360 to Age 18-80
        // 0 deg = 18, 360 deg = 80
        const ageRange = 80 - 18;
        const calculatedAge = Math.round(18 + (newAngle / 360) * ageRange);
        onChange(Math.max(18, Math.min(80, calculatedAge)));
    };

    return (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center select-none touch-none">
            {/* Glow / Track */}
            <div ref={constraintsRef} className="absolute inset-0 rounded-full border-4 border-white/5 shadow-[0_0_30px_rgba(22,224,160,0.1)]"></div>

            {/* Active Arc */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none">
                <circle
                    cx="96" cy="96" r="80"
                    fill="transparent"
                    stroke="#16E0A0"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 80}
                    strokeDashoffset={2 * Math.PI * 80 * (1 - (value - 18) / (80 - 18))}
                    strokeLinecap="round"
                    className="transition-all duration-75"
                />
            </svg>

            {/* Knob */}
            <motion.div
                className="absolute w-full h-full rounded-full cursor-grab active:cursor-grabbing"
                style={{ rotate: (value - 18) / (80 - 18) * 360 }}
                drag
                dragConstraints={constraintsRef}
                dragElastic={0}
                dragMomentum={false}
                onDrag={handleDrag}
            >
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-black border-2 border-primary rounded-full shadow-[0_0_10px_rgba(22,224,160,0.7)] z-10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                </div>
            </motion.div>

            {/* Center Text */}
            <div className="text-center z-0 pointer-events-none">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-extrabold block mb-0">Age</span>
                <span className="text-5xl font-black text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                    {value}
                </span>
            </div>
        </div>
    );
}
