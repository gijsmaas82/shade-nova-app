<template>
  <div class="container">
    <!-- Stap 0: Intro -->
    <div v-if="step === 0">
      <h1 class="fade-in-apple slide-up">Waar bevindt het spel zich?</h1>
      <p class="fade-in-apple larger-text slide-up-delay">Het spel bevindt zich in lokaal 2.10. Hier begint je avontuur!</p>
      <button class="glow-button" @click="nextStep">Verder</button>
    </div>

    <!-- Stap 1: Instructies -->
    <div v-if="step === 1" class="instructions fade-in-apple slide-up">
      <h1 class="larger-text">Volg deze stappen om te hacken:</h1>
      <ul class="step-list larger-text">
        <li><strong>Stap 1:</strong> Je betreedt een futuristische wereld waarin je een beveiligde computer moet hacken.</li>
        <li><strong>Stap 2:</strong> Zoek in de omgeving naar de geheime code.</li>
        <li><strong>Stap 3:</strong> Speel een 2D-minigame om de firewall te omzeilen.</li>
        <li><strong>Stap 4:</strong> Druk op de rode knop om de hack te voltooien.</li>
        <li><strong>Stap 5:</strong> Gebruik de code om de missie af te ronden.</li>
      </ul>
      <button class="glow-button" @click="nextStep">Ik ben klaar</button>
    </div>

    <!-- Stap 2: Code invoeren -->
    <div v-if="step === 2">
      <h1>Voer je code in van de computer</h1>
      <div class="code-bar">
        <input 
          v-model="code" 
          type="text" 
          placeholder="Voer je code in..." 
          @input="validateCode" 
          maxlength="4"
          @keydown.enter="submitCode"
        />
      </div>
      <button @click="submitCode">Verzenden</button>
      <p v-if="message">{{ message }}</p>
    </div>

    <!-- Stap 3: Succesvol afgerond -->
    <div v-if="step === 3">
      <p class="final-message fade-in-apple slide-up"><strong>Gefeliciteerd agent Fromage! Je missie is geslaagd!</strong></p>
    </div>
  </div>
</template>

<script>
import { useGameStore } from "@/stores/gameStore";
import { useRouter } from "vue-router";
import { db } from "@/firebase";
import { updateDoc, query, where, getDocs, collection, doc } from "firebase/firestore";

export default {
  name: "AgentFromage",
  data() {
    return {
      step: 0,
      code: "",
      message: "",
      gameStore: useGameStore(), // 🔹 Pinia store
      router: useRouter(), // 🔹 Vue Router
    };
  },
  methods: {
    nextStep() {
      this.step++;
    },
    validateCode() {
      this.code = this.code.replace(/[^0-9]/g, ""); // Alleen cijfers
    },
    async submitCode() {
    if (this.code.trim() === "1234") {
      this.message = "✅ Code correct!";

      // 🔹 Roep de completeGame functie aan om de voortgang bij te werken
      this.gameStore.completeGame("game2completed");

      // 🔹 Zoek Firestore document op basis van playerName
      try {
        const gameInstanceRef = collection(db, "gameinstances");
        const q = query(gameInstanceRef, where("name", "==", this.gameStore.playerName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Haal het eerste document op (aangezien je verwacht dat er maar één match is)
          const playerDoc = querySnapshot.docs[0];
          await updateDoc(playerDoc.ref, { game2completed: true });
          console.log("Game 2 voortgang opgeslagen in Firestore! ✅");

          // 🔹 Zet het spel weer op 'beschikbaar' in de games-collectie
          const gameRef = doc(db, "games", "game2");
          await updateDoc(gameRef, { available: true });
          console.log("Game 2 opnieuw beschikbaar gemaakt in Firestore! 🔓");
        } else {
          console.error("Speler niet gevonden in Firestore!");
        }
      } catch (error) {
        console.error("Fout bij updaten van Firestore:", error);
      }

      setTimeout(() => {
        this.router.push("/snowowl"); // 🔹 Stuur speler naar /snowowl
      }, 1000);
    } else {
      this.message = "❌ Foute code, probeer opnieuw.";
    }
  }
  },
};
</script>

<style scoped>
/* Algemene styling */
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  padding: 50px;
  transition: background 1s ease-in-out;
  overflow: hidden;
}

/* Knoppen */
.glow-button {
  padding: 18px 36px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  border-radius: 12px;
  color: #fff;
  background: #007aff;
  box-shadow: 0 0 15px rgba(0, 122, 255, 0.8);
  transition: all 0.3s ease-in-out;
  margin: 15px;
  text-transform: uppercase;
  animation: buttonPulse 2s infinite ease-in-out;
}

@keyframes buttonPulse {
  0% { transform: scale(1); box-shadow: 0 0 15px rgba(0, 122, 255, 0.8); }
  50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(0, 122, 255, 1); }
  100% { transform: scale(1); box-shadow: 0 0 15px rgba(0, 122, 255, 0.8); }
}

.glow-button:hover {
  background: #0051d4;
  box-shadow: 0 0 30px rgba(0, 122, 255, 1);
  transform: scale(1.1);
}

/* Code invoerveld */
.code-bar input {
  width: 100%;
  max-width: 300px;
  padding: 15px;
  font-size: 24px;
  text-align: center;
  border-radius: 12px;
  border: 2px solid #007aff;
}
</style>
