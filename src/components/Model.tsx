'use client';

import { memo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Hvis du bruker Draco:
useGLTF.setDecoderPath('/draco/'); // kommenter ut hvis ikke Draco

type Props = {
  url?: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
};

function ModelImpl({
  url = '/models/myModel.glb',
  scale = 1,
  position = [-7.77, 0, 13],
  rotation = [0, 0, 0],
}: Props) {
  const { scene } = useGLTF(url);

  // Valgfritt: slå på skygger hvis ønskelig
  useEffect(() => {
    scene.traverse((obj: THREE.Object3D) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }

      // 🎨 Gi materialet en tilfeldig farge
        if (obj.material) {
          const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
          // Hvis materialet støtter farge
          if (obj.material.color) {
            obj.material = obj.material.clone(); // Klon for å unngå å endre delt materiale
            obj.material.color = randomColor;
          }
        }
    });
  }, [scene]);

  return <primitive object={scene} scale={scale} position={position} rotation={rotation} />;
}

export default memo(ModelImpl);

// Forhåndslaster modellen:
useGLTF.preload('/models/myModel.glb');
