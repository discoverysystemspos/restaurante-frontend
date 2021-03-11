interface _producto{
    _id: string
    name?: string,
};

export class Kit {

    constructor(
        public qty: number,
        public product: _producto,
        public _id?: string
    ){}

}