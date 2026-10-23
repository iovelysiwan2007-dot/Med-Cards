export interface MuscleAnatomy {
  id: string;
  muscleName: string;
  alternateName?: string;
  region: 'HEAD' | 'NECK' | 'BACK' | 'THORAX' | 'ABDOMEN' | 'SHOULDER' | 'ARM' | 'FOREARM' | 'HAND' | 'PELVIS' | 'THIGH' | 'LEG' | 'FOOT';
  subRegion: string;
  compartment?: string;
  muscleGroup?: string;
  origin: string;
  insertion: string;
  innervation: string;
  nerve: string;
  rootValue: string;
  primaryAction: string;
  secondaryActions: string[];
  bloodSupply: string;
  anatomicalRelations?: string;
  clinicalImportance: string;
  physiotherapyRelevance: string;
  palpationInformation?: string;
  commonInjuries?: string;
  commonConditions?: string;
  functionalRole?: string;
  mnemonic?: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard' | 'BPT Viva';
  examImportance: 'High' | 'Medium' | 'Low';
}

export interface MuscleRegionInfo {
  id: string;
  name: string;
  regionCode: 'HEAD' | 'NECK' | 'BACK' | 'THORAX' | 'ABDOMEN' | 'SHOULDER' | 'ARM' | 'FOREARM' | 'HAND' | 'PELVIS' | 'THIGH' | 'LEG' | 'FOOT';
  description: string;
  muscleCount: number;
  icon: string;
}
