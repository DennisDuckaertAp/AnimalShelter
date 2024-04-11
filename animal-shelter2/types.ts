export interface RootObject {
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
