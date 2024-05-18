// Fetch contact person data
async function fetchContactPersonData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/DennisDuckaertAp/AnimalShelterData/main/contactPerson.json');
        const contactPersonJson = await response.json();
        return contactPersonJson;
    } catch (error) {
        console.error('Error fetching data:', error);
        alert(error);
        return null;
    }
}

// declarations
let modals = document.getElementsByClassName("Modal");
let buttons = document.getElementsByClassName("ModalTrigger");
let spans = document.getElementsByClassName("ModalClose");

// modal open sequence
async function openModal(index) {
    const contactPersonJson = await fetchContactPersonData();
    if (!contactPersonJson) return;

    // get correct index to populate modal
    const modalTrigger = document.querySelector(`.ModalTrigger[data-index="${index}"]`);
    const paragraph = modalTrigger.querySelector('p');
    const dataIndex = paragraph.textContent;

    populateModal(dataIndex-1, contactPersonJson);

    modals[0].style.display = "block";
}

// populate modal
function populateModal(index, contactPersonJson) {
    const modalContent = document.querySelector('.ModalContent');
    modalContent.innerHTML = `
        <section>
            <h2>Id:</h2>
            <p>${contactPersonJson[index].id}</p>
        </section>
        <section>
            <h2>Name:</h2>
            <p>${contactPersonJson[index].name}</p>
        </section>
        <section>
            <h2>Position:</h2>
            <p>${contactPersonJson[index].position}</p>
        </section>
        <section>
            <h2>Email:</h2>
            <p>${contactPersonJson[index].email}</p>
        </section>
        <section>
            <h2>Phone:</h2>
            <p>${contactPersonJson[index].phone}</p>
        </section>`;
}

// modal close sequence
function closeModal(index) {
    modals[index].style.display = "none";
}

// click event for opening modal
for (let i = 0; i < buttons.length; i++) {
    buttons[i].onclick = function(e) {
        e.preventDefault();
        openModal(i);
    };
}

// click event for closing modal (dark background)
window.onclick = function(event) {
    for (let i = 0; i < modals.length; i++) {
        if (event.target == modals[i]) {
            closeModal(i);
        }
    }
};

// Registration and Login switcher
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    switchToRegister.addEventListener('click', function (event) {
        event.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    switchToLogin.addEventListener('click', function (event) {
        event.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
});       