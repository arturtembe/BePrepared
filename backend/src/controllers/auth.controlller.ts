import { FastifyReply, FastifyRequest } from "fastify";
import { number, string, z } from "zod";
import { redis } from "../redis/redis";
import { db } from "../prisma/client.prisma";
import { generateDigitsNumber } from "../utils/util";
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authConfig from "../config/auth.config";

export class AuthController {
    
    async authOtp(request: FastifyRequest, reply: FastifyReply) {
        
        const authSchemma = z.object(
            {
                otp: number(),
                deviceId: string()
            }
        )

        const { otp, deviceId } = authSchemma.parse(request.body);

        // GET PHONE
        const phone = await redis.get(`otp_${otp}`)
        
        if(!phone){
            return reply.status(401).send({ error: `Otp invalido!` });
            return;
        }

        const subscriber = await db.subscriber.update({
            data: {
                deviceId,
                verified: true
            },
            where: {
                phone
            },
            include: {
                province: true,
                district: true
            }
        });

        // DELETE OTP
        await redis.delete(`otp_${otp}`)

        reply.status(200).send(subscriber);
    }

    async loginSubscriber(request: FastifyRequest, reply: FastifyReply){
        
        const subscriberSchema = z.object(
            {
                phone: z.string().regex(/^8[2-7]\d{7}/)
            }
        );

        const { phone } = subscriberSchema.parse(request.body);

        const existPhone = await db.subscriber.findUnique({
            where: {
                phone
            }
        })

        if(!existPhone){
            return reply.status(401).send({ error: `Usuario nao encontrado!` });
            return;
        }

        // VERIFICA ACTIVACAO DA CONTA
        /*
        const verifiedSubscriber = await db.subscriber.findUnique({
            where: {
                phone,
                verified: true
            }
        })

        if(!verifiedSubscriber){
            
            //return reply.status(401).send({ error: `A sua conta se encontra inactiva!` });
            return;
        }
        */
        
        const otp = generateDigitsNumber();

        await redis.set(
            `otp_${otp}`,
            phone,
            60*3 //3 minintos
        )

        return reply.status(201).send({
            result: existPhone,
            otp: otp
        });

    }

    async loginAdmin(request: FastifyRequest, reply: FastifyReply) {
        try{
            const adminSchema = z.object({
                email: z.string().email(),
                password: z.string()
            });

            const { email, password } = adminSchema.parse(request.body);

            // Authetication
            
            const existEmail = await db.admin.findFirst({
                where: {
                    email
                }
            })

            if(!existEmail){
                return reply.status(401).send({ error: `Email ou password invalido!` });
            }

            // Verificar Password
            if(!await bcrypt.compare(password, existEmail.password)){
                return reply.status(401).send({ error: `Email ou password invalido!` });
            }

            const token = jwt.sign({ id: existEmail.id }, 
                                authConfig.secret,
                                authConfig.expiresIn
                            );

            return reply.status(200).send({
                token,
                admin: {
                    ...existEmail,
                    password: undefined
                }
            })

        } catch (error) {
            return reply.status(501).send({message:`Houve um erro interno!`, error });
        }
    }

}