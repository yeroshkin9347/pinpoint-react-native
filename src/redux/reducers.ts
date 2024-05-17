import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';

const rootReducer = combineReducers({
   AuthReducer: authReducer
  // Add your reducers here
});

export default rootReducer;