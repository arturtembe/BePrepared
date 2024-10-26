import { CreateProvince, Province } from "../src/interfaces/province/create.province";
import { db } from "../src/prisma/client.prisma";
import * as bcrypt from 'bcrypt';

const provinces: CreateProvince[] = [
    {
        designation: 'Maputo Cidade',
        districts: [
            {
                designation: 'Kamavota'
            },
            {
                designation: 'Kamaxaquene'
            }
        ]
    }
]
async function seed(){

    const passwordHash = await bcrypt.hash(`12345678`, 10);
    
    return Promise.all(
        [
            ...provinces.map(async(prov)=>{
            
                await db.province.create({
                    data: {
                        designation: prov.designation,
                        districts: {
                            createMany: {
                                data: prov.districts
                            }
                        }
                    }
                })
        
            }),
            await db.admin.create({
                data: {
                    name: 'Administrador',
                    email: 'turazdev@gmail.com',
                    password: passwordHash
                }
            })
        ]

    )
}

seed().then(()=>{
    console.log('Seeds Created!');
})