export interface HelicopterListItem {
  id: number;
  registrationNumber: string;
  helicopterType: string;
  status: string;
}

export interface Helicopter {
  id: number;
  registrationNumber: string;
  helicopterType: string;
  description: string | null;
  maxCrewMembers: number;
  maxCrewWeightKg: number;
  status: string;
  inspectionValidUntil: string | null;
  rangeKm: number;
  createdAt: string;
  updatedAt: string;
}

export interface HelicopterRequest {
  registrationNumber: string;
  helicopterType: string;
  description?: string;
  maxCrewMembers: number;
  maxCrewWeightKg: number;
  status: string;
  inspectionValidUntil?: string;
  rangeKm: number;
}
