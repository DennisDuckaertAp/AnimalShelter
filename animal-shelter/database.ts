import { Collection, MongoClient } from "mongodb";
import { AnimalShelter, ContactPerson } from "./types";


const uri = "mongodb+srv://duckaert:duckaert@webontwikkeling.canwgkr.mongodb.net/";
const client = new MongoClient(uri);

const collectionShelter : Collection<AnimalShelter> = client.db("project").collection<AnimalShelter>("shelters");
const collectionContactPerson : Collection<ContactPerson> = client.db("project").collection<ContactPerson>("persons");

export async function getShelters() {
    return await collectionShelter.find({}).toArray();
}

export async function getFilteredShelters(filter : string, sortField : string, sortDirection : string) {
    // await collectionShelter.createIndex({ name: "text" });
    const sort : -1 | 1 = sortDirection === 'desc' ? -1 : 1 ;
    const query = filter ? { $text: { $search: filter } } : {};

    return await collectionShelter.find(query).sort({[sortField]: sort}).toArray();
}

export async function getContactPerson() {
    return await collectionContactPerson.find({}).toArray();
}

export async function loadSheltersFromApi() {
    const shelters : AnimalShelter[] = await getShelters();
    if (shelters.length == 0) {
        console.log("Database is empty, loading shelters from API")
        const response = await fetch("https://raw.githubusercontent.com/DennisDuckaertAp/AnimalShelterData/main/animalShelter.json");
        const shelters : AnimalShelter[] = await response.json();
        await collectionShelter.insertMany(shelters);
    }
}
export async function loadContactPersonsFromApi() {
    const contactPersons : ContactPerson[] = await getContactPerson();
    if (contactPersons.length == 0) {
        console.log("Database is empty, loading contact persons from API")
        const response = await fetch("https://raw.githubusercontent.com/DennisDuckaertAp/AnimalShelterData/main/contactPerson.json");
        const contactPersons : ContactPerson[] = await response.json();
        await collectionContactPerson.insertMany(contactPersons);
    }
}

export async function connect() {
    try {
        await client.connect();
        await loadSheltersFromApi()
        await loadContactPersonsFromApi()
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error("An error occurred while connecting to the database:", error);
    }
}

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error("An error occurred while disconnecting from the database:", error);
    }
    process.exit(0);
}

export async function updateShelterData(shelterId : number, updatedData : AnimalShelter) {
    try {
        await collectionShelter.updateOne(
            { id: shelterId },
            { $set: updatedData }
        );
        return true;
    } catch (error) {
        console.error("Error updating shelter data:", error);
        return false;
    }
}

export async function getContactPersonById(id: number) {
    try {
        const contactPerson: ContactPerson[] = await collectionContactPerson.find({ id: id }).toArray();

        if (contactPerson.length === 0) {
            throw new Error(`ContactPerson with ID ${id} not found`);
        }

        return contactPerson;
    } catch (error) {
        throw new Error(`Error fetching contact person: ${error}`);
    }
}
