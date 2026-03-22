import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 1. Config
const firebaseConfig = {
    apiKey: "AIzaSyDTK-81zZqtCro7PDndoQkVF8HLdSXJloU",
    authDomain: "norfolkevents-9d623.firebaseapp.com",
    projectId: "norfolkevents-9d623",
    storageBucket: "norfolkevents-9d623.firebasestorage.app",
    messagingSenderId: "4382585808",
    appId: "1:4382585808:web:8b848b054950742671bfd5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const defaultImages = {
    food: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?q=80&w=600&h=400&auto=format&fit=crop",
    music: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
    thrift: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&h=400&auto=format&fit=crop",
    nightlife: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=600&h=400&auto=format&fit=crop",
    crafts: "https://images.pexels.com/photos/159644/art-supplies-brushes-rulers-scissors-159644.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
    community: "https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
    social: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?q=80&w=600&h=400&auto=format&fit=crop"
};

// 2. DOM Elements
const container = document.getElementById('events-container');
const starredContainer = document.getElementById('starred-container');

// 3. Logic Functions
function getUpcomingEvents(events) {
    const today = new Date(); // Grabs the user's current local date
    today.setHours(0, 0, 0, 0); // Resets time to midnight for accurate comparisons
    const rangeEnd = new Date(today);
    rangeEnd.setDate(today.getDate() + 10); // Show next 30 days so Thrift shows up!

    return events.filter(event => {
        const eventDate = new Date(event.startDate);
        const isWithinWindow = eventDate >= today && eventDate <= rangeEnd;
        return isWithinWindow || event.alwaysShow === true;
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}

function createCard(event, isFeatured = false) {
    const card = document.createElement('a');
    card.className = isFeatured ? 'card starred-card' : 'card'; 
    card.href = event.link;
    card.target = '_blank';
    
    const img = event.image || defaultImages[event.category];
    
    // 1. Keep the badge definition the same
    const featuredBadge = isFeatured ? `<span class="tag featured-tag">FEATURED</span>` : '';
    const ageTag = event.age ? `<span class="tag age-tag">${event.age}</span>` : '';
    
    card.innerHTML = `
        <img src="${img}" alt="${event.title}" class="card-img">
        <div class="card-content">
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; align-items: center;">
                ${featuredBadge}
                <span class="tag">${event.category}</span>
                ${ageTag}
            </div>
            <h3>${event.title}</h3>
            <p class="date-location">${event.displayDate} <br> 📍 ${event.location}</p>
            <p>${event.description}</p>
        </div>
    `;
    return card;
}

function renderEvents(eventsToRender) {
    container.innerHTML = ''; 
    if (eventsToRender.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">Nothing in this category yet!</p>';
        return;
    }
    eventsToRender.forEach(event => container.appendChild(createCard(event, false)));
}

function renderStarredEvents(upcoming) {
    starredContainer.innerHTML = ''; 
    const starred = upcoming.filter(event => event.starred === true);
    if (starred.length === 0) {
        starredContainer.innerHTML = '<p>No featured events this week.</p>';
        return;
    }
    starred.forEach(event => starredContainer.appendChild(createCard(event, true)));
}

// 4. MAIN FETCH DATA
async function loadEvents() {
    console.log("Fetching from Firebase...");
    try {
        const querySnapshot = await getDocs(collection(db, "events"));
        const eventsData = querySnapshot.docs.map(doc => ({ dbId: doc.id, ...doc.data() }));
        
        const activeLineup = getUpcomingEvents(eventsData);
        
        // Initial Render
        renderStarredEvents(activeLineup);
        renderEvents(activeLineup);

        // Setup Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const val = btn.getAttribute('data-filter');
                const filtered = (val === 'all') ? activeLineup : activeLineup.filter(e => e.category === val);
                renderEvents(filtered);
            });
        });

    } catch (error) {
        console.error("Error loading events:", error);
        container.innerHTML = `<p>Error loading data. Check console.</p>`;
    }
}

// Start the app
loadEvents();