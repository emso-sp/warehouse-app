export type ProductDTO = {
    id: number;
    name: string;
    quantity: number;
    price: number
}

export type ProductCreateDTO = {
    name: string;
    quantity: number;
    price: number
}