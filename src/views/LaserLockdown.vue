<template>
  <div class="mission mission--laser">
    <section class="mission__hero card surface-frosted">
      <div class="mission__hero-copy">
        <span class="badge">Missie 3</span>
        <h1>Laser Lockdown</h1>
        <p>Ga naar lokaal 2.11 en ontwijk het lasersysteem. Leid de straal naar de juiste ontvanger en vind de ontsnappingscode.</p>
      </div>
      <div class="mission__hero-visual shadow-ring">
        <img :src="heroImage" alt="Laser Lockdown" />
      </div>
    </section>

    <section class="mission__panel card">
      <div class="mission__panel-header">
        <h2 class="section-heading">Briefing</h2>
        <span class="stat-pill">Stap {{ currentStep + 1 }} van {{ steps.length }}</span>
      </div>
      <p class="section-subtext">{{ steps[currentStep] }}</p>

      <div v-if="currentStep === steps.length - 1" class="mission__code-group">
        <input
          type="text"
          v-model="enteredCode"
          placeholder="Voer de code in"
          maxlength="4"
          @keydown.enter="submitCode"
        />
        <button class="btn" @click="submitCode">Bevestig</button>
      </div>
      <p v-if="errorMessage" class="mission__feedback is-error">{{ errorMessage }}</p>
      <p v-if="codeCorrect" class="mission__feedback">Gefeliciteerd, je hebt de code geraden!</p>

      <div class="mission__step-controls">
        <button class="btn btn--ghost" @click="prevStep" :disabled="currentStep === 0">Vorige</button>
        <button class="btn" @click="nextStep" :disabled="currentStep === steps.length - 1">Volgende</button>
      </div>
    </section>
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
      currentStep: 0,
      enteredCode: "",
      correctCode: "1234",
      codeCorrect: false,
      errorMessage: "",
      gameStore: useGameStore(),
      router: useRouter(),
      heroImage: new URL('@/assets/game3/laser1.png', import.meta.url).href,
      steps: [
        "Welkom bij Laser Lockdown! Ga naar lokaal 2.11 om de missie te starten.",
        "Verbind lasers met spiegels om de deur te openen en te ontsnappen.",
        "Denk strategisch: sommige spiegels zijn misleidingen.",
        "Komt de laser aan op de juiste plek? Dan gaat de deur open.",
        "Voer de code in die verschijnt wanneer je ontsnapt."
      ]
    };
  },
  async beforeRouteLeave(_to, _from, next) {
    if (!this.gameStore.gameProgress.game3completed) {
      try {
        const gameRef = doc(db, "games", "game3");
        await updateDoc(gameRef, { available: true, lockedBy: null, lockedAt: null });
      } catch (error) {
        console.error("Fout bij het vrijgeven van game3:", error);
      }
    }
    next();
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
      const attempt = this.enteredCode.trim().toUpperCase();

      if (!attempt) {
        this.errorMessage = "Vul de code in voordat je bevestigt.";
        this.codeCorrect = false;
        return;
      }

      if (attempt === this.correctCode) {
        this.codeCorrect = true;
        this.errorMessage = "";
        this.gameStore.completeGame("game3completed");

        try {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(gameInstanceRef, where("name", "==", this.gameStore.playerName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const playerDoc = querySnapshot.docs[0];
            await updateDoc(playerDoc.ref, { game3completed: true });

            const gameRef = doc(db, "games", "game3");
            await updateDoc(gameRef, { available: true, lockedBy: null, lockedAt: null });
          }
        } catch (error) {
          console.error("Fout bij updaten van Firestore:", error);
        }

        setTimeout(() => {
          this.router.push("/snowowl");
        }, 2000);
      } else {
        this.errorMessage = "Helaas, probeer het nog een keer.";
        this.codeCorrect = false;
      }
    }
  }
};
</script>

<style scoped>
.mission {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  padding: 0 1.25rem;
  max-width: 900px;
  margin: 0 auto;
}

.mission__hero {
  display: grid;
  gap: var(--gap-md);
  padding: 2rem 1.75rem;
  align-items: center;
}

.mission__hero-copy h1 {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 2.4rem);
  margin: 0.25rem 0 0.75rem;
}

.mission__hero-copy p {
  margin: 0;
  color: var(--text-secondary);
}

.mission__hero-visual {
  display: grid;
  place-items: center;
}

.mission__hero-visual img {
  width: min(260px, 70vw);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mission__panel {
  display: grid;
  gap: 1rem;
  text-align: left;
}

.mission__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.mission__code-group {
  display: flex;
  gap: 0.75rem;
}

.mission__feedback {
  margin: 0;
  color: var(--success-color);
  font-weight: 600;
}

.mission__feedback.is-error {
  color: var(--danger-color);
}

.mission__step-controls {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

@media (max-width: 640px) {
  .mission__code-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .mission__code-group .btn {
    width: 100%;
  }

  .mission__code-group input {
    width: 100%;
  }

  .mission__step-controls {
    flex-direction: column;
    gap: 0.75rem;
  }

  .mission__step-controls .btn {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .mission__hero {
    grid-template-columns: 1.1fr 0.9fr;
  }

  .mission__panel {
    padding: 2rem 1.75rem;
  }
}
</style>
