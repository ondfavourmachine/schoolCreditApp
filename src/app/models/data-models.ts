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
  school_id?: number;
}

export interface Parent extends ParentRegistration {
  picture: string | File;
  email: string;
  guardian: any;
  pin: any;
  OTP_sent: boolean;
  email_verified: 0 | 1,
  loan_request: null | number;

}

export interface LoanRequest{creditclan_request_id:null | number, eligible: boolean}

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
  id?: any;
  child_id: null | string | number;
  child_book: Array<SchoolBook>;
  total_cost_of_books: number;
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

export interface ContinuingExistingRequestResponse {
  creditclan_request_id: any,
  data: {
    token: string;
    guardian_data: Partial<CompleteParentInfomation>;
    guardian: number;
    children: Array<Partial<AChild>>;
  };
  payment_type: null | 1 | 2
  loan_request: null | number,
  stages: schoolCreditStage
  status: boolean;
}

export interface schoolCreditStage{

    child_data: 0 | 1,
    parent_data: 0 | 1,
    email_validated: 1,
    phone_verified: 0 | 1,
    widget_card: 0 | 1,
    widget_cashflow: 0 | 1,
    widget_data: 0 | 1
 
}

export interface Offers{
  amount: number,
  duration: number,
  lender: string,
  rate: string
}

export interface SchoolDetailsModel{
  address: string
  created_at: string,
email: string
id: number
licensed: number,
bank_code: number,
classes: Array<SchoolClass>
name: string
nursery: number
payment_link: null | string
phone: string
picture: null | string
primary: string
secondary: string
students_range: string
username: string
}

export interface SchoolClass{
  id: string,
  name: string
}

export interface SchoolBookStructure {
  books_count: number;
  books: Array<SchoolBook>
}

export interface SchoolBook{
book_id: number
created_at: string
deleted: number
id: number
link: string
name: string
picture: string
price: string
publisher_id: number
publisher_price: string
school_id: number
updated_at: string
}
