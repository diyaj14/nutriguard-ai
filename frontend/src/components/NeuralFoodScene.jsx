import React from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { NeuralFood } from './NeuralFood';

export function NeuralFoodScene({ scrollProgress }) {
    return (
        <>
            {/* The camera remains static, looking straight down the Z axis */}
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

            {/* The main molecule shower that takes over the scene */}
            <NeuralFood scrollProgress={scrollProgress} />

            {/* Disable controls so the user interaction is handled by pointer repel in Molecule components */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={false}
                enableRotate={false}
            />
        </>
    );
}
