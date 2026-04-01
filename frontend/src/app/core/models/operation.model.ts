export interface OperationListItem {
  id: number;
  operationNumber: number;
  orderProjectNumber: string;
  activityTypes: string[];
  proposedDateEarliest: string | null;
  proposedDateLatest: string | null;
  plannedDateEarliest: string | null;
  plannedDateLatest: string | null;
  status: string;
  statusId: number;
}

export interface Operation {
  id: number;
  operationNumber: number;
  orderProjectNumber: string;
  shortDescription: string;
  routeKm: number;
  proposedDateEarliest: string | null;
  proposedDateLatest: string | null;
  plannedDateEarliest: string | null;
  plannedDateLatest: string | null;
  activityTypes: ActivityTypeItem[];
  additionalInfo: string | null;
  contactPersons: ContactPerson[];
  postRealizationNotes: string | null;
  status: string;
  statusId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  linkedFlightOrders: LinkedFlightOrder[];
}

export interface ActivityTypeItem {
  id: number;
  name: string;
}

export interface ContactPerson {
  id: number;
  email: string;
}

export interface Comment {
  id: number;
  commentText: string;
  createdBy: string;
  createdAt: string;
}

export interface ChangeHistoryEntry {
  id: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string;
}

export interface LinkedFlightOrder {
  id: number;
  flightOrderNumber: number;
  status: string;
}

export interface OperationCreateRequest {
  orderProjectNumber: string;
  shortDescription: string;
  proposedDateEarliest?: string;
  proposedDateLatest?: string;
  activityTypeIds: number[];
  additionalInfo?: string;
  contactPersonEmails?: string[];
}

export interface OperationUpdateRequest {
  orderProjectNumber: string;
  shortDescription: string;
  proposedDateEarliest?: string;
  proposedDateLatest?: string;
  plannedDateEarliest?: string;
  plannedDateLatest?: string;
  activityTypeIds: number[];
  additionalInfo?: string;
  contactPersonEmails?: string[];
  postRealizationNotes?: string;
}

export interface StatusChangeRequest {
  statusId: number;
}

export interface CommentRequest {
  commentText: string;
}
