import { createClient, RedisClientType } from "redis";
export class Redis {

    #client!: RedisClientType;
    constructor(){
        createClient()
        .on('error', (error)=> {
            console.log(`Redis Client error`,error)
            throw new Error(error)
        })
        .connect()
        .then((client)=>{
            this.#client = client;
            console.log(`Sucessfully connected to redis!`);
        });
    }

    async set(key: string, value: string | number, duration: number){
        await this.#client.set(key,value,{
            EX: duration
        })
    }

    async get(key: string){
        return await this.#client.get(key);
        //const value =
    }

    async delete(key: string){
        await this.#client.del(key);
    }
}

export const redis = new Redis();