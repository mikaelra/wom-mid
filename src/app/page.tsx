'use client';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import dynamic from 'next/dynamic';
import { useState, useRef, memo } from 'react';
import * as THREE from 'three';
import Mountain from '@/components/mountain';
import Table from '@/components/Table';
import ExplosionEffect from '@/components/ExplosionEffect';

// Dynamically import the Model component
const Model = dynamic(() => import('../components/Model'), { ssr: false });
const PlayerV1 = dynamic(() => import('../components/Playerv1'), { ssr: false });

// Define props interface for Menu component
interface MenuProps {
  onFlyToClick: () => void;
}

// Menu component
function Menu({ onFlyToClick }: MenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  // State to track if the fly-to action has been triggered
  const [hasFlown, setHasFlown] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <button
        onClick={toggleMenu}
        style={{
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          cursor: 'pointer',
          borderRadius: '4px',
        }}
      >
        {isOpen ? 'Close Menu' : 'Open Menu'}
      </button>
      {isOpen && (
        <ul style={{ listStyle: 'none', padding: '10px 0', margin: 0 }}>
          <li
            style={{ padding: '5px 0', cursor: hasFlown ? 'default' : 'pointer' }}
            onClick={() => {
              if (hasFlown) return; // Don't re-trigger fly-to or add players
              onFlyToClick();
              setHasFlown(true);
            }}
          >
            {hasFlown ? 'Players are visible' : 'Fly to Position'}
          </li>
          <li
            style={{ padding: '5px 0', cursor: 'pointer' }}
            onClick={() => alert('Change model clicked!')}
          >
            Change Model
          </li>
          <li
            style={{ padding: '5px 0', cursor: 'pointer' }}
            onClick={() => alert('Toggle lighting clicked!')}
          >
            Toggle Lighting
          </li>
        </ul>
      )}
    </div>
  );
}

// Define props interface for CameraAnimator component
interface CameraAnimatorProps {
  targetPosition: [number, number, number] | null;
  lookAtTarget: [number, number, number];
  getTargetPosition: (width: number, height: number) => [number, number, number];
  getFov: (width: number, height: number) => number;
}

// Component to handle smooth camera animation (flies inward toward the scene)
function CameraAnimator({ targetPosition, lookAtTarget, getTargetPosition, getFov }: CameraAnimatorProps) {
  const { camera, size } = useThree();
  const currentPosition = useRef<THREE.Vector3>(camera.position.clone());

  useFrame(() => {
    if (targetPosition) {
      // Responsive: recalc position based on viewport for framing all players
      const [x, y, z] = getTargetPosition(size.width, size.height);
      const target = new THREE.Vector3(x, y, z);
      currentPosition.current.lerp(target, 0.025); // Smooth inward transition
      camera.position.copy(currentPosition.current);
      camera.lookAt(...lookAtTarget);

      // Responsive FOV: wider frame adapts to browser size
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = getFov(size.width, size.height);
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}

// Table and scene center
const TABLE_POSITION: [number, number, number] = [0, 3.15, 0];
const SCENE_CENTER: [number, number, number] = [0, 3.2, 0]; // Look at table/players area

// One player per table side: north, south, east, west (all face toward table center)
// Offset 1.4 keeps players clear of table (table is ~0.9 from center)
const PLAYER_POSITIONS: { position: [number, number, number]; rotation: [number, number, number] }[] = [
  { position: [0, 3.2, 1.4], rotation: [0, Math.PI / 2, 0] },    // North - rotated 90°
  { position: [0, 3.2, -1.4], rotation: [0, -Math.PI / 2, 0] },  // South - rotated 90°
  { position: [1.4, 3.2, 0], rotation: [0, Math.PI, 0] },        // East - rotated 90°
  { position: [-1.4, 3.2, 0], rotation: [0, 0, 0] },             // West - rotated 90°
];

// Memoized players group – prevents remount when explosions state updates
const PlayersAtTable = memo(function PlayersAtTable({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <>
      {PLAYER_POSITIONS.map(({ position, rotation }, i) => (
        <PlayerV1
          key={`player-${i}`}
          scale={0.15}
          position={position}
          rotation={rotation}
          isAnimating
        />
      ))}
    </>
  );
});

// Responsive camera: fits all 4 players, wider FOV on wide screens
const BASE_FOV = 75;
function getResponsiveFov(width: number, height: number): number {
  const aspect = width / height;
  return aspect > 1.5 ? 82 : aspect > 1 ? 78 : 75; // Wider frame on wide browsers
}
function getCameraTargetPosition(width: number, height: number): [number, number, number] {
  const aspect = width / height;
  const dist = aspect > 1.5 ? 3.2 : 3.5; // Wider screens: slightly closer; narrow: further back
  const elevation = aspect > 1 ? 2.2 : 2.5; // Tall screens: higher angle
  return [0, SCENE_CENTER[1] + elevation, dist];
}

type Explosion = { id: number; position: [number, number, number] };

export default function Page() {
  const [targetPosition, setTargetPosition] = useState<[number, number, number] | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const explosionIdRef = useRef(0);

  const handleTableClick = () => {
    const id = ++explosionIdRef.current;
    // Explosion at table center (slightly above table top)
    setExplosions((prev) => [...prev, { id, position: [TABLE_POSITION[0], TABLE_POSITION[1] + 0.45, TABLE_POSITION[2]] }]);
  };

  const removeExplosion = (id: number) => {
    setExplosions((prev) => prev.filter((e) => e.id !== id));
  };

  const handleFlyToClick = () => {
    setTargetPosition(SCENE_CENTER); // Triggers fly-to; actual position is responsive
    setShowPlayer(true);
  };

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Menu overlay */}
      <Menu onFlyToClick={handleFlyToClick} />
      {/* 3D Canvas */}
      <Canvas camera={{ position: [33, 26, 33], fov: BASE_FOV }}>
      {/* Camera animation handler - smooth fly-in, responsive framing */}
      <CameraAnimator
        targetPosition={targetPosition}
        lookAtTarget={SCENE_CENTER}
        getTargetPosition={getCameraTargetPosition}
        getFov={getResponsiveFov}
      />

      {/* Lys */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.2} castShadow />

      {/* Himmel */}
      <color attach="background" args={['#87ceeb']} /> {/* Lys blå himmel */}
      {/* ELLER: <Sky sunPosition={[0, 1, 0]} inclination={0.5} /> hvis du importerer fra drei */}

      {/* Fjellet */}
      <Mountain scale={150} position={[40, -282, 62]} />
      
      {/* Tempel på toppen av fjellet */}
      <Model scale={1} position={[0, 3, 0]} />

      {/* Bord i midten av strukturen */}
      <Table position={TABLE_POSITION} scale={1.2} onClick={handleTableClick} />

      {/* Fire spillere – render før eksplosjoner for stabil tre-struktur */}
      <PlayersAtTable show={showPlayer} />

      {/* Eksplosjonseffekter (stacker ved hver klikk) */}
      {explosions.map(({ id, position }) => (
        <ExplosionEffect
          key={id}
          position={position}
          onComplete={() => removeExplosion(id)}
        />
      ))}

      {/* Kontroller & miljø */}
      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={0.2}
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 2.1}
      />

      <Environment preset="sunset" />
    </Canvas>

    </div>
  );
}