'use client';

import { memo, useEffect, useRef, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// If you are using Draco, you might need to set the decoder path
// useGLTF.setDecoderPath('/draco/');

type Props = {
  url?: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  isAnimating?: boolean;
};

function PlayerV1Impl({
  url = '/models/playerv1.glb', // Default model for PlayerV1
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  isAnimating = false,
}: Props) {
  const { scene } = useGLTF(url);
  const sceneClone = useMemo(() => scene.clone(), []); // Each instance needs its own clone
  const modelRef = useRef<THREE.Group>(null!);

  // Set an initial "off-screen" position if animating
  const initialPosition = new THREE.Vector3(position[0], 50, position[2]);
  const targetPosition = new THREE.Vector3(...position);

  useFrame((_, delta) => {
    if (isAnimating && modelRef.current) {
      // Smoothly interpolate the model's position towards the target
      modelRef.current.position.lerp(targetPosition, delta * 1.5);
    }
  });

  // Optional: enable shadows if desired
  useEffect(() => {
    // Set initial position when component mounts if we are animating
    if (isAnimating && modelRef.current) {
      modelRef.current.position.copy(initialPosition);
    }

    sceneClone.traverse((obj: any) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.renderOrder = 10;
      }
    });
  }, [sceneClone]);
  
  return (
    <primitive
      ref={modelRef}
      object={sceneClone}
      scale={scale}
      position={isAnimating ? initialPosition : position} // Use initial position if animating
      rotation={rotation}
    />
  );
}

export default memo(PlayerV1Impl);

// Preload the model for faster loading
useGLTF.preload('/models/playerv1.glb');