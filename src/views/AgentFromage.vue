<template>
  <div class="container">
    <!-- Stap 0: Intro -->
    <transition name="fade-slide">
      <div v-if="step === 0">
        <h1 class="title">Waar bevindt het spel zich?</h1>
        <p class="subtitle">Het spel bevindt zich in lokaal 2.10. Hier begint je avontuur!</p>
        <button class="glow-button" @click="nextStep">Verder</button>
      </div>
    </transition>

    <!-- Stap 1: Instructies -->
    <transition name="fade-slide">
      <div v-if="step === 1" class="instructions">
        <h1 class="title">Volg deze stappen om te hacken:</h1>
        <ul class="step-list">
          <li><strong>Stap 1:</strong> Betreed een futuristische wereld en hack een beveiligde computer.</li>
          <li><strong>Stap 2:</strong> Zoek in de omgeving naar de geheime code.</li>
          <li><strong>Stap 3:</strong> Speel een 2D-minigame om de firewall te omzeilen.</li>
          <li><strong>Stap 4:</strong> Druk op de rode knop om de hack te voltooien.</li>
          <li><strong>Stap 5:</strong> Gebruik de code om de missie af te ronden.</li>
        </ul>
        <button class="glow-button" @click="nextStep">Ik ben klaar</button>
      </div>
    </transition>

    <!-- Stap 2: Code invoeren -->
    <transition name="fade-slide">
      <div v-if="step === 2">
        <h1 class="title">Voer de code in van de computer</h1>
        <div class="code-bar">
          <input 
            v-model="code" 
            type="text" 
            placeholder="Voer de code in..." 
            @input="validateCode" 
            maxlength="4"
            @keydown.enter="submitCode"
          />
        </div>
        <button class="glow-button" @click="submitCode">Verzenden</button>
        <p v-if="message" class="message">{{ message }}</p>
      </div>
    </transition>

    <!-- Stap 3: Succesvol afgerond -->
    <transition name="fade-slide">
      <div v-if="step === 3">
        <p class="final-message"><strong>Gefeliciteerd agent Fromage! Je missie is geslaagd!</strong></p>
        <button class="glow-button" @click="goToSnowOwl">Ga verder</button>
      </div>
    </transition>
  </div>
</template>

<script>
import { useGameStore } from "@/stores/gameStore";
import { useRouter } from "vue-router";
import { db } from "@/firebase";
import { updateDoc, query, where, getDocs, collection, doc } from "firebase/firestore";

export default {
  name: 'AgentFromage',
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
    if (this.code.trim() === "8630") {
      this.message = "✅ Code correct! Gefeliciteerd agent Fromage! Je missie is geslaagd!";

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
      }, 2000);
    } else {
      this.message = "❌ Foute code, probeer opnieuw.";
    }
  }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  padding: 50px;
  background: linear-gradient(to bottom, #111, #222);
  color: #fff;
  font-family: 'SF Pro Display', sans-serif;
  transition: background 1s ease-in-out;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  text-transform: uppercase;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.glow-button {
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  color: #fff;
  background: linear-gradient(45deg, #007aff, #0fa5ff);
  box-shadow: 0 0 15px rgba(15, 165, 255, 0.8);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.glow-button:hover {
  transform: scale(1.1);
  box-shadow: 0 0 30px rgba(15, 165, 255, 1);
}

.code-bar input {
  width: 250px;
  padding: 15px;
  font-size: 20px;
  text-align: center;
  border-radius: 12px;
  border: 2px solid #007aff;
  background: #111;
  color: #fff;
}

.message {
  margin-top: 10px;
  font-size: 1.2rem;
  font-weight: bold;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.6s ease;
}

.fade-slide-enter, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>