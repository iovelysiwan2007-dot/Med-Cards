import { MuscleAnatomy, MuscleRegionInfo } from '../types';
import { headMuscles } from './head';
import { neckMuscles } from './neck';
import { backMuscles } from './back';
import { thoraxMuscles } from './thorax';
import { abdomenMuscles } from './abdomen';
import { shoulderMuscles } from './shoulder';
import { armMuscles } from './arm';
import { forearmMuscles } from './forearm';
import { handMuscles } from './hand';
import { pelvisMuscles } from './pelvis';
import { thighMuscles } from './thigh';
import { legMuscles } from './leg';
import { footMuscles } from './foot';

// Export individual lists
export { headMuscles } from './head';
export { neckMuscles } from './neck';
export { backMuscles } from './back';
export { thoraxMuscles } from './thorax';
export { abdomenMuscles } from './abdomen';
export { shoulderMuscles } from './shoulder';
export { armMuscles } from './arm';
export { forearmMuscles } from './forearm';
export { handMuscles } from './hand';
export { pelvisMuscles } from './pelvis';
export { thighMuscles } from './thigh';
export { legMuscles } from './leg';
export { footMuscles } from './foot';

// Master list of all muscles
export const allMuscles: MuscleAnatomy[] = [
  ...headMuscles,
  ...neckMuscles,
  ...backMuscles,
  ...thoraxMuscles,
  ...abdomenMuscles,
  ...shoulderMuscles,
  ...armMuscles,
  ...forearmMuscles,
  ...handMuscles,
  ...pelvisMuscles,
  ...thighMuscles,
  ...legMuscles,
  ...footMuscles
];

// Helper to get count by region
export function getMuscleCountByRegion(regionCode: string): number {
  return allMuscles.filter(m => m.region === regionCode).length;
}

// Master region metadata matching the 13 required categories
export const anatomyRegions: MuscleRegionInfo[] = [
  {
    id: 'reg_head',
    name: 'Head & Cranium',
    regionCode: 'HEAD',
    description: 'Muscles of facial expression, mastication, extraocular movements, and the tongue.',
    muscleCount: getMuscleCountByRegion('HEAD'),
    icon: 'Brain'
  },
  {
    id: 'reg_neck',
    name: 'Neck & Cervical',
    regionCode: 'NECK',
    description: 'Sternocleidomastoid, suprahyoid, infrahyoid, and deep lateral scalene muscles.',
    muscleCount: getMuscleCountByRegion('NECK'),
    icon: 'Activity'
  },
  {
    id: 'reg_back',
    name: 'Back & Spine',
    regionCode: 'BACK',
    description: 'Superficial trapezius/latissimus, deep erector spinae, and suboccipital triangle.',
    muscleCount: getMuscleCountByRegion('BACK'),
    icon: 'Layers'
  },
  {
    id: 'reg_thorax',
    name: 'Thorax & Chest',
    regionCode: 'THORAX',
    description: 'Pectoral region, anterior chest wall, and scapulothoracic stabilizers like serratus anterior.',
    muscleCount: getMuscleCountByRegion('THORAX'),
    icon: 'Heart'
  },
  {
    id: 'reg_abdomen',
    name: 'Abdomen & Diaphragm',
    regionCode: 'ABDOMEN',
    description: 'Anterolateral wall, primary respiration drivers, and the pelvic floor diaphragm.',
    muscleCount: getMuscleCountByRegion('ABDOMEN'),
    icon: 'Wind'
  },
  {
    id: 'reg_shoulder',
    name: 'Shoulder & Rotator Cuff',
    regionCode: 'SHOULDER',
    description: 'Deltoid and the SITS rotator cuff stabilization complex.',
    muscleCount: getMuscleCountByRegion('SHOULDER'),
    icon: 'Shield'
  },
  {
    id: 'reg_arm',
    name: 'Arm (Humerus)',
    regionCode: 'ARM',
    description: 'Anterior flexors (biceps, brachialis) and posterior chief extensor (triceps).',
    muscleCount: getMuscleCountByRegion('ARM'),
    icon: 'Zap'
  },
  {
    id: 'reg_forearm',
    name: 'Forearm (Radius/Ulna)',
    regionCode: 'FOREARM',
    description: 'Anterior compartment wrist flexors and posterior extensor-pronator-supinator groups.',
    muscleCount: getMuscleCountByRegion('FOREARM'),
    icon: 'Scissors'
  },
  {
    id: 'reg_hand',
    name: 'Hand (Manus)',
    regionCode: 'HAND',
    description: 'Thenar, hypothenar, intrinsic lumbricals, and palmar/dorsal interossei.',
    muscleCount: getMuscleCountByRegion('HAND'),
    icon: 'Sparkles'
  },
  {
    id: 'reg_pelvis',
    name: 'Pelvis & Gluteals',
    regionCode: 'PELVIS',
    description: 'G-max/medius, piriformis syndrome zone, and deep lateral hip rotators.',
    muscleCount: getMuscleCountByRegion('PELVIS'),
    icon: 'User'
  },
  {
    id: 'reg_thigh',
    name: 'Thigh (Femur)',
    regionCode: 'THIGH',
    description: 'Anterior quadriceps, medial hybrid adductors, posterior hamstrings, and deep iliopsoas.',
    muscleCount: getMuscleCountByRegion('THIGH'),
    icon: 'Footprints'
  },
  {
    id: 'reg_leg',
    name: 'Leg (Crus)',
    regionCode: 'LEG',
    description: 'Anterior lifters, lateral everters, and posterior superficial calf/skeletal hearts.',
    muscleCount: getMuscleCountByRegion('LEG'),
    icon: 'Compass'
  },
  {
    id: 'reg_foot',
    name: 'Foot (Pes)',
    regionCode: 'FOOT',
    description: 'Intrinsic arch-supporting plantar layers and dorsal extensor groups.',
    muscleCount: getMuscleCountByRegion('FOOT'),
    icon: 'Star'
  }
];
