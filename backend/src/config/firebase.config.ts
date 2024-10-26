import { API_KEY, APP_ID, AUTH_DOMAIN, 
        MEASUREMENNT_ID, 
        MESSAGING_SENDER_ID, 
        PROJECT_ID, 
        STORAGE_BUKET} from "../utils/env.util";

const firebaseConfig = {
    apiKey: API_KEY,
    authDomain: AUTH_DOMAIN,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUKET,
    messagingSenderId: MESSAGING_SENDER_ID,
    appId: APP_ID,
    measurementId: MEASUREMENNT_ID
}

export default firebaseConfig;