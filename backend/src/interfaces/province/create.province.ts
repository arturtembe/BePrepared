import { CreateDistrict } from "../district/create.district"

export interface Province {
    province: string,
    districts: string[]
}
export interface CreateProvince {
    designation: string,
    districts: CreateDistrict[]
}