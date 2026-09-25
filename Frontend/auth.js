import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


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

const auth = getAuth(app);
const db = getFirestore(app);


/* =========================
   SIGN UP
========================= */

const signupForm = document.getElementById("signup-form");

if (signupForm) {

    const message = document.getElementById("signup-message");

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("signup-name").value;

        const email =
            document.getElementById("signup-email").value;

        const password =
            document.getElementById("signup-password").value;


        try {

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            const user = userCredential.user;


            await setDoc(
                doc(db, "users", user.uid),
                {
                    name: name,
                    email: email,
                    points: 0,
                    hours: 0,
                    activities: 0,
                    createdAt: new Date()
                }
            );


            message.textContent =
           "Account created successfully!";

            message.style.color = "#1f6f5b";


           setTimeout(() => {

    window.location.href = "../index.html";

           }, 500);
        } catch (error) {

            console.error(error);

            message.textContent =
                error.message;

            message.style.color = "#e53935";

        }

    });

}


/* =========================
   LOGIN
========================= */

const loginForm = document.getElementById("login-form");

if (loginForm) {

    const message = document.getElementById("login-message");

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("login-email").value;

        const password =
            document.getElementById("login-password").value;


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            message.textContent =
                "Login successful!";

            message.style.color = "#1f6f5b";


            /*
             * Send the user to the SANAD homepage
             */

            setTimeout(() => {

                window.location.href = "../index.html";

            }, 500);


        } catch (error) {

            console.error(error);

            message.textContent =
                "Incorrect email or password.";

            message.style.color = "#e53935";

        }

    });

}