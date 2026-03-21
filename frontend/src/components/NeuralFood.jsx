import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

// Preload the requested molecules
useGLTF.preload('/ddt_molecule.glb');
useGLTF.preload('/sucrose_molecule.glb');

// Single Molecule Component
function Molecule({ position, baseScale, variation, color, type }) {
    const gltfURL = type === 'ddt' ? '/ddt_molecule.glb' : '/sucrose_molecule.glb';
    const { scene } = useGLTF(gltfURL);
    
    // Compute normalization scale and center offset precisely ONCE for the shared scene
    const { normalizedScale, centerOffset } = useMemo(() => {
        const box = new THREE.Box3().setFromObject(scene);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        return {
            normalizedScale: maxDim > 0 ? 1 / maxDim : 1,
            centerOffset: center
        };
    }, [scene]);

    // We clone the object hierarchy so we can place many molecules
    const clonedScene = useMemo(() => {
        const c = scene.clone(true);
        // Design Persona applied: vibrant neon appearance that's visible without an environment map
        const material = new THREE.MeshStandardMaterial({
            color: color, 
            emissive: color,
            emissiveIntensity: 0.6,
            roughness: 0.2,
            metalness: 0.3,
            transparent: true,
            opacity: 0.9,
        });
        
        c.traverse((node) => {
            if (node.isMesh) {
                // Apply our high-aesthetic UI Designer material
                node.material = material;
                // Note: We DO NOT mutate node.geometry here because geometries are shared across clones
            }
        });
        
        // Let's rely on standard three.js scaling, and center using the group wrapper below
        return c;
    }, [scene, color]);

    const groupRef = useRef();
    const { pointer, viewport } = useThree();
    
    // Target position for smooth interactions
    const initPosition = useRef([...position]);
    const currentPosition = useRef([...position]);
    const rotationVelocity = useRef({ x: variation * 0.5, y: variation * 0.3 });

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Map mouse pointer roughly to world units at z=0 plane
        const pX = (pointer.x * viewport.width) / 2;
        const pY = (pointer.y * viewport.height) / 2;
        
        const gX = currentPosition.current[0];
        const gY = currentPosition.current[1];
        
        const dist = Math.sqrt(Math.pow(gX - pX, 2) + Math.pow(gY - pY, 2));
        
        // Touch / pointer repulsion effect for continuous interactive physics
        if (dist < 4) {
            const angle = Math.atan2(gY - pY, gX - pX);
            const force = (4 - dist) * 1.5 * delta;
            currentPosition.current[0] += Math.cos(angle) * force;
            currentPosition.current[1] += Math.sin(angle) * force;
            // Add a little spin when interacted with
            rotationVelocity.current.x += force * 0.8;
            rotationVelocity.current.y += force * 0.8;
        } else {
            // Drift back to floating position, swaying using variation
            const time = state.clock.elapsedTime;
            // The faster ones drift wildly and cover more space
            const driftPace = 1.2 * (Math.abs(variation) > 3 ? 3 : 1);
            const driftX = Math.sin(time * 0.5 + variation) * driftPace;
            const driftY = Math.cos(time * 0.4 + variation) * driftPace;
            
            currentPosition.current[0] = THREE.MathUtils.lerp(
                currentPosition.current[0], 
                initPosition.current[0] + driftX, 
                delta * 0.8
            );
            currentPosition.current[1] = THREE.MathUtils.lerp(
                currentPosition.current[1], 
                initPosition.current[1] + driftY, 
                delta * 0.8
            );
        }

        // Dampen rotation velocity back to base pace
        rotationVelocity.current.x = THREE.MathUtils.lerp(rotationVelocity.current.x, variation * 0.5, delta);
        rotationVelocity.current.y = THREE.MathUtils.lerp(rotationVelocity.current.y, variation * 0.3, delta);

        // Apply transforms
        groupRef.current.position.set(currentPosition.current[0], currentPosition.current[1], position[2]);
        groupRef.current.rotation.x += rotationVelocity.current.x * delta;
        groupRef.current.rotation.y += rotationVelocity.current.y * delta;
    });

    return (
        <Float 
            speed={1 + Math.abs(variation)} 
            rotationIntensity={0} 
            floatIntensity={0}    
        >
            <group ref={groupRef} scale={baseScale * normalizedScale}>
                <group position={[-centerOffset.x, -centerOffset.y, -centerOffset.z]}>
                    <primitive object={clonedScene} />
                </group>
            </group>
        </Float>
    );
}

export function NeuralFood({ scrollProgress }) {
    const fieldRef = useRef();

    const molecules = useMemo(() => {
        const count = 150; // Increased explicitly across the background field
        const items = [];
        
        // UI Designer color palette: Blue primary & Emerald success + tech neons
        const palette = [
            '#10b981', // Emerald health
            '#3b82f6', // Primary Blue
            '#0ea5e9', // Cyan
            '#60a5fa', // Light Blue
            '#34d399', // Light Emerald
            '#8b5cf6', // Soft UI Purple
        ];
        
        for (let i = 0; i < count; i++) {
            // Spanned width and high Y distribution so scroll sweeps through them cleanly
            const x = (Math.random() - 0.5) * 60; 
            const y = (Math.random() - 0.5) * 80; 
            // Z depth covers very deep background up to quite nearby screen plane
            const z = (Math.random() - 1.0) * 18 + 1; // -17 to +1
            
            // "Extremely small" scale explicitly as requested, but adjusted to be visible in relation to 16 unit camera height
            const scale = Math.random() * 0.8 + 0.3; 
            
            // Random behavioral attributes (10% chance to be exceptionally fast)
            const isFast = Math.random() > 0.9;
            const variation = (Math.random() * 3 - 1.5) * (isFast ? 4 : 1); 
            const type = Math.random() > 0.5 ? 'ddt' : 'sucrose';
            const color = palette[Math.floor(Math.random() * palette.length)];

            items.push({ id: i, position: [x, y, z], scale, variation, type, color, isFast });
        }
        return items;
    }, []);

    useFrame(() => {
        if (!fieldRef.current || !scrollProgress) return;
        
        // Connect the Y-offset perfectly to the global standard page scroll via lenis/framer-motion
        // As scroll progresses down (0 to 1), move the group up (+Y), acting like the camera goes down.
        const scroll = scrollProgress.get();
        const maxScrollTravel = 25; // How much travel distance occurs through the molecule field
        
        fieldRef.current.position.y = THREE.MathUtils.lerp(
            fieldRef.current.position.y, 
            scroll * maxScrollTravel, 
            0.1
        );
    });

    return (
        <group ref={fieldRef}>
            {/* Ambient Base Light ensures the deep translucency works */}
            <ambientLight intensity={1.5} />
            
            <spotLight position={[10, 20, 10]} angle={0.8} penumbra={1} intensity={6} color="#ffffff" castShadow />
            <spotLight position={[-10, -20, -10]} angle={0.8} penumbra={1} intensity={4} color="#10b981" />
            <pointLight position={[0, 0, 5]} intensity={2.5} color="#3b82f6" />
            
            {molecules.map((m) => (
                <Molecule 
                    key={m.id}
                    position={m.position}
                    baseScale={m.scale}
                    variation={m.variation}
                    type={m.type}
                    color={m.color}
                />
            ))}
        </group>
    );
}
