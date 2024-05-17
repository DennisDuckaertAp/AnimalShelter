import { Collection, MongoClient } from "mongodb";
import { AnimalShelter, ContactPerson, User } from "./types";
import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";

const saltRounds : number = 10;

export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const client = new MongoClient(MONGODB_URI);

const collectionShelter : Collection<AnimalShelter> = client.db("project").collection<AnimalShelter>("shelters");
const collectionContactPerson : Collection<ContactPerson> = client.db("project").collection<ContactPerson>("persons");
export const userCollection = client.db("project").collection<User>("users");

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
        await createInitialUsers()
        await client.connect();
        await loadSheltersFromApi()
        await loadContactPersonsFromApi()
        console.log("Connected to database");
        process.on("SIGINT", exit);
    } catch (error) {
        console.error("An error occurred while connecting to the database:", error);
    }
}

async function createInitialUsers() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let emailAdmin : string | undefined = process.env.ADMIN_EMAIL;
    let passwordAdmin : string | undefined = process.env.ADMIN_PASSWORD;
    let emailUser : string | undefined = process.env.USER_EMAIL;
    let passwordUser : string | undefined = process.env.USER_PASSWORD;
    if (emailAdmin === undefined || passwordAdmin === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    if (emailUser === undefined || passwordUser === undefined) {
        throw new Error("USER_EMAIL and USER_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        email: emailAdmin,
        password: await bcrypt.hash(passwordAdmin, saltRounds),
        role: "ADMIN"
    });
    await userCollection.insertOne({
        email: emailUser,
        password: await bcrypt.hash(passwordUser , saltRounds),
        role: "USER"
    });
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
