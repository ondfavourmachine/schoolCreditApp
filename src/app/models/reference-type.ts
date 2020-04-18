export interface Reference {
  bio?: UserBio;
  nok?: NextOfKin;
  address?: UserAddress;
  work?: UserWorkDetails;
  income?: UserIncomeDetails;
  selfie?: string;
}

export interface UserBio {
  mobile_number: string;
  gender: string;
  state_of_origin: {id: string, value: string};
  marital_status: {id: string, value: string};
  dependents: string;
}

export interface NextOfKin {
  name_of_nok: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface UserAddress {
  house_address: string;
  state: {id: string, value: string};
  LGA: {id: string, value: string};
  status: {id: string, value: string};
  years_occupied: string;
}

export interface UserWorkDetails {
  occupation: {id: string, value: string};
  work_sector: {id: string, value: string};
  company_name: string;
  company_address: string;
  rank: string;
}

export interface UserIncomeDetails {
  net: string;
  monthly_spending: string;
}
