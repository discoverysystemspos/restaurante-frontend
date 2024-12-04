import { Car } from "./cars.model";
import { User } from "./user.model";

export class Parqueo{

    constructor(
        public car: Car,
        public invoice: number,
        public placa: string,
        public checkin: number,
        public checkout: number,
        public total: number,
        public user: User,
        public estado: string,
        public status: boolean,
        public fecha: Date,
        public subtotal?: number,
        public plenas?: number,
        public iva?: number,
        public parqid?: string,
        public _id?: string,
    ){}

}