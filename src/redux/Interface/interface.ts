export interface PROFILE_FILE {
  uri: string;
  type: string;
  name: string;
}

export interface PURCHASE_PLAN_DATA {
  created_by_id: number;
  created_on: string;
  description: string;
  id: number;
  is_purchased: boolean;
  price: string;
  purchased_type: number;
  state_id: number;
  subscription_end: string;
  subscription_start: string;
  subscription_state: number;
  title: string;
  type_id: number;
}

export interface PROFILE {
  address: string | null;
  contact_no: string | null;
  created_on: string | null;
  date_of_birth: string | null;
  email: string | null;
  first_name: string | null;
  full_name: string | null;
  gender: string | null;
  id: number;
  is_emergency: boolean;
  is_emergency_alert: string | null;
  is_free_trial: boolean;
  is_free_trial_valid: boolean;
  is_location_alert: number | null;
  is_notification: string | null;
  is_profile_update: string | null;
  is_purchase: boolean;
  is_subscription_enable: string | null;
  language: string | null ;
  last_name: string | null;
  latitude: string | null | number;
  current_latitude: string | null | number;
  location_share_by_me: boolean;
  location_share_time: string | null;
  location_type: string | null;
  longitude: string | null | number;
  current_longitude: string | null | number;
  remaining_days: number;
  role_id: number;
  state_id: number;
  timezone: string | null;
  tos: string | null;
  type_id: string | null;
  location: string | null; // not return in api responce on sign_up
  profile_file: any;
  image_file?: any;
}

export interface ERROR_TOAST {
  toast: any;
  id: string | null;
  errorMessage: any;
  placement?: string | null;
}

export interface EMERGENCY_LOCATION {
  address: string | null;
  latitude: string | null | number;
  longitude: string | null | number ;
  categoryId?: number | null;
  locationId?: number | null;
  pdfLink?: string | null;
  csv_link?: string | null;
  title?: string | null;
}

export interface CATEGORY_DATA {
  title: string | null;
  created_by_id: number;
  created_on: string | null;
  id: number;
  location_count: number;
  locations: Array<any>;
  pdf_link: string;
  csv_link: string;
  state_id: number;
  type_id: string | null;
}

export interface ACCORDIAN_DATA {
  title: string | null;
  content: any;
}

export interface CARD_DATA {
  cvc: string | null;
  card_number: string | null;
  expiry_date: string | null;
  customer_name: string | null;
}

export interface USER_LOCATION {
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isoCountryCode: string | null;
  formattedAddress: string | null;
}

export interface MAPLOCATION {
  address: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface APPLINK_DATA {
  address: string | null;
  latitude: string | null;
  longitude: string | null;
}
