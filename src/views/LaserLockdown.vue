
<template>
  <div class="container">
    <div class="opening">
      <h1>Laser</h1>
      <h1>L🔒ckdown</h1>
    </div>

    <!-- Overlay met uitlegstappen -->
    <div v-if="showOverlay" class="overlay">  
      <div class="overlay-content">
        <h2>Speluitleg</h2>
        <p>{{ steps[currentStep] }}</p>

        <!-- Code invoerveld verschijnt bij de laatste stap -->
        <div v-if="currentStep === steps.length - 1">
          <label for="codeInput">Voer de code in:</label>

          <!-- ✅ Toon alleen input en button als de code nog niet correct is -->
          <div v-if="!codeCorrect">
            <input 
              type="text" 
              id="codeInput" 
              v-model="enteredCode" 
              placeholder="4567"
            />
            <button @click="submitCode">Submit</button>
            <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p> <!-- ❌ Foutmelding -->
          </div>

          <!-- ✅ Gefeliciteerd bericht bij juiste code -->
          <p v-else class="success-text">🎉 Gefeliciteerd, je hebt de code geraden! 🎉</p>
        </div>

        <!-- Navigatie knoppen -->
        <div class="buttons">
          <button @click="prevStep" :disabled="currentStep === 0">Vorige</button>
          <button @click="nextStep" :disabled="currentStep === steps.length - 1">Volgende</button>
        </div>
      </div>
    </div>
    <div class="game-images">
      <img :src="gameimages[0]" class="gameimage" />
      <img :src="gameimages[1]" class="gameimage" />
      <img :src="gameimages[2]" class="gameimage" />
      <img :src="gameimages[3]" class="gameimage" />
    </div>
  </div>
</template>

<script>
import { useGameStore } from "@/stores/gameStore";
import { useRouter } from "vue-router";
import { db } from "@/firebase";
import { updateDoc, query, where, getDocs, collection, doc } from "firebase/firestore";

export default {
  name: "LaserLockdown",
  data() {
    return {
      showOverlay: true,
      currentStep: 0,
      enteredCode: "",
      correctCode: "1234",
      codeCorrect: false, // ✅ Nieuwe statusvariabele
      errorMessage: "", // ❌ Voor foutmelding
      gameimages: [new URL('@/assets/game3/laser1.png', import.meta.url).href, new URL('@/assets/game3/laser2.png', import.meta.url).href, new URL('@/assets/game3/laser3.png', import.meta.url).href, new URL('@/assets/game3/laser4.png', import.meta.url).href],
      steps: [
        "Welkom bij Laser Lockdown! 🚀 Verbind lasers met spiegels om de deur te openen en te ontsnappen!",
        "Gebruik de spiegels om de laserstraal in de juiste richting te sturen.",
        "Sommige levels hebben obstakels die je moet omzeilen. Denk strategisch na!",
        "Als de laser de juiste plek bereikt, wordt de deur ontgrendeld en kun je ontsnappen!",
        "Veel succes en veel plezier! 🎉 Klik op 'Volgende' voor de code om te ontsnappen."
      ]
    };
  },
  setup() {
    return {
      gameStore: useGameStore(),
      router: useRouter(),
    };
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    async submitCode() {
      if (this.enteredCode === this.correctCode) {
        this.codeCorrect = true; // ✅ Zet status op correct

        // 🔹 Update voortgang in Pinia store en Firestore
        this.gameStore.completeGame("game3completed");

        try {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(gameInstanceRef, where("name", "==", this.gameStore.playerName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const playerDoc = querySnapshot.docs[0];
            await updateDoc(playerDoc.ref, { game3completed: true });

            // 🔹 Zet het spel opnieuw beschikbaar
            const gameRef = doc(db, "games", "game3");
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
        this.errorMessage = "❌ Helaas, probeer het nog een keer."; // ❌ Toon foutmelding
      }
    }
  }
};
</script>

<style scoped>
.container {
  margin-top: 5vh;
  font-family: 'Sixtyfour Convergence', sans-serif;
  background-color: #0f0b45;
  text-align: center;
  min-height: 100vh;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.opening h1 {
  font-size: 3em;
}

.overlay {
  background: rgba(20, 20, 50, 0.95);
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  max-width: 450px;
  border: 2px solid #00ffff;
  box-shadow: 0 0 15px #00ffff;
  animation: fadeIn 0.5s ease-in-out;
  margin: 20px;
}

.overlay h2 {
  color: #ff00ff;
  text-shadow: 0 0 10px #ff00ff;
  font-size: 2em;
}

.overlay p {
  margin-bottom: 20px;
  font-size: 1.1em;
  color: #ddd;
  line-height: 1.5;
}

.buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}
.buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}
.overlay-content button {
  padding: 10px 15px;
  font-size: 1.1em;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.3s ease-in-out;
}

.overlay-content button {
  background: linear-gradient(90deg, #ff00ff, #00ffff);
  box-shadow: 0 0 10px #ff00ff;
}

.buttons button {
  padding: 10px 15px;
  font-size: 1.1em;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.3s ease-in-out;
}

.buttons button:first-child {
  background: linear-gradient(90deg, #ff00ff, #00ffff);
  box-shadow: 0 0 10px #ff00ff;
}

.buttons button:first-child:hover {
  background: linear-gradient(90deg, #00ffff, #ff00ff);
  box-shadow: 0 0 20px #00ffff;
}

.buttons button:last-child {
  background: linear-gradient(90deg, #ff4500, #ff0000);
  box-shadow: 0 0 10px #ff0000;
}

.buttons button:last-child:hover {
  background: linear-gradient(90deg, #ff0000, #ff4500);
  box-shadow: 0 0 20px #ff4500;
}

input {
  padding: 10px;
  margin-top: 10px;
  font-size: 1.1em;
  border-radius: 5px;
  border: 1px solid #00ffff;
  background-color: #1a1a3d;
  color: white;
}

input:focus {
  border-color: #ff00ff;
  outline: none;
}

.error-text {
  color: #ff4d4d;
  margin-top: 10px;
  font-size: 1.2em;
}

.success-text {
  color: #00ff00;
  font-size: 1.4em;
  font-weight: bold;
  margin-top: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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
