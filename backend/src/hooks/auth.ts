import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { z } from "zod";
import authConfig from "../config/auth.config";

export function authHook(request: FastifyRequest, reply: FastifyReply, done: (error?: FastifyError) => void) {
    
    const [,token] = z.string().parse(request.headers.authorization).split(' ');

    try {

        const JwtPayload = jwt.verify(token,authConfig.secret);

        if(!JwtPayload){
            console.log(`Houve um erro ao verificar`);
            return;
        }
        console.log(JwtPayload);
        
        done();
    } catch (error) {
        return reply.status(401).send({messsage: `Houve um erro na autheticacao`, error})
    }
}