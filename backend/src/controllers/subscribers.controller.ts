import { FastifyReply, FastifyRequest } from "fastify";
import { generateDigitsNumber } from "../utils/util";
import { db } from "../prisma/client.prisma";
import { z } from "zod";
import { redis } from "../redis/redis";
import { twilio, twilioConfig} from "../config/twilio.config";

export class SubscriberController {
    
    async create(request: FastifyRequest, reply: FastifyReply) {
    
        try {
            
            const subscriberSchema = z.object(
                {
                    phone: z.string().regex(/^8[2-7]\d{7}/), 
                    provinceId: z.string(), 
                    districtId: z.string()
                }
            );

            const { phone, provinceId, districtId } = subscriberSchema.parse(request.body);

            const saveUser = { phone, provinceId, districtId };

            const existPhone = await db.subscriber.findUnique({
                where: {
                    phone: saveUser.phone
                }
            })

            if(existPhone){
                return reply.status(401).send({ error: `Usuario ja existente!` });
                return;
            }

            const existDistrict = await db.district.findUnique({
                where: {
                    id: saveUser.districtId,
                    proviceId: saveUser.provinceId
                }
            })

            if(!existDistrict){
                return reply.status(401).send({ error: `Districto nao pertence esta provincia!` });
                return;
            }

            const otp = generateDigitsNumber();

            await redis.set(
                `otp_${otp}`,
                phone,
                60*3 //3 minintos
            )

            // SEND SMS
            
            const messages = await twilio.messages.create(
                twilioConfig(otp,phone)
            )

            // Created

            const saveSub = await db.subscriber.create({
                data: {
                    phone: saveUser.phone,
                    provinceId: saveUser.provinceId,
                    districtId: saveUser.districtId
                }
            })
    
            return reply.status(201).send({
                result: saveSub,
                message:messages,
                otp
            });
            
        } catch (error) {
            reply.status(500).send({
                message: 'Houve um erro interno!',
                error: error
            })
        }
    }

    async update(request: FastifyRequest, reply: FastifyReply) {
        
        try {
            
            const deviceId = z.string().parse(request.headers.authorization);

            const subscriberSchema = z.object(
                {
                    provinceId: z.string(), 
                    districtId: z.string()
                }
            );

            const { provinceId, districtId } = subscriberSchema.parse(request.body);

            const verifiedDevice = await db.subscriber.findUnique({
                where: {
                    deviceId,
                    verified: true
                }
            });

            if(!verifiedDevice){
                reply.status(401).send({ error: `Houve um erro de autenticacao!` })
                return;
            }

            // Verified District
            const existDistrict = await db.district.findUnique({
                where: {
                    id: districtId,
                    proviceId: provinceId
                }
            })

            if(!existDistrict){
                return reply.status(401).send({ error: `Districto nao pertence esta provincia!` });
            }

            // Update
            const updateDevice = await db.subscriber.update({
                data: {
                    districtId,
                    provinceId
                },
                where: {
                    deviceId,
                    verified: true
                }
            });

            reply.status(201).send({ deviceId, provinceId, districtId })

        } catch (error) {
            reply.status(501).send({ message: `Houve um erro interno`, error })
        }
    }

}