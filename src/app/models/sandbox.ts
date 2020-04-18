export interface SandBoxDataModel {
  sectors?: Array<{ id: string; value: string }>;
  banks?: Array<{ id: string; value: string }>;
  marital_statuses?: Array<{ id: string; value: string }>;
  occupations?: Array<{ id: string; value: string }>;
  designations?: Array<{ id: string; value: string }>;
  types_of_residence?: Array<{ id: string; value: string }>;
  states?: Array<{ id: string; value: string }>;
  lgas: Array<{ id: string; value: string }>;
}
