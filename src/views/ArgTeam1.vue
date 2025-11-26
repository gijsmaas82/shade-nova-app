<template>
  <div class="mission mission--dimensions">
    <section class="mission__hero card surface-frosted">
      <div class="mission__hero-copy">
        <span class="badge">Missie 1</span>
        <h1>Dimensions Collapsing</h1>
        <p>
          Ga naar het digibord in lokaal 2.06 en stap de digitale tweelingwereld binnen. Vind de vijf verschillen tussen de
          projectie en de echte wereld.
        </p>
      </div>
      <div class="mission__hero-visual shadow-ring">
        <img :src="heroImage" alt="Dimensions Collapsing" />
      </div>
    </section>

    <section class="mission__panel card">
      <h2 class="section-heading">Zo pak je het aan</h2>
      <ul class="mission__list">
        <li><strong>Stap 1:</strong> Start het spel op het digibord in lokaal 2.06.</li>
        <li><strong>Stap 2:</strong> Vergelijk wat je ziet met de echte omgeving op het leerplein.</li>
        <li><strong>Stap 3:</strong> Vind de vijf letters die verborgen zitten in de echte wereld.</li>
        <li><strong>Stap 4:</strong> Noteer de letters in deze missieconsole.</li>
        <li><strong>Stap 5:</strong> Vorm het geheime woord en bevestig het om verder te gaan.</li>
      </ul>
    </section>

    <section class="mission__panel card">
      <div class="mission__panel-header">
        <h2 class="section-heading">Log je gevonden letters</h2>
        <span class="stat-pill">{{ lettersFound }} / {{ letters.length }} gevonden</span>
      </div>
      <p class="section-subtext">Tik elke letter in zodra je hem hebt ontdekt. Ze blijven opgeslagen terwijl jij verder zoekt.</p>
      <div class="mission__letters">
        <div
          v-for="(letter, index) in letters"
          :key="index"
          :class="['mission__letter', { 'is-active': letter !== '' }]"
        >
          <input
            v-model="letters[index]"
            class="mission__letter-input"
            maxlength="1"
            @input="moveToNext(index, $event)"
            @keydown.backspace="moveToPrevious(index, $event)"
            ref="inputs"
          />
        </div>
      </div>
    </section>

    <section class="mission__panel card">
      <h2 class="section-heading">Ontcijfer het woord</h2>
      <p class="section-subtext">Combineer alle letters en voer het codewoord in om de missie te voltooien.</p>
      <div class="mission__word-group">
        <input
          v-model="wordInput"
          class="mission__word-input"
          placeholder="Typ jouw codewoord"
          maxlength="5"
          @keyup.enter="checkWord"
        />
        <button class="btn" @click="checkWord">
          Controleer
        </button>
      </div>
    </section>

    <transition name="fade-scale">
      <div v-if="message" class="mission__modal">
        <div :class="['mission__modal-card', 'card', 'surface-frosted', { 'is-success': isCorrect, 'is-error': !isCorrect }]">
          <h3>{{ isCorrect ? 'Missie voltooid' : 'Probeer het opnieuw' }}</h3>
          <p>{{ message }}</p>
          <button class="btn btn--ghost" @click="closeMessage">Sluiten</button>
        </div>
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
  data() {
    return {
      letters: Array(5).fill(""),
      wordInput: "",
      correctWord: "KLAAR",
      message: "",
      isCorrect: false,
      gameStore: useGameStore(),
      router: useRouter(),
      heroImage: new URL('@/assets/game1/digitaltwin1.png', import.meta.url).href
    };
  },
  computed: {
    lettersFound() {
      return this.letters.filter(letter => letter !== "").length;
    }
  },
  async beforeRouteLeave(_to, _from, next) {
    if (!this.gameStore.gameProgress.game1completed) {
      try {
        const gameRef = doc(db, "games", "game1");
        await updateDoc(gameRef, { available: true, lockedBy: null, lockedAt: null });
      } catch (error) {
        console.error("Fout bij het vrijgeven van game1:", error);
      }
    }
    next();
  },
  methods: {
    async checkWord() {
      const word = this.wordInput.toUpperCase();

      if (!word) {
        this.message = "Voer eerst een woord in!";
        this.isCorrect = false;
        return;
      }

      if (word.length !== this.correctWord.length) {
        this.message = `Je woord moet uit ${this.correctWord.length} letters bestaan.`;
        this.isCorrect = false;
        return;
      }

      if (word === this.correctWord) {
        this.message = "Gefeliciteerd! Je hebt het geheime woord ontdekt en kunt nu verder gaan!";
        this.isCorrect = true;
        this.triggerConfetti();
        this.gameStore.gameProgress.game1completed = true;
        this.gameStore.saveProgress();

        try {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(gameInstanceRef, where("name", "==", this.gameStore.playerName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const playerDoc = querySnapshot.docs[0];
            await updateDoc(playerDoc.ref, { game1completed: true });

            const gameRef = doc(db, "games", "game1");
            await updateDoc(gameRef, { available: true, lockedBy: null, lockedAt: null });
          }
        } catch (error) {
          console.error("Fout bij updaten van Firestore:", error);
        }

        setTimeout(() => {
          this.router.push("/snowowl");
        }, 1000);
      } else {
        this.message = "Dat is niet het juiste woord. Probeer het nog eens!";
        this.isCorrect = false;
        this.shakeWordInput();
      }
    },
    moveToNext(index, event) {
      if (event.inputType === "insertText" && event.data) {
        if (index < this.letters.length - 1) {
          this.$nextTick(() => {
            this.$refs.inputs[index + 1].focus();
          });
        }
      }
    },
    moveToPrevious(index, event) {
      if (event.key === "Backspace" && !this.letters[index] && index > 0) {
        this.$nextTick(() => {
          this.$refs.inputs[index - 1].focus();
        });
      }
    },
    closeMessage() {
      this.message = "";
      if (this.isCorrect) {
        this.router.push('/snowowl');
      }
    },
    triggerConfetti() {
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.top = 0;
      canvas.style.left = 0;
      canvas.style.zIndex = 1000;
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      const confettiPieces = [];

      for (let i = 0; i < 200; i++) {
        confettiPieces.push({
          x: Math.random() * canvas.width,
          y: -20,
          size: Math.random() * 10 + 5,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`,
          speed: Math.random() * 5 + 1,
          angle: Math.random() * 2 * Math.PI
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let stillActive = false;

        confettiPieces.forEach(piece => {
          piece.y += piece.speed;
          piece.x += Math.sin(piece.angle) * 2;

          ctx.fillStyle = piece.color;
          ctx.fillRect(piece.x, piece.y, piece.size, piece.size);

          if (piece.y < canvas.height) {
            stillActive = true;
          }
        });

        if (stillActive) {
          requestAnimationFrame(animate);
        } else {
          document.body.removeChild(canvas);
        }
      };

      animate();
    },
    shakeWordInput() {
      const input = document.querySelector('.mission__word-input');
      if (!input) return;
      input.classList.add('is-shaking');
      setTimeout(() => {
        input.classList.remove('is-shaking');
      }, 500);
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

.mission__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.mission__list li {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.mission__letters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}

.mission__letter {
  flex: 0 0 clamp(56px, 20vw, 72px);
  width: clamp(56px, 20vw, 72px);
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(17, 23, 42, 0.9);
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.mission__letter.is-active {
  border-color: rgba(124, 92, 255, 0.4);
  background: rgba(124, 92, 255, 0.12);
  transform: translateY(-4px);
}

.mission__letter-input {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  background: transparent;
  border: none;
  color: #fff;
  text-transform: uppercase;
}

.mission__letter-input:focus {
  outline: none;
}

.mission__word-group {
  display: flex;
  gap: 0.75rem;
}

.mission__word-input {
  flex: 1;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-align: center;
}

.mission__word-input.is-shaking {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}

.mission__modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(3, 6, 18, 0.6);
  backdrop-filter: blur(6px);
  z-index: 1050;
}

.mission__modal-card {
  max-width: 420px;
  text-align: center;
  display: grid;
  gap: 1rem;
  padding: 2rem 1.75rem;
}

.mission__modal-card h3 {
  margin: 0;
}

.mission__modal-card p {
  margin: 0;
  color: var(--text-secondary);
}

.mission__modal-card.is-success {
  border: 1px solid rgba(74, 227, 140, 0.35);
}

.mission__modal-card.is-error {
  border: 1px solid rgba(255, 107, 107, 0.35);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
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

@media (max-width: 640px) {
  .mission__word-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .mission__word-group .btn {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .mission__hero {
    grid-template-columns: 1.1fr 0.9fr;
  }

  .mission__letters {
    justify-content: center;
  }

  .mission__panel {
    padding: 2rem 1.75rem;
  }
}
</style>
