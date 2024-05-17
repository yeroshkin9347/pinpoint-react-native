export interface CARD_DATA {
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
    is_location_alert: string | null;
    is_notification: string | null;
    is_profile_update: string | null;
    is_purchase: boolean;
    is_subscription_enable: string | null;
    language: string | null;
    last_name: string | null;
    latitude: string | null;
    location_share_by_me: boolean;
    location_share_time: string | null;
    location_type: string | null;
    longitude: string | null;
    remaining_days: number;
    role_id: number;
    state_id: number;
    timezone: string | null;
    tos: string | null;
    type_id: string | null;
    location: string | null; // not return in api responce on sign_up
  }