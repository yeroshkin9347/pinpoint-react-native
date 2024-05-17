import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CATEGORY_DATA,
  EMERGENCY_LOCATION,
  PROFILE,
  CARD_DATA,
  USER_LOCATION,
  PURCHASE_PLAN_DATA,
  MAPLOCATION,
  APPLINK_DATA,
} from '../Interface/interface';


interface SortLocation{
  data : any
}
interface AppInterface {
  profile: PROFILE;
  mapLocation: MAPLOCATION;
  cardData: CARD_DATA;
  purchasePlan: PURCHASE_PLAN_DATA;
  token: string;
  isLoading: boolean;
  unauthorized: boolean;
  rerenderToken: boolean;
  userContacts: Array<any>;
  emergencyUserContacts: Array<any>;
  TermsAndCondition: string;
  privacyPolicy: string;
  userGuide: string;
  fromSignUp: boolean;
  emergencyLocation: EMERGENCY_LOCATION;
  savedLocation: EMERGENCY_LOCATION;
  planList: Array<any>;
  categoryList: Array<any>;
  sentToMeList: Array<any>;
  categoryData: CATEGORY_DATA;
  cardLists: Array<any>;
  rerenderLocation: boolean;
  fromLocationrenderer: boolean;
  planId: number;
  userLocation: USER_LOCATION;
  changePlanList: Array<any>;
  changeSubscription: Array<any>;
  registeredUserList: Array<any>;
  fromLocationSave: boolean;
  changeSub: boolean;
  notificationList: Array<any>;
  requestLocation: Array<any>;
  categoryLocation: Array<any>;
  getLocations: Array<any>;
  mapLocationCondtion: boolean;
  updatetoaster: boolean;
  appLink: APPLINK_DATA;
  selectedScreenButton: string;
  emailOtp: string;
  countryCode: string;
  dailingCode: string;
  socialLogin: string;
  phoneContacts: Array<any>;
  sortLocation: SortLocation;
}

const PROFILE_FILE_DATA = {
  uri: '',
  type: '',
  name: '',
};

const initial_mapLocation = {
  address: '',
  latitude: '',
  longitude: '',
}

const initial_profile = {
  address: '',
  contact_no: '',
  created_on: '',
  date_of_birth: '',
  email: '',
  first_name: '',
  full_name: '',
  gender: '',
  id: 0,
  is_emergency: false,
  is_emergency_alert: '',
  is_free_trial: false,
  is_free_trial_valid: false,
  is_location_alert: 0,
  is_notification: '',
  is_profile_update: '',
  is_purchase: false,
  is_subscription_enable: '',
  language: '',
  last_name: '',
  latitude: '',
  location_share_by_me: false,
  location_share_time: '',
  location_type: '',
  longitude: '',
  remaining_days: 0,
  role_id: 0,
  state_id: 0,
  timezone: '',
  tos: '',
  type_id: '',
  location: '',
  profile_file: '',
  image_file: PROFILE_FILE_DATA,
  current_longitude : '',
  current_latitude : ''
};

export const initial_category_data = {
  title: '',
  created_by_id: 0,
  created_on: '',
  id: 0,
  location_count: 0,
  locations: [],
  pdf_link: '',
  csv_link: '',
  state_id: 0,
  type_id: '',
};

export const initial_Emergency_Location = {
  address: '',
  latitude: '',
  longitude: '',
  categoryId: 0,
  locationId: 0,
  pdfLink: '',
  csv_link: '',
  title: '',
};

export const initial_card_data = {
  cvc: '',
  card_number: '',
  expiry_date: '',
  customer_name: '',
};

export const initial_user_location = {
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  isoCountryCode: '',
  formattedAddress: '',
};

export const purchase_plan_data = {
  created_by_id: 0,
  created_on: "",
  description: "",
  id: 0,
  is_purchased: false,
  price: "",
  purchased_type: 0,
  state_id: 0,
  subscription_end: "",
  subscription_start: "",
  subscription_state: 0,
  title: "",
  type_id: 0,
}

export const AppLink_data = {
  address: '',
  latitude: '',
  longitude: '',
}

// const initial_card_data = {
//   address: '',
//   contact_no: '',
//   created_on: '',
//   date_of_birth: '',
//   email: '',
//   first_name: '',
//   full_name: '',
//   gender: '',
//   id: 0,
//   is_emergency: false,
//   is_emergency_alert: '',
//   is_free_trial: false,
//   is_free_trial_valid: false,
//   is_location_alert: '',
//   is_notification: '',
//   is_profile_update: '',
//   is_purchase: false,
//   is_subscription_enable: '',
//   language: '',
//   last_name: '',
//   latitude: '',
//   location_share_by_me: false,
//   location_share_time: '',
//   location_type: '',
//   longitude: '',
//   remaining_days: 0,
//   role_id: 0,
//   state_id: 0,
//   timezone: '',
//   tos: '',
//   type_id: '',
//   location: '',
// };

const initialState: AppInterface = {
  profile: { ...initial_profile },
  mapLocation: { ...initial_mapLocation },
  emergencyLocation: { ...initial_Emergency_Location },
  savedLocation: { ...initial_Emergency_Location },
  cardData: { ...initial_card_data },
  purchasePlan: { ...purchase_plan_data },
  token: '',
  isLoading: false,
  unauthorized: false,
  rerenderToken: false,
  userContacts: [],
  emergencyUserContacts: [],
  TermsAndCondition: '',
  privacyPolicy: '',
  userGuide: '',
  emailOtp: '',
  fromSignUp: false,
  planList: [],
  categoryData: initial_category_data,
  categoryList: [],
  sentToMeList: [],
  cardLists: [],
  rerenderLocation: false,
  fromLocationrenderer: false,
  userLocation: initial_user_location,
  fromLocationSave: false,
  planId: 0,
  changePlanList: [],
  changeSubscription: [],
  registeredUserList: [],
  changeSub: false,
  notificationList: [],
  requestLocation: [],
  categoryLocation: [],
  getLocations: [],
  mapLocationCondtion: false,
  updatetoaster: false,
  appLink: { ...AppLink_data },
  selectedScreenButton: 'My Lists',
  countryCode: "",
  dailingCode: "",
  socialLogin: "",
  phoneContacts: [],
  sortLocation : {
    data : {}
  }
};

const Application = createSlice({
  name: 'Application',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action: PayloadAction<Partial<PROFILE>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    settoaster: (state, action: PayloadAction<boolean>) => {
      state.updatetoaster = action.payload;
    },
    resetProfile: state => {
      state.profile = initial_profile
    },
    updateMapLocation: (state, action: PayloadAction<Partial<MAPLOCATION>>) => {
      state.mapLocation = { ...state.mapLocation, ...action.payload }
    },
    resetMapLocation: (state) => {
      state.mapLocation = initial_mapLocation;
    },
    userToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setrerenderApp: state => {
      state.rerenderToken = !state.rerenderToken;
    },
    setUserContact: (state, action: PayloadAction<Array<any>>) => {
      state.userContacts = action.payload;
    },
    setEmergencyUserContact: (state, action: PayloadAction<Array<any>>) => {
      state.emergencyUserContacts = action.payload;
    },
    updateEmergencyUserContact: (state, action: any) => {
      state.emergencyUserContacts = [
        ...state.emergencyUserContacts,
        action.payload,
      ];
    },
    removeEmergencyUserContact: (state, action: any) => {
      state.emergencyUserContacts = state.emergencyUserContacts.filter(
        item => item.contact_no == action.payload,
      );
    },
    setLagLong: (state, action: PayloadAction<Partial<PROFILE>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setTerms: (state, action: PayloadAction<string>) => {
      state.TermsAndCondition = action.payload;
    },
    setPolicy: (state, action: PayloadAction<string>) => {
      state.privacyPolicy = action.payload;
    },
    setUserGuide: (state, action: PayloadAction<string>) => {
      state.userGuide = action.payload;
    },
    setFromUser: (state, action: PayloadAction<boolean>) => {
      state.fromSignUp = action.payload;
    },
    updateEmergencyLocation: (
      state,
      action: PayloadAction<Partial<EMERGENCY_LOCATION>>,
    ) => {
      state.emergencyLocation = { ...state.emergencyLocation, ...action.payload };
    },
    updateSavedLocation: (
      state,
      action: PayloadAction<Partial<EMERGENCY_LOCATION>>,
    ) => {
      state.savedLocation = { ...state.savedLocation, ...action.payload };
    },
    resetSavedLocation: state => {
      state.savedLocation = initial_Emergency_Location;
    },
    setPlanList: (state, action: any) => {
      state.planList = action.payload;
    },
    updateCategory: (state, action: PayloadAction<Partial<CATEGORY_DATA>>) => {
      state.categoryData = { ...state.categoryData, ...action.payload };
    },
    addCategoryList: (state, action: any) => {
      state.categoryList = action.payload;
    },
    addSentToMeList: (state, action: any) => {
      state.sentToMeList = action.payload;
    },
    setCardData: (state, action: PayloadAction<Partial<CARD_DATA>>) => {
      state.cardData = { ...state.cardData, ...action.payload };
    },
    setCardLists: (state, action: any) => {
      state.cardLists = action.payload;
    },
    setreRerenderLocation: (state, action: PayloadAction<boolean>) => {
      state.rerenderLocation = action.payload;
    },
    setFromLocationrenderer: (state, action: PayloadAction<boolean>) => {
      state.fromLocationrenderer = action.payload;
    },
    setUserLocation: (state, action: PayloadAction<Partial<USER_LOCATION>>) => {
      state.userLocation = { ...state.userLocation, ...action.payload };
    },
    setPlanListId: (state, action: PayloadAction<number>) => {
      state.planId = action.payload;
    },
    setLocationSave: (state, action: PayloadAction<boolean>) => {
      state.fromLocationSave = action.payload;
    },
    setPurchasePlan: (state, action: any) => {
      state.purchasePlan = action.payload;
    },
    setChangePlan: (state, action: any) => {
      state.changePlanList = action.payload;
    },
    setRegisteredUserList: (state, action: any) => {
      state.registeredUserList = action.payload;
    },
    setChangeSubscription: (state, action: PayloadAction<Array<any>>) => {
      state.changeSubscription = action.payload;
    },
    setChangeSub: (state, action: PayloadAction<boolean>) => {
      state.changeSub = action.payload;
    },
    setNotificationList: (state, action: any) => {
      state.notificationList = action.payload;
    },
    setRequestLocation: (state, action: any) => {
      state.requestLocation = action.payload;
    },
    setCategoryLocation: (state, action: any) => {
      state.categoryLocation = action.payload;
    },
    getsharedLocations: (state, action: any) => {
      state.getLocations = action.payload;
    },
    setSelectedScreenButton: (state, action: PayloadAction<string>) => {
      state.selectedScreenButton = action.payload;
    },
    updateMapLocationCondtion: (state, action: PayloadAction<boolean>) => {
      state.mapLocationCondtion = action.payload;
    },
    setAppLinkUrl: (state, action: PayloadAction<Partial<APPLINK_DATA>>) => {
      state.appLink = { ...state.appLink, ...action.payload };
    },
    resetApplink: (state) => {
      state.appLink = AppLink_data;
    },
    setEmailOtp: (state, action: PayloadAction<string>) => {
      state.emailOtp = action.payload;
    },
    setCountryCode: (state, action: PayloadAction<string>) => {
      state.countryCode = action.payload;
    },
    setDialingCode: (state, action: PayloadAction<string>) => {
      state.dailingCode = action.payload;
    },
    setSocialLogin: (state, action: PayloadAction<string>) => {
      state.socialLogin = action.payload;
    },
    setPhoneContact: (state, action: PayloadAction<Array<any>>) => {
      state.phoneContacts = action.payload;
    },
    setSortLocation: (state, action: any) => {
      state.sortLocation = action.payload;
    },
    resetAppState: (state) => {
      state.sentToMeList = [];
      state.categoryList = [];
      state.rerenderToken = !state.rerenderToken;
      state.token = '';
      // state.fromSignUp = false;
      // state.profile = initial_profile;
      state.isLoading = false;
      state.unauthorized = true;
    },
  }
});

export const {
  setProfile,
  updateProfile,
  updateMapLocation,
  resetMapLocation,
  updateMapLocationCondtion,
  userToken,
  setLoading,
  setrerenderApp,
  setUserContact,
  setEmergencyUserContact,
  setLagLong,
  updateEmergencyUserContact,
  removeEmergencyUserContact,
  setTerms,
  setPolicy,
  setUserGuide,
  setFromUser,
  updateEmergencyLocation,
  setPlanList,
  updateCategory,
  addCategoryList,
  updateSavedLocation,
  setCardData,
  setCardLists,
  setreRerenderLocation,
  resetSavedLocation,
  setUserLocation,
  setFromLocationrenderer,
  setPlanListId,
  setLocationSave,
  setPurchasePlan,
  setChangePlan,
  setRegisteredUserList,
  setChangeSubscription,
  setChangeSub,
  resetProfile,
  setNotificationList,
  setRequestLocation,
  setCategoryLocation,
  getsharedLocations,
  addSentToMeList,
  settoaster,
  setAppLinkUrl,
  resetApplink,
  setSelectedScreenButton,
  setEmailOtp,
  setCountryCode,
  setDialingCode,
  setSocialLogin,
  setPhoneContact,
  resetAppState,
  setSortLocation
} = Application.actions;
export default Application.reducer;
