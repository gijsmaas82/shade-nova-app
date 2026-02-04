<template>
  <div class="mission mission--feelit">
    <!-- HERO -->
    <section class="mission__hero card surface-frosted">
      <div class="mission__hero-copy">
        <span class="badge">Missie 4</span>
        <h1>Space Invaders</h1>
        <p>Versla de eindbaas! Ontwijk de aanvallen en maak de ruimte veilig!</p>
      </div>
      <div class="mission__hero-visual shadow-ring">
        <img :src="heroImage" alt="Space Invaders" />
      </div>
    </section>

    <!-- MISSION BRIEFING -->
    <section class="mission__panel card">
      <h2 class="section-heading">Missiebriefing</h2>
      <ul class="mission__list">
        <li><strong>1.</strong> Begeef je naar lokaal 2.08 en start de Space Invaders‑game.</li>
        <li><strong>2.</strong> Gebruik spatie om te schieten.</li>
        <li><strong>3.</strong> Gebruik pijltjes om te bewegen. Succes agent!</li>
      </ul>
    </section>

    <!-- CODE INPUT -->
    <section class="mission__panel card">
      <h2 class="section-heading">Versla de Eindbaas!</h2>
      <p class="section-subtext">Voer de geheime code in die je hebt gevonden om de missie af te sluiten.</p>
      <div class="mission__code-group">
        <input
          v-model="enteredCode"
          type="text"
          placeholder="Voer de geheime code in"
          maxlength="5"
          @keydown.enter="checkCode"
        />
        <button class="btn" @click="checkCode">Check de code</button>
      </div>
      <p v-if="errorMessage" class="mission__feedback is-error">{{ errorMessage }}</p>
      <p v-else-if="successMessage" class="mission__feedback">{{ successMessage }}</p>
    </section>
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
      correctCode: "SPACE",
      enteredCode: "",
      errorMessage: "",
      successMessage: "",
      gameStore: useGameStore(),
      router: useRouter(),

      // Nieuw plaatje
      heroImage: new URL('@/assets/game2/boss.png', import.meta.url).href
    };
  },

  async beforeRouteLeave(_to, _from, next) {
    if (!this.gameStore.gameProgress.game2completed) {
      try {
        const gameRef = doc(db, "games", "game2");
        await updateDoc(gameRef, {
          available: true,
          lockedBy: null,
          lockedAt: null
        });
      } catch (error) {
        console.error("Fout bij het vrijgeven van game2:", error);
      }
    }
    next();
  },

  methods: {
    async checkCode() {
      if (this.enteredCode.toUpperCase() === this.correctCode) {
        this.errorMessage = "";
        this.successMessage = "Missie geslaagd agent! De ruimte is weer veilig!";
        this.gameStore.completeGame("game2completed");

        try {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(
            gameInstanceRef,
            where("name", "==", this.gameStore.playerName)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const playerDoc = querySnapshot.docs[0];

            await updateDoc(playerDoc.ref, { game2completed: true });

            const gameRef = doc(db, "games", "game2");
            await updateDoc(gameRef, {
              available: true,
              lockedBy: null,
              lockedAt: null
            });
          }
        } catch (error) {
          console.error("Fout bij updaten van Firestore:", error);
        }

        setTimeout(() => {
          this.router.push("/snowowl");
        }, 2000);

      } else {
        this.successMessage = "";
        this.errorMessage = "Verkeerde code, probeer het opnieuw.";
      }
    }
  }
};
</script>

<style scoped>
/* Je originele styling 1:1 meegenomen */
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

  .mission__code-group .btn,
  .mission__code-group input {
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