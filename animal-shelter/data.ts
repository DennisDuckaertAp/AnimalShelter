import { AnimalShelter, ContactPerson } from "./types";

export let animalShelterJson: AnimalShelter[];
export let contactPersonJson: ContactPerson[];

let getData = async () => {
    try {
        const animalShelterResponse = await fetch('https://raw.githubusercontent.com/DennisDuckaertAp/AnimalShelterData/main/animalShelter.json');
        if (!animalShelterResponse.ok) {
            throw new Error(`Animal Shelter data fetch failed with status: ${animalShelterResponse.status}`);
        }
        animalShelterJson = await animalShelterResponse.json();

        const contactPersonResponse = await fetch('https://raw.githubusercontent.com/DennisDuckaertAp/AnimalShelterData/main/contactPerson.json');
        if (!contactPersonResponse.ok) {
            throw new Error(`Contact Person data fetch failed with status: ${contactPersonResponse.status}`);
        }
        contactPersonJson = await contactPersonResponse.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        alert(error);
    }
};

getData();
