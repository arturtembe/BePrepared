import Twilio from 'twilio';
import { ACCOUNT_SID, AUTH_TOKEN, PHONE_NUMBER } from '../utils/env.util';

export const twilio = Twilio(ACCOUNT_SID, AUTH_TOKEN);

export const twilioConfig = (otp:number,phone:string)=>{
    return {
        body: `Use esse codigo para confirmar o seu numero: ${otp}`,
        from: PHONE_NUMBER,
        to: `+258${phone}`
    }
};