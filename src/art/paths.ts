/** Design V1 画像パス（public/art） */
export const ART = {
  emblem: '/art/motor-lab-emblem.png',
  garageBackground: '/art/motor-lab-garage-background.webp',
  garageBay: '/art/garage-bay.webp',
  displayPlatform: '/art/vehicle-display-platform.png',
  showroomSpotlight: '/art/showroom-spotlight.png',
  genericBlueprint: '/art/generic-car-blueprint.png',
  completeRays: '/art/car-complete-rays.png',
  hanamaruReward: '/art/hanamaru-reward.png',
} as const;

export type BlueprintSegment = 'front' | 'middle' | 'rear';

export const BLUEPRINT_SEGMENTS: BlueprintSegment[] = ['front', 'middle', 'rear'];

export function blueprintSegmentAt(index: number): BlueprintSegment {
  return BLUEPRINT_SEGMENTS[Math.min(Math.max(index, 0), 2)] ?? 'middle';
}
