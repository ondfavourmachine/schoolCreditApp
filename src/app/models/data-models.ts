export interface ParentRegistration {
  full_name?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  phone?: string;
  email?: string;
  lga?: string;
  state?: string;
  type?: "1" | "2";
}

export interface Parent extends ParentRegistration {
  picture: string | File;
  email: string;
  guardian: any;
  pin: any;
  OTP_sent: boolean;
  email_verified: 0 | 1
}

export interface ParentWorkInfo {
  employer: string;
  role: string;
  annual_salary: string | number;
}

export interface ParentAddressInfo {
  // address?:string,
  bus_stop: string;
  city: string;
  // state: string | number;
  // lga: string | number;
  post_code: string | number;
}
export interface ParentIdInfo {
  preferred_ID: any;
  BVN: string;
  ID_number: string;
}

export interface ParentAccountInfo {
  account_number: string;
  account_name: string;
  bank_code: string;
}

export interface ParentCreditCardInfo {
  cvv: string;
  card_number: string | number;
  card_name: string;
  expiry_month: string;
  expiry_year: string;
}

export interface CompleteParentInfomation
  extends Parent,
    ParentWorkInfo,
    ParentAddressInfo,
    ParentIdInfo,
    ParentAccountInfo,
    ParentCreditCardInfo {
  phone_verified: any;
  verification_type: any;
  children_count: string | number;
}

export interface AChild {
  guardian: string;
  full_name: string;
  class: string;
  tuition_fees: string;
  picture: File;
  index?: number;
  child_id: null | string | number;
}

export interface BankPartnership {}

export interface AccountDetails {}

export interface ParentRegistrationResponse {
  status: boolean;
  data: Partial<Parent>;
  guardian: any;
}

export interface Bank {
  id: string;
  bank_code: string;
  name: string;
}
