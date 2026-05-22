const DEV_API_BASE_URL = 'http://localhost:6006';
const PROD_API_BASE_URL = 'http://raspberrypi.tailf9603e.ts.net:8081';

export const API_BASE_URL = __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL;
