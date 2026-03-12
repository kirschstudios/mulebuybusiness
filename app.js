import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// !!! PUNE AICI DATELE TALE FIREBASE !!!
const firebaseConfig = {
  apiKey: "AIzaSyDC9WX355FRT66_Yc2wjbz6VdyEyhh_ctE",
  authDomain: "mulebuy-business.firebaseapp.com",
  projectId: "mulebuy-business",
  storageBucket: "mulebuy-business.firebasestorage.app",
  messagingSenderId: "845883728677",
  appId: "1:845883728677:web:c2f8abb1728f96ef49f0cc",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const friends = ["Lukas", "Alex", "Adelin", "Cristi"];

function createMoneyRain() {
    const bg = document.getElementById('money-bg');
    const moneySymbols = ['💵', '💶', '💰', '💸'];
    for (let i = 0; i < 30; i++) {
        let money = document.createElement('div');
        money.classList.add('money-icon');
        money.innerText = moneySymbols[Math.floor(Math.random() * moneySymbols.length)];
        money.style.left = `${Math.random() * 100}vw`;
        money.style.animationDuration = `${Math.random() * 5 + 5}s`;
        money.style.animationDelay = `${Math.random() * 5}s`;
        bg.appendChild(money);
    }
}
createMoneyRain();

// Funcția care randează totul: Nume, Rând de adăugare și Tabelul
function renderTablesSetup() {
    const container = document.getElementById('tables-container');
    container.innerHTML = '';

    friends.forEach(friend => {
        container.innerHTML += `
            <div class="person-section" id="section-${friend}">
                <div class="person-header">
                    <h2>${friend}</h2>
                    <div class="person-stats">
                        <div class="total-price"><span id="total-${friend}">0.00</span> RON</div>
                        <div class="total-weight">Greutate: <span id="weight-${friend}">0</span> g</div>
                    </div>
                </div>

                <form class="person-add-form" id="form-${friend}" onsubmit="addItem(event, '${friend}')">
                    <input type="text" id="name-${friend}" placeholder="Nume produs" required>
                    <input type="text" id="model-${friend}" placeholder="Model" required>
                    <input type="text" id="size-${friend}" placeholder="Mărime" required>
                    <input type="number" id="price-${friend}" placeholder="Preț" step="0.01" required>
                    <input type="number" id="weight-${friend}" placeholder="Grame" required>
                    <input type="url" id="link-${friend}" placeholder="Link" required>
                    <button type="submit" class="btn-submit-small">+ Adaugă la ${friend}</button>
                </form>

                <table>
                    <thead>
                        <tr>
                            <th>Produs</th>
                            <th>Model</th>
                            <th>Mărime</th>
                            <th>Preț</th>
                            <th>Greutate</th>
                            <th>Link</th>
                            <th>Acțiune</th>
                        </tr>
                    </thead>
                    <tbody id="tbody-${friend}">
                        </tbody>
                </table>
            </div>
        `;
    });
}
renderTablesSetup();

// Funcție globală pentru a putea fi apelată din formularele generate dinamic
window.addItem = async function(event, person) {
    event.preventDefault(); // Oprește reîncărcarea paginii

    // Luăm valorile din inputurile care au ID-ul legat de numele persoanei
    const newItem = {
        person: person,
        name: document.getElementById(`name-${person}`).value,
        model: document.getElementById(`model-${person}`).value,
        size: document.getElementById(`size-${person}`).value,
        price: parseFloat(document.getElementById(`price-${person}`).value),
        weight: parseInt(document.getElementById(`weight-${person}`).value),
        link: document.getElementById(`link-${person}`).value
    };

    try {
        await addDoc(collection(db, "orders"), newItem);
        document.getElementById(`form-${person}`).reset(); // Golește doar inputurile persoanei curente
    } catch (error) {
        console.error("Eroare la adăugare: ", error);
        alert("Eroare la adăugare. Verifică consola.");
    }
};

window.deleteItem = async function(id) {
    if(confirm("Ești sigur că vrei să ștergi acest produs?")) {
        await deleteDoc(doc(db, "orders", id));
    }
}

// Citim datele din Firebase
onSnapshot(collection(db, "orders"), (snapshot) => {
    let totals = { Lukas: 0, Alex: 0, Adelin: 0, Cristi: 0 };
    let weights = { Lukas: 0, Alex: 0, Adelin: 0, Cristi: 0 };
    let tableContents = { Lukas: "", Alex: "", Adelin: "", Cristi: "" };
    
    let grandTotalPrice = 0;
    let grandTotalWeight = 0;

    snapshot.forEach((doc) => {
        const item = doc.data();
        const id = doc.id;
        
        if(friends.includes(item.person)) {
            let itemWeight = item.weight || 0;
            
            totals[item.person] += item.price;
            weights[item.person] += itemWeight;
            
            grandTotalPrice += item.price;
            grandTotalWeight += itemWeight;

            tableContents[item.person] += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.model}</td>
                    <td>${item.size}</td>
                    <td>${item.price.toFixed(2)} RON</td>
                    <td>${itemWeight} g</td>
                    <td><a href="${item.link}" target="_blank" class="btn-link">Cumpără</a></td>
                    <td><button onclick="deleteItem('${id}')" class="btn-delete">Șterge</button></td>
                </tr>
            `;
        }
    });

    friends.forEach(friend => {
        document.getElementById(`tbody-${friend}`).innerHTML = tableContents[friend];
        document.getElementById(`total-${friend}`).innerText = totals[friend].toFixed(2);
        document.getElementById(`weight-${friend}`).innerText = weights[friend];
    });

    // Actualizare Total Global (Panou Dreapta)
    document.getElementById('grand-total-price').innerText = grandTotalPrice.toFixed(2) + " RON";
    document.getElementById('grand-total-weight').innerText = grandTotalWeight + " g";
    document.getElementById('kg-estimate').innerText = `(${(grandTotalWeight / 1000).toFixed(2)} kg)`;
});