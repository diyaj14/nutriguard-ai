import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function NeuralFood({ scrollProgress }) {
    const meshRef = useRef();
    const outerRef = useRef();
    const particlesRef = useRef();
    const subParticlesRef = useRef();

    // Procedural High-Definition Leaf Geometry
    const leafGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        // More organic, slightly curved leaf shape
        shape.moveTo(0, -1.8);
        shape.bezierCurveTo(0.8, -1.5, 1.8, -0.5, 1.8, 0.8);
        shape.bezierCurveTo(1.8, 2.0, 0.5, 2.8, 0, 3.2); // Pointy top
        shape.bezierCurveTo(-0.5, 2.8, -1.8, 2.0, -1.8, 0.8);
        shape.bezierCurveTo(-1.8, -0.5, -0.8, -1.5, 0, -1.8);
        
        const extrudeSettings = {
            steps: 2,
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: 0.2,
            bevelOffset: 0,
            bevelSegments: 12
        };
        
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.computeVertexNormals();
        geo.center();
        return geo;
    }, []);

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

        // Realistic Wind/Breeze Motion (Gentle sway)
        if (meshRef.current) {
            meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.15;
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, time * 0.2 + (scroll * Math.PI), 0.05);
            meshRef.current.rotation.z = Math.cos(time * 0.2) * 0.1;
        }

        if (outerRef.current) {
            outerRef.current.rotation.y = meshRef.current.rotation.y;
            outerRef.current.rotation.z = meshRef.current.rotation.z;
        }

        // Particle Orchestration
        if (particlesRef.current) {
            particlesRef.current.rotation.y = time * 0.05;
            particlesRef.current.position.y = Math.sin(time * 0.4) * 0.2;
            const alpha = scroll > 0.4 ? (scroll - 0.4) * 2 : 0;
            particlesRef.current.material.opacity = THREE.MathUtils.lerp(particlesRef.current.material.opacity, alpha, 0.1);
        }

        if (subParticlesRef.current) {
            subParticlesRef.current.rotation.y = -time * 0.1;
            subParticlesRef.current.material.opacity = particlesRef.current?.material.opacity * 0.6;
        }
    });

    return (
        <group>
            {/* Main Light Source to highlight 3D depth */}
            <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={2} color="#10B981" castShadow />
            <pointLight position={[-5, -5, -5]} intensity={1} color="#FBBF24" />

            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
                {/* Hyper-Realistic Biotech Leaf */}
                <mesh geometry={leafGeometry} ref={meshRef}>
                    <meshPhysicalMaterial
                        color="#064E3B" // Deep Forest Green
                        emissive="#10B981" // Radiant highlight
                        emissiveIntensity={0.4}
                        roughness={0.2}
                        metalness={0.6}
                        transmission={0.3} // Subtle translucent effect
                        thickness={0.5}
                        clearcoat={0.8}
                        clearcoatRoughness={0.2}
                    />
                </mesh>

                {/* Internal Nerve System (Wireframe) */}
                <mesh geometry={leafGeometry} scale={1.02} ref={outerRef}>
                    <meshStandardMaterial
                        color="#34D399"
                        wireframe
                        transparent
                        opacity={0.15}
                    />
                </mesh>
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
