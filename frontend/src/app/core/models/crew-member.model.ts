export interface CrewMemberListItem {
  id: number;
  email: string;
  role: string;
  licenseValidUntil: string | null;
  trainingValidUntil: string;
}

export interface CrewMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  weightKg: number;
  role: string;
  roleId: number;
  pilotLicenseNumber: string | null;
  licenseValidUntil: string | null;
  trainingValidUntil: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrewMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  weightKg: number;
  roleId: number;
  pilotLicenseNumber?: string;
  licenseValidUntil?: string;
  trainingValidUntil: string;
}
