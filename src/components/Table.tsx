'use client';

import { ThreeEvent } from '@react-three/fiber';

type Props = {
  position?: [number, number, number];
  scale?: number;
  onClick?: () => void;
};

function Table({ position = [0, 0, 0], scale = 1, onClick }: Props) {

  // Table dimensions (scaled) - square, lower legs for seated character
  const topSize = 1.5 * scale;
  const topWidth = topSize;
  const topDepth = topSize;
  const topHeight = 0.05 * scale;
  const legHeight = 0.32 * scale;
  const legThickness = 0.06 * scale;

  const handleClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      {/* Table top */}
      <mesh castShadow receiveShadow position={[0, legHeight + topHeight / 2, 0]}>
        <boxGeometry args={[topWidth, topHeight, topDepth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Legs */}
      <mesh castShadow receiveShadow position={[-topWidth / 2 + legThickness / 2, legHeight / 2, -topDepth / 2 + legThickness / 2]}>
        <boxGeometry args={[legThickness, legHeight, legThickness]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh castShadow receiveShadow position={[topWidth / 2 - legThickness / 2, legHeight / 2, -topDepth / 2 + legThickness / 2]}>
        <boxGeometry args={[legThickness, legHeight, legThickness]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh castShadow receiveShadow position={[-topWidth / 2 + legThickness / 2, legHeight / 2, topDepth / 2 - legThickness / 2]}>
        <boxGeometry args={[legThickness, legHeight, legThickness]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh castShadow receiveShadow position={[topWidth / 2 - legThickness / 2, legHeight / 2, topDepth / 2 - legThickness / 2]}>
        <boxGeometry args={[legThickness, legHeight, legThickness]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
}

export default Table;
