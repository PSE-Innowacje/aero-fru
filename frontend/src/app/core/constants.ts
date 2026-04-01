export const ROLES = {
  ADMIN: 'Administrator',
  PLANNER: 'Osoba planująca',
  SUPERVISOR: 'Osoba nadzorująca',
  PILOT: 'Pilot'
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

export const OPERATION_STATUSES = {
  INTRODUCED: 1,
  REJECTED: 2,
  CONFIRMED: 3,
  PLANNED_FOR_ORDER: 4,
  PARTIALLY_COMPLETED: 5,
  COMPLETED: 6,
  RESIGNED: 7
} as const;

export const FLIGHT_ORDER_STATUSES = {
  INTRODUCED: 1,
  SUBMITTED_FOR_APPROVAL: 2,
  REJECTED: 3,
  ACCEPTED: 4,
  PARTIALLY_COMPLETED: 5,
  FULLY_COMPLETED: 6,
  NOT_COMPLETED: 7
} as const;
