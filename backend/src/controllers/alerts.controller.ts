import { FastifyReply, FastifyRequest } from "fastify";
import { string, z } from "zod";
import { db } from "../prisma/client.prisma";
import { getMessaging } from 'firebase-admin/messaging';
import dayjs from 'dayjs';

export class AlertsController {

    async create(request: FastifyRequest, reply: FastifyReply) {
        try{

            const alertSchemma = z.object({
                title: string(),
                message: string(),
                districtId: string(),
                provinceId: string()
            });

            const { title, message, 
                districtId, provinceId } = alertSchemma.parse(request.body);

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

            // Create

            const alert = await db.alert.create({
                data: {
                    title,
                    message,
                    provinceId,
                    districtId
                },
                select: {
                    id: true,
                    title: true,
                    message: true,
                    provinceId: true,
                    districtId: true
                }
            })

            // Send Messagem
            
            //GET DEVICE
            const subscriberDeviceID = await db.subscriber.findMany({
                select: { deviceId:true },
                where: { districtId: { not: "" }, verified: true }
            }) 

            const registrationTokens = subscriberDeviceID.map(subscribers=> String(subscribers.deviceId))
            
            const alertNotification = {
                data: alert,
                tokens: registrationTokens,
            };
            
            await getMessaging().sendMulticast(alertNotification)
            .then((response) => {
                console.log(response.successCount + ' messages were sent successfully');
            }).catch(error=>{
                return reply.status(502).send({ 
                    message: `Houve um erro ao alertar!`,
                    error
                })
            });

            return reply.status(200).send(existDistrict)
        
        } catch (error) {
            return reply.status(501).send({messsage: `Houve um erro interno`, error})
        }
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        try {

            const QuerySchemma = z.object({
                provinceId: z.string().optional(),
                districtId: z.string().optional(),
                page: z.number().optional()
            })

            const { provinceId, districtId, page=0 } = QuerySchemma.parse(request.query)
            
            let tk = 5
            let skp = page*tk;

            const alert = await db.alert.findMany({
                where: {
                    provinceId,
                    districtId,
                    createAt: {
                        gte: dayjs().subtract(28, 'days').format() //Last 28 days 
                    }
                },
                include: {
                    province: true,
                    district: true
                },
                skip: skp,
                take: tk,
                orderBy: {
                    createAt: 'desc'
                }
            }) 

            return reply.status(200).send(alert)

        } catch (error) {
            return reply.status(501).send({messsage: `Houve um erro interno`, error})
        }
    }
}