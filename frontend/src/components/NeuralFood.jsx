import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function NeuralFood({ scrollProgress }) {
    const meshRef = useRef();
    const outerRef = useRef();
    const particlesRef = useRef();
    const subParticlesRef = useRef();

    // Load User's 3D Model
    const { nodes } = useGLTF('/leaves.glb');
    
    // Logic to select only ONE leaf mesh from the model
    const leafMesh = useMemo(() => {
        const meshes = Object.values(nodes).filter(node => node.type === 'Mesh' || node.type === 'SkinnedMesh');
        const original = meshes[0];
        if (!original) return null;
        
        const clone = original.clone();
        clone.geometry = clone.geometry.clone();
        clone.geometry.center(); // Ensure it's centered
        return clone;
    }, [nodes]);

    // Apply biotech material properties to the custom model mesh
    const biotechMaterial = useMemo(() => (
        <meshPhysicalMaterial
            color="#064E3B" // Deep Forest Green
            emissive="#10B981" // Radiant highlight
            emissiveIntensity={0.6}
            roughness={0.1}
            metalness={0.8}
            transmission={0.4} // Subtle translucent effect
            thickness={0.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
        />
    ), []);

    // Dual-Color Particle System (Emerald & Amber)
    const [mainParticles, subParticles] = useMemo(() => {
        const createParticels = (count, spread, color) => {
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                positions[i * 3] = (Math.random() - 0.5) * spread;
                positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
                positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
            }
            return positions;
        };
        return [
            createParticels(400, 6, '#10B981'), // Primary Emerald
            createParticels(200, 8, '#FBBF24')  // Contrasting Warm Amber
        ];
    }, []);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        const scroll = scrollProgress ? scrollProgress.get() : 0;

        // Realistic Wind/Breeze Motion (Gentle sway) - Now fixed "straight"
        if (meshRef.current) {
            // Keep it straight (upright based on original base orientation)
            meshRef.current.rotation.x = Math.PI / 2;
            meshRef.current.rotation.y = 0;
            meshRef.current.rotation.z = 0;
        }

        if (outerRef.current) {
            outerRef.current.rotation.y = 0;
            outerRef.current.rotation.z = 0;
        }

        // Particle Orchestration
        if (particlesRef.current) {
            particlesRef.current.rotation.y = time * 0.05;
            particlesRef.current.position.y = Math.sin(time * 0.4) * 0.2;
            // Start from 0.4 opacity at top of page and grow to 1.0
            const alpha = 0.4 + (scroll * 0.6);
            particlesRef.current.material.opacity = THREE.MathUtils.lerp(particlesRef.current.material.opacity, alpha, 0.1);
        }

        if (subParticlesRef.current) {
            subParticlesRef.current.rotation.y = -time * 0.1;
            subParticlesRef.current.material.opacity = particlesRef.current?.material.opacity * 0.6;
        }
    });

    return (
        <group>
            {/* Neutral Lighting to preserve original model colors */}
            <ambientLight intensity={1.5} />
            <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={3} color="#ffffff" castShadow />
            <pointLight position={[-5, -5, -5]} intensity={2} color="#ffffff" />

            <Float speed={2} rotationIntensity={0} floatIntensity={0.8}>
                {/* Authentic 3D Model Leaf - Using Original Material and Upright Orientation */}
                {leafMesh && (
                    <group 
                        scale={2.2} 
                        ref={meshRef}
                    >
                        <primitive object={leafMesh} />
                    </group>
                )}
            </Float>

            {/* Emerald Life Particles */}
            <Points ref={particlesRef} positions={mainParticles} stride={3}>
                <PointMaterial
                    transparent
                    color="#10B981"
                    size={0.04}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0}
                />
            </Points>

            {/* Warm Assessment Particles (Amber) */}
            <Points ref={subParticlesRef} positions={subParticles} stride={3}>
                <PointMaterial
                    transparent
                    color="#FBBF24"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0}
                />
            </Points>
        </group>
    );
}
