import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDmMzRidEMVHt-1ZMLNBrlFl4WO30XjSaA",
    authDomain: "nacht-van-de-sneeuwuil.firebaseapp.com",
    projectId: "nacht-van-de-sneeuwuil",
    storageBucket: "nacht-van-de-sneeuwuil.firebasestorage.app",
    messagingSenderId: "192258688786",
    appId: "1:192258688786:web:a8f1910ac8dd284e4315cb",
    measurementId: "G-YYWBFGFGHK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
