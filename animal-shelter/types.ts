import { ObjectId } from "mongodb";

export interface AnimalShelter {
    id : number;
    name : string;
    description : string;
    capacity : number;
    atCapacity : boolean;
    openingDate : string;
    photoURL : URL;
    welcomeAnimals : string[];
    healthStatus : string;
    contactPerson : ContactPerson;
}

export interface ContactPerson {
    id : number;
    name : string;
    position : string;
    email : string;
    phone : string;
}

export interface User {
    _id?: ObjectId;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
}

export interface FlashMessage {
    type: "error" | "success"
    message: string;
}