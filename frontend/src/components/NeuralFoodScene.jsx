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

        // 1. Fluid Path across scroll - Strictly pattern-based
        // Moving in a predictable wave as the user scrolls
        const targetX = Math.sin(t * Math.PI * 1.5) * (viewport.width * 0.35);
        const targetY = -t * (viewport.height * 0.4) + 1; // Slight offset upwards
        const targetZ = 4; // Constant depth for "zoomed in" look

        const targetScale = 0.75; // Reduced by 50% as requested

        if (groupRef.current) {
            // Smoothly move to target pattern positions
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
            groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);

            groupRef.current.scale.setScalar(targetScale);
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <ambientLight intensity={1.2} />
            <pointLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ffffff" />

            <group ref={groupRef}>
                <NeuralFood scrollProgress={scrollProgress} />
            </group>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={false}
            />
        </>
    );
}
