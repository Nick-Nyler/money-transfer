const dev = process.env.NODE_ENV === "development";
export const API_URL = dev
  ? process.env.REACT_APP_API_URL   // from .env.development
  : process.env.REACT_APP_API_URL;  // from .env.production
