import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
const firebaseConfig = {
    apiKey: "AIzaSyCDLp1aiYS2ZTV1HmCmcdIavVsnlxZLs4M",
    authDomain: "sanad-4fadd.firebaseapp.com",
    projectId: "sanad-4fadd",
    storageBucket: "sanad-4fadd.firebasestorage.app",
    messagingSenderId: "986002297604",
    appId: "1:986002297604:web:1dd555d5b6ec707e07f651",
    measurementId: "G-N9823VRXRK"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "pages/login.html";

    }

});
console.log("Firebase connected!");


// Create the map
const mapElement = document.getElementById("koshk-map");

if (mapElement) {

    const map = L.map("koshk-map").setView([26.8, 30.8], 5.5);


// Add OpenStreetMap
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);


// Get Koshks from Firestore
const koshkCollection = collection(db, "Koshks");

const KoshkSnapshot = await getDocs(koshkCollection);

const Koshks = [];

KoshkSnapshot.forEach((doc) => {

    Koshks.push({
        id: doc.id,
        ...doc.data()
    });

});


function getMarkerColor(urgency) {

    if (urgency === "High") {
        return "#e53935";
    }

    if (urgency === "Medium") {
        return "#f4c430";
    }

    return "#1f6f5b";
}


function showKoshks() {

    /// Remove old markers
    map.eachLayer((layer) => {

        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }

    });

    const searchInput =
        document.getElementById("koshk-search");
      
       const urgencyFilter =
        document.getElementById("urgency-filter");


    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedUrgency =
        urgencyFilter.value;


    Koshks.forEach((koshk) => {

        const location =
            (koshk.Location || "").toLowerCase();

        const need =
            (koshk.Need || "").toLowerCase();

        const urgency =
            koshk.Urgency || "";


        const matchesSearch =
            location.includes(searchText) ||
            need.includes(searchText);

        const matchesUrgency =
            selectedUrgency === "All" ||
            urgency === selectedUrgency;


        if (matchesSearch && matchesUrgency) {

            const markerColor =
                getMarkerColor(urgency);


           const marker = L.marker(
                [koshk.Latitude, koshk.Longitude],
                {
                icon: L.divIcon({
                      className: "koshk-marker",
                     html: `
                     <div style="
                       width: 20px;
                       height: 20px;
                        background-color: ${markerColor};
                        border: 3px solid white;
                       border-radius: 50%;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
                     "></div>
                      `,
                     iconSize: [26, 26],
                     iconAnchor: [13, 13]
             })
            }  
           ).addTo(map);

            marker.bindPopup(`
                <strong>${koshk.Name}</strong><br>
                📍 ${koshk.Location}<br>
                ❤️ Need: ${koshk.Need}<br>
                ⚠️ Urgency: ${koshk.Urgency}<br>
                ${koshk.Description}
            `);

        }

    });

}


// Show all kiosks when the page loads
showKoshks();


// Search while typing
document
    .getElementById("koshk-search")
    .addEventListener("input", showKoshks);


// Filter by urgency
document
    .getElementById("urgency-filter")
    .addEventListener("change", showKoshks);

} // closes if (mapElement)

// Load real dashboard data
onAuthStateChanged(auth, async (user) => {

    if (!user) {
        return;
    }

    const dashboardPoints =
        document.getElementById("dashboard-points");

    const dashboardHours =
        document.getElementById("dashboard-hours");

    const dashboardActivities =
        document.getElementById("dashboard-activities");

    const dashboardPeople =
        document.getElementById("dashboard-people");
    const dashboardProgress =
        document.getElementById("dashboard-progress");

    const dashboardProgressBar =
        document.getElementById("dashboard-progress-bar");
    
    // Only run this on the dashboard page
    if (!dashboardPoints) {
        return;
    }


    const userRef =
        doc(db, "users", user.uid);

    const userSnapshot =
        await getDoc(userRef);


    if (userSnapshot.exists()) {

        const userData =
            userSnapshot.data();

        dashboardPoints.textContent =
            userData.points || 0;

        dashboardHours.textContent =
            userData.hours || 0;

        dashboardActivities.textContent =
            userData.activities || 0;

        dashboardPeople.textContent =
            userData.peopleHelped || 0;
        const hours = userData.hours || 0;

         const goal = 20;

        const progress =
           Math.min((hours / goal) * 100, 100);

        dashboardProgress.textContent =
        `${Math.round(progress)}%`;

        dashboardProgressBar.style.width =
        `${progress}%`;    

    }

});
// Load Koshk opportunities on the Volunteer page
console.log("VOLUNTEER CODE REACHED");
const volunteerTaskList =
    document.getElementById("volunteer-task-list");

if (volunteerTaskList) {

    const snapshot =
        await getDocs(collection(db, "Koshks"));
    console.log("Koshks found:", snapshot.size);
    volunteerTaskList.innerHTML = "";

    snapshot.forEach((doc) => {

        const koshk = doc.data();

        const task = document.createElement("div");

        task.className = "volunteer-task";

        task.innerHTML = `
          <h3>${koshk.Need}</h3>

          <p>
             📍 ${koshk.Location}
         </p>

          <p>
             ${koshk.Description}
          </p>

          <button class="btn btn-primary request-task-btn">
        Request Task
         </button>
       `;

       volunteerTaskList.appendChild(task);

const requestButton =
    task.querySelector(".request-task-btn");

requestButton.addEventListener("click", async () => {

    const user = auth.currentUser;

    if (!user) {
        alert("Please log in first.");
        return;
    }

    try {

        await addDoc(
            collection(db, "taskRequests"),
            {
                userId: user.uid,
                koshkId: doc.id,
                koshkName: koshk.Name,
                need: koshk.Need,
                location: koshk.Location,
                status: "Pending",
                requestedAt: serverTimestamp()
            }
        );

        requestButton.textContent = "Pending";
        requestButton.disabled = true;

    } catch (error) {

        console.error(error);
        alert("Something went wrong. Please try again.");

    }

    });

    });

}
// Load volunteer requests on the Notifications page

const notificationList =
    document.getElementById("notification-list");

if (notificationList) {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {
            return;
        }

        try {

            const snapshot =
                await getDocs(collection(db, "taskRequests"));

            notificationList.innerHTML = "";

            let foundRequest = false;

            snapshot.forEach((requestDoc) => {

                const request = requestDoc.data();

                if (request.userId !== user.uid) {
                    return;
                }

                foundRequest = true;

                const notification =
                    document.createElement("div");

                notification.className =
                    "notification-item unread";

                notification.innerHTML = `
                    <div class="notification-icon">
                        !
                    </div>

                    <div class="notification-content">

                        <div class="notification-title">
                            <h3>
                                Volunteer Request
                            </h3>

                            <span class="unread-dot"></span>
                        </div>

                        <p>
                            Your request for
                            <strong>${request.need}</strong>
                            at ${request.koshkName}
                            is currently
                            <strong>${request.status}</strong>.
                        </p>

                        <span class="notification-time">
                            ${request.location}
                        </span>

                    </div>
                `;

                notificationList.appendChild(notification);

            });

            if (!foundRequest) {

                notificationList.innerHTML = `
                    <p>
                        You don't have any volunteer requests yet.
                    </p>
                `;

            }

        } catch (error) {

            console.error(error);

            notificationList.innerHTML = `
                <p>
                    Could not load your notifications.
                </p>
            `;

        }

    });

}