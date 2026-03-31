export interface LandingSite {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface LandingSiteRequest {
  name: string;
  latitude: number;
  longitude: number;
}
