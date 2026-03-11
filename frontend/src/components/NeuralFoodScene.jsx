import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { NeuralFood } from './NeuralFood';
import * as THREE from 'three';

export function NeuralFoodScene({ scrollProgress }) {
    const { viewport } = useThree();
    const groupRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const scroll = scrollProgress.get();
        const t = scroll; // 0 to 1

        // 1. Fluid Path across scroll
        // Horizontal swaying + Vertical travel
        const driftX = Math.sin(time * 0.5) * 0.2;
        const driftY = Math.cos(time * 0.3) * 0.2;

        const targetX = (Math.sin(t * Math.PI) * (viewport.width * 0.3)) + driftX;
        const targetY = (-t * (viewport.height * 0.4)) + driftY;
        const targetZ = t * 3;

        const targetScale = 1 - (t * 0.3);

        if (groupRef.current) {
            // More responsive lerp (0.1 instead of 0.05)
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.08);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.08);
            groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.08);

            const s = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.08);
            groupRef.current.scale.setScalar(s);
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <ambientLight intensity={1.5} />
            <pointLight position={[10, 10, 10]} intensity={3} color="#16E0A0" />
            <pointLight position={[-10, -10, -10]} intensity={2} color="#00C2FF" />

            <group ref={groupRef}>
                <NeuralFood scrollProgress={scrollProgress} />
            </group>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={true}
                autoRotateSpeed={1.2}
            />
        </>
    );
}
