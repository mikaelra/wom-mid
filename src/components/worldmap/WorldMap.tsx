'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import CityMarker from './CityMarker';
import { CITIES, type City } from '@/lib/cities';

const GLOBE_RADIUS = 2.5;

// --- Simple procedural globe material (land / ocean via noise-like pattern) ---

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Vertex shader adds noise-based coloring to differentiate land/ocean
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        uniform float uTime;

        // Simple hash-based pseudo-noise
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 5; i++) {
            v += a * noise(p);
            p *= 2.0;
            a *= 0.5;
          }
          return v;
        }

        void main() {
          // Spherical UV → noise → land or ocean
          vec2 st = vUv * 8.0;
          float n = fbm(st + 0.5);

          vec3 ocean = vec3(0.05, 0.15, 0.35);
          vec3 shallow = vec3(0.1, 0.3, 0.5);
          vec3 land = vec3(0.18, 0.42, 0.18);
          vec3 highland = vec3(0.35, 0.30, 0.15);
          vec3 snow = vec3(0.85, 0.88, 0.92);

          vec3 col;
          if (n < 0.42) {
            col = mix(ocean, shallow, smoothstep(0.3, 0.42, n));
          } else if (n < 0.5) {
            col = mix(shallow, land, smoothstep(0.42, 0.5, n));
          } else if (n < 0.65) {
            col = mix(land, highland, smoothstep(0.5, 0.65, n));
          } else {
            col = mix(highland, snow, smoothstep(0.65, 0.8, n));
          }

          // Fake rim lighting / atmosphere
          float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
          rim = pow(rim, 3.0);
          col = mix(col, vec3(0.4, 0.7, 1.0), rim * 0.4);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, []);

  useFrame(({ clock }) => {
    shaderMaterial.uniforms.uTime.value = clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005; // Slow auto-rotate
    }
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
    </mesh>
  );
}

// --- Atmosphere glow ring ---
function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * 0.6);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );
  return (
    <mesh material={material}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.15, 64, 64]} />
    </mesh>
  );
}

// --- Clouds layer ---
function Clouds() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0008;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[GLOBE_RADIUS * 1.01, 48, 48]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.08} depthWrite={false} />
    </mesh>
  );
}

// --- Camera auto-rotation (slow orbit when idle) ---
function CameraRig() {
  const { camera } = useThree();
  const initialized = useRef(false);

  useFrame(() => {
    if (!initialized.current) {
      camera.position.set(0, 2, 7);
      camera.lookAt(0, 0, 0);
      initialized.current = true;
    }
  });

  return null;
}

// --- Main WorldMap scene ---
interface WorldMapProps {
  onCityClick: (city: City) => void;
}

export default function WorldMap({ onCityClick }: WorldMapProps) {
  return (
    <>
      <CameraRig />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4488ff" />

      {/* Background */}
      <color attach="background" args={['#070b15']} />
      <Stars radius={50} depth={40} count={2000} factor={3} fade speed={0.5} />

      {/* Globe */}
      <Globe />
      <Atmosphere />
      <Clouds />

      {/* City markers */}
      {CITIES.map((city) => (
        <CityMarker
          key={city.id}
          city={city}
          globeRadius={GLOBE_RADIUS}
          onClick={onCityClick}
        />
      ))}

      {/* Orbit controls */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={4}
        maxDistance={12}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  );
}

export { GLOBE_RADIUS };
