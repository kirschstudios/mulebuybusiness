import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// Generăm structura tabelelor
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

                <button class="btn-submit-small" onclick="openModal('${friend}')">+ Adaugă produs</button>

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

// --- LOGICA PENTRU POP-UP (MODAL) ---

window.openModal = function(person) {
    // Setăm numele persoanei în titlu și în input-ul ascuns
    document.getElementById('modal-title').innerText = `Adaugă la ${person}`;
    document.getElementById('modal-person').value = person;
    // Afișăm panoul
    document.getElementById('add-modal').classList.add('active');
}

window.closeModal = function() {
    // Ascundem panoul și golim formularul
    document.getElementById('add-modal').classList.remove('active');
    document.getElementById('modal-form').reset();
}

window.submitModalForm = async function(event) {
    event.preventDefault(); // Oprește refresh-ul

    // Luăm datele din pop-up
    const newItem = {
        person: document.getElementById('modal-person').value,
        name: document.getElementById('modal-name').value,
        model: document.getElementById('modal-model').value,
        size: document.getElementById('modal-size').value,
        price: parseFloat(document.getElementById('modal-price').value),
        weight: parseInt(document.getElementById('modal-weight').value),
        link: document.getElementById('modal-link').value
    };

    try {
        await addDoc(collection(db, "orders"), newItem);
        closeModal(); // Închide panoul automat după ce a adăugat produsul
    } catch (error) {
        console.error("Eroare la adăugare: ", error);
        alert("Eroare la adăugare. Verifică consola.");
    }
}

// ------------------------------------

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