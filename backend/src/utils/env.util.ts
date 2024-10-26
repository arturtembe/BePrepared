import { z } from "zod"

export const PORT = z.number().parse(Number(process.env.PORT) || 8080)
export const APP_ENV = z.string().parse(process.env.APP_ENV || 'dev');
export const SECRET = z.string().parse(process.env.SECRET)

// FIREBASE
export const API_KEY = z.string().parse(process.env.API_KEY) 
export const AUTH_DOMAIN = z.string().parse(process.env.AUTH_DOMAIN) 
export const PROJECT_ID = z.string().parse(process.env.PROJECT_ID) 
export const STORAGE_BUKET = z.string().parse(process.env.STORAGE_BUKET) 
export const MESSAGING_SENDER_ID = z.string().parse(process.env.MESSAGING_SENDER_ID) 
export const APP_ID = z.string().parse(process.env.APP_ID) 
export const MEASUREMENNT_ID = z.string().parse(process.env.MEASUREMENNT_ID) 

// TWILIO
export const ACCOUNT_SID = z.string().parse(process.env.ACCOUNT_SID);
export const AUTH_TOKEN = z.string().parse(process.env.AUTH_TOKEN);
export const PHONE_NUMBER = z.string().parse(process.env.PHONE_NUMBER);