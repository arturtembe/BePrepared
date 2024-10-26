
import "dotenv/config";

import fastify from 'fastify';
//import { generateDigitsNumber } from './utils/util';
import { router } from './routers/index.router';

import formbody from '@fastify/formbody';
//import multipart from '@fastify/multipart';
import './redis/redis';

// Firebase
import admin,{ initializeApp } from 'firebase-admin/app';
import firebaseConfig from './config/firebase.config';
import { PORT } from "./utils/env.util";

//const serviceAccount:string = String(process.env.GOOGLE_APPLICATION_CREDENTIALS);

const firebaseApp = initializeApp(firebaseConfig);
/*
admin.initializeApp({
    ...firebaseConfig,
    credential: admin.credential.cert(serviceAccount) 
});
*/


const server = fastify({
    logger: true
})

// Urleconded and Multipart
server.register(formbody);
//server.register(multipart);

// Router
server.register(router);

server.listen({ port: PORT }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})  