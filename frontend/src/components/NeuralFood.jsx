import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

export function NeuralFood() {
    const meshRef = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        meshRef.current.rotation.x = time * 0.2;
        meshRef.current.rotation.y = time * 0.3;
    });

    return (
        <Sphere args={[1, 100, 200]} scale={2.4} ref={meshRef}>
            <MeshDistortMaterial
                color="#16E0A0"
                attach="material"
                distort={0.5}
                speed={1.5}
                roughness={0.2}
                metalness={0.8}
                wireframe={true}
                transparent={true}
                opacity={0.15}
            />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} color="#00C2FF" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#16E0A0" />
        </Sphere>
    );
}
