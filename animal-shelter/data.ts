import { AnimalShelter } from "./types";

export let animalShelterJson : AnimalShelter[];

let getData = async() => {
    try {
        const response = await fetch('https://raw.githubusercontent.com/DennisDuckaertAp/AnimalShelterData/main/animalShelter.json');
        
        if (response.status === 404) throw new Error('Not found');
        if (response.status === 500) throw new Error('Internal server error');

        animalShelterJson = await response.json();
    }
    catch (e) {
        alert('Er is een fout opgetreden bij het laden van de gegevens. Probeer het later opnieuw.');
        console.error(e);
    }
};

getData();