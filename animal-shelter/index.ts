import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import { AnimalShelter, ContactPerson, User } from "./types";
import { addNewUser, connect, getContactPerson, getContactPersonById, getFilteredShelters, getShelters, login, updateShelterData } from "./database";
import { title } from "process";
import session from "./session";
import { secureMiddleware } from "./secureMiddleware";
import { flashMiddleware } from "./flashMiddleware";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session);
app.use(flashMiddleware);

app.set('views', path.join(__dirname, "views"));

app.set("port", process.env.PORT || 3000);

app.get("/", secureMiddleware, async (req, res) => {

    const q = typeof req.query.q === 'string' ? req.query.q : "";
    const sortField = typeof req.query.sortField === "string" ? req.query.sortField : "id";
    let sortDirection = typeof req.query.sortDirection === "string" ? req.query.sortDirection : "asc";

    let sortedAnimalShelters = await getFilteredShelters(q, sortField, sortDirection);
    res.render("index", {
        title: "Compassionate Animal Shelter Management System",
        animalShelterJson : sortedAnimalShelters,
        q : q,
        sortDirection : sortDirection,
        sortField :  sortField
    })
});

app.get("/animalshelter/:id", secureMiddleware, async (req, res) => {
    let animalShelterJson : AnimalShelter[] = await getShelters();

    const selectedShelterIndex = parseInt(req.params.id)

    if (isNaN(selectedShelterIndex) || selectedShelterIndex < 1 || selectedShelterIndex > animalShelterJson.length) {
        return res.status(404).render("404", { title: "404 - Page Not Found" });
    }
    const selectedShelter = animalShelterJson[selectedShelterIndex-1]

    res.render("animalShelter", {
        title: "Animal Shelter Details",
        animalShelterJson : animalShelterJson,
        selectedShelter : selectedShelter,
        selectedShelterIndex : selectedShelterIndex
    })
})

app.get("/contactpersons", secureMiddleware, async (req, res) => {
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

app.get("/editshelter/:id", secureMiddleware, async (req, res) => {
    let animalShelterJson : AnimalShelter[] = await getShelters();

    const selectedShelterIndex = parseInt(req.params.id)

    if (isNaN(selectedShelterIndex) || selectedShelterIndex < 1 || selectedShelterIndex > animalShelterJson.length) {
        return res.status(404).render("404", { title: "404 - Page Not Found" });
    }

    const selectedShelter = animalShelterJson[selectedShelterIndex-1]

    if (req.session.user?.role !== "ADMIN") {
        res.redirect('/')
    }
    else {
        res.render("editShelter", {
            title: "Animal Shelter Details",
            selectedShelter : selectedShelter
        })
    }
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

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect('/')
    }
    else {
        res.render("login", {
            title: "Login",
            user: req.session.user
        });
    }
});

app.post("/login", async(req, res) => {
    const email : string = req.body.email;
    const password : string = req.body.password;
    try {
        let user : User = await login(email, password);
        delete user.password; 
        req.session.user = user;
        req.session.message = {type: "success", message: "Login successful"};
        res.redirect("/");
    } catch (e : any) {
        req.session.message = {type: "error", message: e.message};
        res.redirect("/login");
    }
});

app.post("/logout", async(req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.post("/register", async(req, res) => {
    const email : string = req.body.registerEmail;
    const password : string = req.body.registerPassword;
    try {
        await addNewUser(email, password)
        req.session.message = {type: "success", message: "User Registration Successful"};
        res.redirect("/login");
    } catch (e : any) {
        req.session.message = {type: "error", message: e.message};
        res.redirect("/login");
    }
});

app.use((req, res) => {
    res.status(404).render("404", { 
        title: "404 - Page Not Found",
        user: req.session.user
    });
});

app.listen(app.get("port"), async() => {
    try {
        await connect();
        console.log("Server started on http://localhost:" + app.get('port'));
    } catch (e) {
        console.log(e);
        process.exit(1); 
    }
});