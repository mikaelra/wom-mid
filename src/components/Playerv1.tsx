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
  const sceneClone = useMemo(() => scene.clone(), [scene]); // Each instance needs its own clone
  const modelRef = useRef<THREE.Group>(null!);

  // Set an initial "off-screen" position if animating (memoized for stable ref in useEffect deps)
  const initialPosition = useMemo(
    () => new THREE.Vector3(position[0], 50, position[2]),
    [position[0], position[2]]
  );
  const targetPosition = useMemo(() => new THREE.Vector3(...position), [position[0], position[1], position[2]]);

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

    sceneClone.traverse((obj: THREE.Object3D) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.renderOrder = 10;
      }
    });
  }, [sceneClone, isAnimating, initialPosition]);
  
  return (
    <primitive
      ref={modelRef}
      object={sceneClone}
      scale={scale}
      {...(isAnimating ? {} : { position })}
      rotation={rotation}
    />
  );
}

export default memo(PlayerV1Impl);

// Preload the model for faster loading
useGLTF.preload('/models/playerv1.glb');