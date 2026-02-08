// Shared 3D scene layout for home and lobby
export const TABLE_POSITION: [number, number, number] = [0, 3.15, 0];
export const SCENE_CENTER: [number, number, number] = [0, 3.2, 0];

export const PLAYER_POSITIONS: { position: [number, number, number]; rotation: [number, number, number] }[] = [
  { position: [0, 3.2, 1.4], rotation: [0, Math.PI / 2, 0] },     // North
  { position: [0, 3.2, -1.4], rotation: [0, -Math.PI / 2, 0] },  // South
  { position: [1.4, 3.2, 0], rotation: [0, Math.PI, 0] },       // East
  { position: [-1.4, 3.2, 0], rotation: [0, 0, 0] },            // West
];

// Position "in front of" each seat (further from table) for choice labels
export const CHOICE_LABEL_OFFSET = 0.6;
export const PLAYER_FRONT_POSITIONS: [number, number, number][] = [
  [0, 3.2, 1.4 + CHOICE_LABEL_OFFSET],   // North
  [0, 3.2, -1.4 - CHOICE_LABEL_OFFSET],  // South
  [1.4 + CHOICE_LABEL_OFFSET, 3.2, 0],  // East
  [-1.4 - CHOICE_LABEL_OFFSET, 3.2, 0], // West
];

export const BASE_FOV = 75;
export function getResponsiveFov(width: number, height: number): number {
  const aspect = width / height;
  return aspect > 1.5 ? 82 : aspect > 1 ? 78 : 75;
}
export function getCameraTargetPosition(width: number, height: number): [number, number, number] {
  const aspect = width / height;
  const dist = aspect > 1.5 ? 3.2 : 3.5;
  const elevation = aspect > 1 ? 2.2 : 2.5;
  return [0, SCENE_CENTER[1] + elevation, dist];
}
