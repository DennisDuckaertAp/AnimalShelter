import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { AnimalShelter, ContactPerson } from "./types";
import { connect, getContactPerson, getContactPersonById, getShelters, updateShelterData } from "./database";
import { contactPersonJson } from "./data";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

app.get("/", async (req, res) => {
    let animalShelterJson : AnimalShelter[] = await getShelters();
    
    const q = typeof req.query.q === 'string' ? req.query.q : "";
 
    let filteredAnimalShelters : AnimalShelter[] = [...animalShelterJson];
    filteredAnimalShelters = filteredAnimalShelters.filter(shelter => shelter.name.toLowerCase().includes(q.toLowerCase()))

    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "id";
    let sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

    let sortedAnimalShelters = [...filteredAnimalShelters].sort((a, b) => {
        if (sortField === "name") {
            return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        } else if (sortField === "id") {
            return sortDirection === "asc" ? a.id - b.id : b.id - a.id;
        } else if (sortField === "capacity") {
            return sortDirection === "asc" ? a.capacity - b.capacity : b.capacity - a.capacity;
        } else {
            return 0;
        }
    });

    res.render("index", {
        title: "Compassionate Animal Shelter Management System",
        animalShelterJson : sortedAnimalShelters,
        q : q,
        sortDirection : sortDirection,
        sortField :  sortField
    })
});

app.get("/animalshelter/:id", async (req, res) => {
    let animalShelterJson : AnimalShelter[] = await getShelters();

    const selectedShelterIndex = parseInt(req.params.id)

    // if
    console.log(selectedShelterIndex)

    const selectedShelter = animalShelterJson[selectedShelterIndex-1]

    res.render("animalShelter", {
        title: "Animal Shelter Details",
        animalShelterJson : animalShelterJson,
        selectedShelter : selectedShelter,
        selectedShelterIndex : selectedShelterIndex
    })
})

app.get("/contactpersons", async (req, res) => {
    let contactPersonJson : ContactPerson[]= await getContactPerson();

    const q : number = parseInt(typeof req.query.q === 'string' ? req.query.q : "");

    let filteredContactPersons : ContactPerson[] = [...contactPersonJson];
    filteredContactPersons = filteredContactPersons.filter(person => person.id === q);

    if (!isNaN(q)) {
        filteredContactPersons = contactPersonJson.filter(person => person.id === q);
    } else {
        filteredContactPersons = [...contactPersonJson];
    }

    res.render("contactPersons", {
        title: "Contact Person Details",
        contactPersonJson : contactPersonJson,
        filteredContactPersons : filteredContactPersons
    })
})

app.get("/editshelter/:id", async (req, res) => {
    let animalShelterJson : AnimalShelter[] = await getShelters();

    const selectedShelterIndex = parseInt(req.params.id)

    const selectedShelter = animalShelterJson[selectedShelterIndex-1]
    res.render("editShelter", {
        title: "Animal Shelter Details",
        selectedShelter : selectedShelter
    })
})

app.post('/editshelter/:id', async (req, res) => {
    let shelterId : number = parseInt(req.params.id)
    let contactPersonId : number = parseInt(req.body.contactPersonId)
    const contactPerson : ContactPerson[] = await getContactPersonById(contactPersonId)
    const atCapacity = req.body.atCapacity === 'on';

    const formData: AnimalShelter = {
        id: shelterId,
        name: req.body.name,
        description: req.body.description,
        capacity: parseInt(req.body.capacity),
        atCapacity: atCapacity,
        openingDate: req.body.openingDate,
        photoURL: req.body.photoURL,
        welcomeAnimals: req.body.welcomeAnimals.split(',').map((item: string) => item.trim()), 
        healthStatus: req.body.healthStatus,
        contactPerson: contactPerson[0]
        }

        await updateShelterData(shelterId, formData)

        res.redirect(`/animalshelter/${shelterId}`)
})

app.listen(app.get("port"), async () => {
    await connect();
    console.log("Server started on http://localhost:" + app.get('port'));
});