// store.js
import { configureStore } from '@reduxjs/toolkit';
import formReducer from './formSlice';

const store = configureStore({
  reducer: {
    forms: formReducer,
    // ... other reducers ...
  },
});

export default store;
