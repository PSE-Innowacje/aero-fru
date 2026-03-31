export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  fieldErrors?: FieldError[];
  violations?: string[];
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
}
