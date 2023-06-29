// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore"


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCzNTOixYTdAFwcZFL1iboqsEcAda1WPB0",
    authDomain: "roomies-74233.firebaseapp.com",
    databaseURL: "https://roomies-74233.firebaseio.com",
    projectId: "roomies-74233",
    storageBucket: "roomies-74233.appspot.com",
    messagingSenderId: "471069921572",
    appId: "1:471069921572:web:913b2b62071a9f6d8d23b1",
    measurementId: "G-4WQNEW97CN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app)
