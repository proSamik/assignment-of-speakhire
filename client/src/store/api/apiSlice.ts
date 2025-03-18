/*
<aicontext>
This file contains the API slice for RTK Query.
</aicontext>
*/

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Base API slice for RTK Query
 * Sets up the base URL and endpoint structure
 */
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  }),
  tagTypes: ['Survey', 'Response'],
  endpoints: () => ({}),
}); 