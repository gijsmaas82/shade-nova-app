<template>
  <div class="mission mission--fromage">
    <section class="mission__hero card surface-frosted">
      <div class="mission__hero-copy">
        <span class="badge">Missie 2</span>
        <h1>Agent Fromage</h1>
        <p>Verplaats je naar lokaal 2.10 en infiltreer het systeem. Vind de geheime code op het digibord om de firewall te kraken.</p>
      </div>
      <div class="mission__hero-visual shadow-ring">
        <img :src="heroImage" alt="Agent Fromage" />
      </div>
    </section>

    <section class="mission__panel card" v-if="step === 0">
      <h2 class="section-heading">Waar moet je zijn?</h2>
      <p class="section-subtext">Het spel staat klaar op het digibord in lokaal 2.10. Zet je headset op, log in als agent en volg de instructies.</p>
      <button class="btn" @click="nextStep">Start briefing</button>
    </section>

    <section class="mission__panel card" v-else-if="step === 1">
      <h2 class="section-heading">Zo voltooi je de hack</h2>
      <ul class="mission__list">
        <li><strong>1.</strong> Activeer de terminal en observeer de omgeving.</li>
        <li><strong>2.</strong> Zoek naar een verborgen code in de digitale wereld.</li>
        <li><strong>3.</strong> Speel de minigame en ontwijk de beveiliging.</li>
        <li><strong>4.</strong> Gebruik de gevonden code om de missie af te ronden.</li>
      </ul>
      <button class="btn" @click="nextStep">Ik ben klaar</button>
    </section>

    <section class="mission__panel card" v-else-if="step === 2">
      <h2 class="section-heading">Voer de gevonden code in</h2>
      <p class="section-subtext">Typ de viercijferige code van de computer in om jouw hack te voltooien.</p>
      <div class="mission__code-group">
        <input
          v-model="code"
          type="text"
          placeholder="Voer de code in"
          maxlength="4"
          @input="validateCode"
          @keydown.enter="submitCode"
        />
        <button class="btn" @click="submitCode">Verzenden</button>
      </div>
      <p v-if="message" class="mission__feedback" :class="{ 'is-error': messageIsError }">{{ message }}</p>
    </section>

    <section class="mission__panel card" v-else-if="step === 3">
      <h2 class="section-heading">Missie geslaagd</h2>
      <p class="section-subtext">De firewall is opengezet en je bent door naar de volgende opdracht. Ga terug naar de hub om door te gaan.</p>
      <button class="btn" @click="goToSnowOwl">Terug naar Snow Owl</button>
    </section>
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
      messageIsError: false,
      gameStore: useGameStore(),
      router: useRouter(),
      heroImage: new URL('@/assets/game2/agentfromage1.png', import.meta.url).href
    };
  },
  async beforeRouteLeave(_to, _from, next) {
    if (!this.gameStore.gameProgress.game2completed) {
      try {
        const gameRef = doc(db, "games", "game2");
        await updateDoc(gameRef, { available: true, lockedBy: null, lockedAt: null });
      } catch (error) {
        console.error("Fout bij het vrijgeven van game2:", error);
      }
    }
    next();
  },
  methods: {
    nextStep() {
      this.step++;
    },
    validateCode() {
      this.code = this.code.replace(/[^0-9]/g, "");
    },
    async submitCode() {
      if (this.code.trim() === "8630") {
        this.message = "Code correct! De hack is voltooid.";
        this.messageIsError = false;

        this.gameStore.completeGame("game2completed");

        try {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(gameInstanceRef, where("name", "==", this.gameStore.playerName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const playerDoc = querySnapshot.docs[0];
            await updateDoc(playerDoc.ref, { game2completed: true });

            const gameRef = doc(db, "games", "game2");
            await updateDoc(gameRef, { available: true, lockedBy: null, lockedAt: null });
          }
        } catch (error) {
          console.error("Fout bij updaten van Firestore:", error);
        }

        this.step = 3;
        setTimeout(() => {
          this.router.push("/snowowl");
        }, 2000);
      } else {
        this.message = "Foute code, probeer het opnieuw.";
        this.messageIsError = true;
      }
    },
    goToSnowOwl() {
      this.router.push("/snowowl");
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

.mission__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.mission__list li {
  font-size: 0.95rem;
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
