import { environment } from "../../environments/environment";
import { User } from './user.model';

const base_url = environment.base_url;

export class Calendario{

    constructor(
        public user: User,
        public start: Date,
        public end: Date,
        public _id?: string,
        public calid?: string,
        public title?: string,
        public color?: string,
        public resizable?:any[],
        public actions?:any[],
        public draggable?:boolean,
        public status?:boolean
    ){}

}