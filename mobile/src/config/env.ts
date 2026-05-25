const DEV_API_BASE_URL = 'http://localhost:8081';
const PROD_API_BASE_URL = 'https://raspberrypi.tailf9603e.ts.net:8443';

export const API_BASE_URL = __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL;
