<template>
    <div class="game-container">
      <div class="game-page">
        <h1>🔪 Welkom bij de EscapeRoom! 🕵️‍♂️</h1>
        <p>De beruchte detectivezaak wacht op jou... Ga naar lokaal J2.06 bij het leerplein om het spel te starten.</p>
        <p>Open de camera app op de windows xp computer en scan de juiste afbeeldingen op de muur. Kijk op het scherm welke letters verschijnen.</p>
        <p>Verzamel de letters en maak een woord om verder te gaan.</p>
        
        <input v-model="enteredCode" type="text" placeholder="Voer de geheime code in..." />
        <button @click="checkCode">Ontgrendel de waarheid</button>
        
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
      <!-- <div class="game-images">
        <img :src="gameimages[0]" class="gameimage" />
        <img :src="gameimages[1]" class="gameimage" />
      </div> -->
    </div>
  </template>
  
  <script>
  import { useGameStore } from "@/stores/gameStore";
  import { useRouter } from "vue-router";
  import { db } from "@/firebase";
  import { updateDoc, query, where, getDocs, collection, doc } from "firebase/firestore";

  export default {
    data() {
      return {
        correctCode: "MOORD", // Pas deze code aan naar de juiste waarde
        enteredCode: "",
        errorMessage: "",
        gameimages: [new URL('@/assets/game5/ar1.png', import.meta.url).href, new URL('@/assets/game5/ar2.png', import.meta.url).href]
      };
    },
    setup() {
      return {
        gameStore: useGameStore(),
        router: useRouter(),
      };
    },
    methods: {
      async checkCode() {
        if (this.enteredCode.toUpperCase() === this.correctCode) {
          // 🔹 Update voortgang in Pinia store en Firestore
          this.gameStore.completeGame("game5completed");

          try {
            const gameInstanceRef = collection(db, "gameinstances");
            const q = query(gameInstanceRef, where("name", "==", this.gameStore.playerName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const playerDoc = querySnapshot.docs[0];
              await updateDoc(playerDoc.ref, { game5completed: true });

              // 🔹 Zet het spel opnieuw beschikbaar
              const gameRef = doc(db, "games", "game5");
              await updateDoc(gameRef, { available: true });
            } else {
              console.error("Speler niet gevonden in Firestore!");
            }
          } catch (error) {
            console.error("Fout bij updaten van Firestore:", error);
          }

          // 🔹 Stuur speler na 2 seconden naar /snowowl
          setTimeout(() => {
            this.router.push("/snowowl");
          }, 2000);
        } else {
          this.errorMessage = "Verkeerde code... het mysterie blijft onopgelost.";
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .game-container {
    margin-top:5vh;
    /* background: url('@/assets/background.jpg') no-repeat center center fixed; */
    background: #111;
    background-size: cover;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .game-page {
    text-align: center;
    padding: 20px;
    background-color: #1a1a1a;
    color: #ff4444;
    font-family: 'Creepster', cursive;
    border: 3px solid #ff4444;
    box-shadow: 0 0 15px red;
    max-width: 600px;
    margin: 50px;
    padding: 20px;
    border-radius: 10px;
    position: relative;
    z-index: 2; /* Zorg ervoor dat de game page boven de achtergrondafbeelding verschijnt */
  }
  
  input {
    margin: 10px;
    padding: 10px;
    border: 2px solid #ff4444;
    background-color: #333;
    color: white;
    font-size: 18px;
    text-align: center;
  }
  
  button {
    padding: 10px 15px;
    background-color: #ff4444;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    transition: 0.3s;
  }
  
  button:hover {
    background-color: darkred;
    box-shadow: 0 0 10px red;
  }
  
  .error {
    color: yellow;
    margin-top: 10px;
    font-weight: bold;
  }
  .gameimages {
    display: flex;
    flex-direction: column;
  }
  .gameimage {
    max-width: 80%;
    border:#000000;
    border-radius: 10px;
    margin: 10px;
  }
  </style>
  