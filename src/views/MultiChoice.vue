<template>
  <div class="mission mission--feelit">
    <!-- HERO -->
    <section class="mission__hero card surface-frosted">
      <div class="mission__hero-copy">
        <span class="badge">Missie 4</span>
        <h1>Mario</h1>
        <p>Beantwoord alle vragen correct om de geheime code te verdienen!</p>
      </div>
      <div class="mission__hero-visual shadow-ring">
        <img :src="heroImage" alt="Mario" />
      </div>
    </section>

    <!-- VRAGEN -->
    <section class="mission__panel card" v-if="!questionsCompleted">
      <h2 class="section-heading">Meerkeuzevragen</h2>

      <div v-for="(q, index) in questions" :key="index">
        <p><strong>Vraag {{ index + 1 }}:</strong> {{ q.question }}</p>

        <div class="mission__list">
          <div
            v-for="(option, idx) in q.options"
            :key="idx"
            class="mission__option"
            :class="{
              'mission__option--selected': userAnswers[index] === option,
              'mission__option--correct':
                feedback[index] === 'Goed!' && option === q.correct,
              'mission__option--wrong':
                feedback[index] === 'Fout, probeer opnieuw.' &&
                userAnswers[index] === option
            }"
            @click="userAnswers[index] = option"
          >
            <span class="mission__icon">
              <span v-if="feedback[index] && option === q.correct">✔</span>
              <span
                v-else-if="
                  feedback[index] === 'Fout, probeer opnieuw.' &&
                  userAnswers[index] === option
                "
              >
                ✖
              </span>
            </span>

            <span>{{ option }}</span>
          </div>
        </div>

        <p
          v-if="feedback[index]"
          :class="{
            'mission__feedback': feedback[index] === 'Goed!',
            'mission__feedback is-error': feedback[index] === 'Fout, probeer opnieuw.'
          }"
        >
          {{ feedback[index] }}
        </p>

        <button class="btn" @click="checkQuestion(index)">Check antwoord</button>
        <hr />
      </div>
    </section>

    <!-- CODE ZICHTBAAR NA ALLE GOEDE ANTWOORDEN -->
    <section class="mission__panel card" v-if="questionsCompleted">
      <h2 class="section-heading">Geheime code</h2>

      <p class="section-subtext">Je hebt alle vragen goed! De geheime code is:</p>

      <p class="mission__feedback"><strong>{{ correctCode }}</strong></p>

      <div class="mission__code-group">
        <input
          v-model="enteredCode"
          type="text"
          placeholder="Voer de geheime code in"
          maxlength="10"
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
      heroImage: new URL('@/assets/sneeuwuil.png', import.meta.url).href,

      questions: [
        {
          question: "Op welke MBO ben je momenteel",
          options: ["Nova College", "Navo College", "Neo College"],
          correct: "Nova College"
        },
        {
          question: "Op welke afdeling ben je momenteel?",
          options: ["Beheer", "Smart ICT", "Software Development"],
          correct: "Smart ICT"
        },
        {
          question: "Waar staat IoT voor?",
          options: ["Internet of Things", "Internet of Time", "Internet of Technology"],
          correct: "Internet of Things"
        }
      ],

      userAnswers: ["", "", ""],
      feedback: ["", "", ""],
      questionsCompleted: false,

      correctCode: "SMART",
      enteredCode: "",
      errorMessage: "",
      successMessage: "",

      gameStore: useGameStore(),
      router: useRouter()
    };
  },

  methods: {
    checkQuestion(index) {
      if (this.userAnswers[index] === this.questions[index].correct) {
        this.feedback[index] = "Goed!";
      } else {
        this.feedback[index] = "Fout, probeer opnieuw.";
        this.userAnswers[index] = "";
        return;
      }

      if (this.feedback.every(f => f === "Goed!")) {
        this.questionsCompleted = true;
      }
    },

    // 🔥 EXACT JOUW FIRESTORE LOGICA (ALLEEN aangepast naar game1/game2 waar nodig)
    async checkCode() {
      if (this.enteredCode.toUpperCase() === this.correctCode) {
        this.errorMessage = "";
        this.successMessage = "Goed gedaan agent! Je weet waar je bent en wat je hier doet!";
        this.gameStore.completeGame("game1completed");

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

            const gameRef = doc(db, "games", "game1");
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
/* ✔ Jouw originele styling */
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
  display: grid;
  gap: 0.75rem;
}

/* ✔ Nieuwe styling voor opties met iconen */
.mission__option {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.8rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  cursor: pointer;
  gap: 0.75rem;
  transition: 0.2s;
}

.mission__option:hover {
  background: rgba(255, 255, 255, 0.12);
}

.mission__option--selected {
  background: rgba(255, 255, 255, 0.15);
}

.mission__option--correct {
  background: rgba(0, 200, 0, 0.18);
  border-color: var(--success-color);
  color: var(--success-color);
}

.mission__option--wrong {
  background: rgba(255, 0, 0, 0.18);
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.mission__icon {
  width: 22px;
  display: flex;
  justify-content: center;
}

/* Feedback messages */
.mission__feedback {
  margin: 0;
  color: var(--success-color);
  font-weight: 600;
}

.mission__feedback.is-error {
  color: var(--danger-color);
}

.mission__code-group {
  display: flex;
  gap: 0.75rem;
}
</style>