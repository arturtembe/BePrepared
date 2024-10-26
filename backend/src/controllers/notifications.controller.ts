import { FastifyReply, FastifyRequest } from "fastify";
import { string, z } from "zod";
import { db } from "../prisma/client.prisma";

export class NotificationController {

    async create(request: FastifyRequest, reply: FastifyReply){
        try {

            const deviceId = z.string().parse(request.headers.authorization);
            const messageSchemma = z.object({
                message: string()
            });

            const { message } = messageSchemma.parse(request.body);

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

            // Created
            const notification = await db.notification.create({
                data: {
                    message,
                    subscriberId: verifiedDevice.id
                }
            });

            reply.status(201).send(notification)

        } catch (error) {
            reply.status(501).send({messsage: `Houve um erro interno`, error})
        }
    }

    async show(request: FastifyRequest, reply: FastifyReply) {
        try {
            
            const deviceId = z.string().parse(request.headers.authorization);

            const phoneSchemma = z.object({
                phone: string()
            });

            const { phone } = phoneSchemma.parse(request.params);

            // Verify Phone
            const verifiedPhone = await db.subscriber.findUnique({
                where: {
                    phone,
                    deviceId,
                    verified: true
                }
            });

            if(!verifiedPhone){
                reply.status(401).send({ error: `Houve um erro de autenticacao!` })
                return;
            }

            // GET Notification
            const notification = await db.notification.findMany({
                where: {
                    subscriberId: verifiedPhone.id
                },
                include: {
                    subscriber: true
                }
            });

            reply.status(200).send(notification)

        } catch (error) {
            reply.status(501).send({message:`Houve um erro interno!`, error });
        }
    }

}