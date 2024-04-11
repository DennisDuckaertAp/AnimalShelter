import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import {animalShelterJson} from "./data"
import { AnimalShelter } from "./types";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
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

app.get("/animalshelter", (req, res) => {
    const selectedShelterIndex = parseInt(typeof req.query.selectedShelter === 'string' ? req.query.selectedShelter : "0")

    const selectedShelter = animalShelterJson[selectedShelterIndex]

    res.render("animalShelter", {
        title: "Animal Shelter Details",
        animalShelterJson : animalShelterJson,
        selectedShelter : selectedShelter,
        selectedShelterIndex : selectedShelterIndex
    })
})

app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost:" + app.get('port'));
});