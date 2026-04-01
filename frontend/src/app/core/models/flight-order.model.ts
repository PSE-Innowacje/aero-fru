export interface FlightOrderListItem {
  id: number;
  flightOrderNumber: number;
  plannedStartAt: string;
  helicopter: string;
  pilot: string;
  status: string;
  statusId: number;
}

export interface FlightOrder {
  id: number;
  flightOrderNumber: number;
  plannedStartAt: string;
  plannedLandingAt: string;
  actualStartAt: string | null;
  actualLandingAt: string | null;
  pilot: CrewMemberSummary;
  helicopter: HelicopterSummary;
  crewMembers: CrewMemberSummary[];
  crewWeightKg: number;
  startLandingSite: LandingSiteSummary;
  endLandingSite: LandingSiteSummary;
  operations: OperationSummary[];
  estimatedRouteKm: number;
  status: string;
  statusId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CrewMemberSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  weightKg: number;
  role: string;
  pilotLicenseNumber?: string;
  licenseValidUntil?: string;
  trainingValidUntil: string;
}

export interface HelicopterSummary {
  id: number;
  registrationNumber: string;
  helicopterType: string;
  maxCrewMembers: number;
  maxCrewWeightKg: number;
  rangeKm: number;
  inspectionValidUntil: string | null;
}

export interface LandingSiteSummary {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface OperationSummary {
  id: number;
  operationNumber: number;
  orderProjectNumber: string;
  shortDescription: string;
  routeKm: number;
  status: string;
  statusId: number;
}

export interface FlightOrderCreateRequest {
  plannedStartAt: string;
  plannedLandingAt: string;
  pilotId: number;
  helicopterId: number;
  crewMemberIds: number[];
  startLandingSiteId: number;
  endLandingSiteId: number;
  operationIds: number[];
  estimatedRouteKm: number;
}

export interface FlightOrderUpdateRequest {
  plannedStartAt: string;
  plannedLandingAt: string;
  pilotId: number;
  helicopterId: number;
  crewMemberIds: number[];
  startLandingSiteId: number;
  endLandingSiteId: number;
  operationIds: number[];
  estimatedRouteKm: number;
  actualStartAt?: string;
  actualLandingAt?: string;
}

export interface FlightOrderStatusChangeRequest {
  statusId: number;
}
