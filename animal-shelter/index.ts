import readline from 'readline-sync';

import { RootObject, ContactPerson } from "./types";

(async function () {
    try {
        let choice : number;

        const response = await fetch('https://raw.githubusercontent.com/DennisDuckaertAp/AnimalShelterData/main/animalShelter.json');
        
        if (response.status === 404) throw new Error('Not found');
        if (response.status === 500) throw new Error('Internal server error');

        const json : RootObject[] = await response.json();

        do {
            console.log("---------------------------------------------------");
            console.log("| Welcome to the Animal Shelter Management System |");
            console.log("---------------------------------------------------");
            console.log();
            const choiceMenu : string[] = ["View all data", "Filter by ID", "Exit"]
    
            for (let i = 0; i < choiceMenu.length; i++) {
                console.log(`${i+1} ${choiceMenu[i]}`);
            }
            console.log()

            choice  = readline.questionInt("Please enter your choice: ");

            if (isNaN(choice) || choice < 1 || choice > choiceMenu.length) {
                console.log(`Invalid choice. Please enter a number between 1 and ${choiceMenu.length}`);
            }
            else if (choice === 1) {
                for (let i = 0; i < json.length; i++) {
                    console.log(`- ${json[i].name} (${json[i].id})`);
                    
                }
                
            }
            else if (choice === 2) {

            let choiceId : number = readline.questionInt("Please enter the ID you want to filter by: ")

                for (let i = 0; i < json.length; i++) {
                    if (json[i].id === choiceId) {
                        console.log(json[i]);
                    }

                }
            }

        } while (choice !== 3);
        
    } catch (error: any) {
        console.log(error);
    }
})();

export {}

