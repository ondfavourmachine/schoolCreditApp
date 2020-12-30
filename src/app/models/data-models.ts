export interface ParentRegistration {
  full_name?: string;
  age?: string;
  gender?: string;
  address?: string;
  phone?: string;
  type?: "1" | "2";
}

export interface Parent extends ParentRegistration {
  picture: string | File;
  email: string;
  guardian: any;
  pin: any;
  OTP_sent: boolean;
}

export interface AChild {
  guardian: string
  full_name: string
  class: string
  tuition_fees: string
  picture: File
  index?: number,
  child_id: null | string | number
}

export interface BankPartnership {}

export interface AccountDetails {}

export interface ParentRegistrationResponse {
  status: boolean;
  data: Partial<Parent>;
  guardian: any;
}
