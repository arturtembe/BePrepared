import { FastifyInstance } from "fastify";
import { SubscriberController } from "../controllers/subscribers.controller";
import { AuthController } from "../controllers/auth.controlller";
import { NotificationController } from "../controllers/notifications.controller";
import { AlertsController } from "../controllers/alerts.controller";
import { authHook } from "../hooks/auth";

const alertsController = new AlertsController();
const subscriberController =  new SubscriberController();
const authController =  new AuthController();
const notificationController =  new NotificationController();

export async function router(server: FastifyInstance){
    
    server.get('/', async (request, reply) => {
        reply.status(200).send('pong\n Artur Jaime')
        //return 'pong\n';
    })
    
    server.post('/alerts', { preHandler: authHook }, (request, reply) => alertsController.create(request, reply));
    server.get('/alerts', (request, reply) => alertsController.list(request, reply))
    
    server.post('/subscribers', (request, reply) => subscriberController.create(request, reply));
    server.post('/subscribers/update', (request, reply) => subscriberController.update(request, reply));
    
    server.post('/auth/subscribers/otp', (request, reply) => authController.authOtp(request, reply))
    server.post('/auth/subscribers', (request, reply) => authController.loginSubscriber(request, reply))
    server.post('/auth/admin', (request, reply) => authController.loginAdmin(request, reply))

    server.post('/notifications', (request, reply) => notificationController.create(request, reply))
    server.get('/notifications/:phone', (request, reply) => notificationController.show(request, reply))

}