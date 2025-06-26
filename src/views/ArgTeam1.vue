<template>
  <div class="game-container">
    <div class="stars"></div>
    <div class="twinkling"></div>
    
    <div class="game-header">
      <h1 class="title">Dimensions collapsing</h1>
      <div class="instructions">
        <p>Loop naar het grote digibord op het leerplein om te beginnen met het spel</p>
        <p>Op het digibord staat een digitale versie van ons leerplein.</p>
        <p class="instruction-detail">Zoek de verschillen tussen het spel en de echte wereld. Vind de 5 verborgen letters in de echte wereld! De gevonden letters kan je opslaan hieronder. Uiteindelijk moet je een woord maken van de 5 letters.</p>
      </div>
      <!-- <div class="game-images">
        <img :src="gameimages[0]" class="gameimage" />
        <img :src="gameimages[1]" class="gameimage" />
      </div> -->
    </div>

    <div class="letter-progress">
      <div class="letter-boxes">
        <div v-for="(letter, index) in letters" 
             :key="index" 
             class="letter-box"
             :class="{ 'found': letter !== '', 'pulse': letter !== '' && justFound === index }">
          <input v-model="letters[index]" 
                 class="letter-input" 
                 maxlength="1" 
                 @input="moveToNext(index, $event)"
                 @keydown.backspace="moveToPrevious(index, $event)"
                 ref="inputs" />
          <div class="glow-effect" v-if="letter !== ''"></div>
        </div>
      </div>
    </div>
    
    <div class="word-submission">
      <div class="word-submission-header">
        <h2 class="section-title">Maak het woord</h2>
        <!-- Progress bar moved here -->
        <div class="progress-status">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (lettersFound / letters.length * 100) + '%' }"></div>
          </div>
          <span class="found-count">{{ lettersFound }} / {{ letters.length }}</span> letters gevonden
        </div>
      </div>
      
      <div class="word-input-container">
        <input v-model="wordInput" 
               class="word-input" 
               placeholder="Typ hier je woord" 
               maxlength="5"
               @keyup.enter="checkWord" />
        <button @click="checkWord" class="check-button">
          <span class="button-text">Controleer</span>
          <span class="button-icon">➔</span>
        </button>
      </div>
    </div>
    
    <transition name="fade">
      <div v-if="message" class="result-modal" :class="{'correct': isCorrect, 'incorrect': !isCorrect}">
        <div class="result-container">
          <div class="result-icon" v-if="isCorrect">
            <div class="firework" v-for="n in 5" :key="n"></div>
            ✓
          </div>
          <div class="result-icon" v-else>✗</div>
          <div class="result-message">{{ message }}</div>
          <button @click="closeMessage" class="close-result">Sluiten</button>
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
      justFound: null,
      confetti: null,
      gameStore: useGameStore(), // 🔹 Pinia store
      router: useRouter(), // 🔹 Vue Router
      gameimages: [new URL('@/assets/game1/digitaltwin1.png', import.meta.url).href, new URL('@/assets/game1/digitaltwin2.png', import.meta.url).href]
    };
  },
  computed: {
    lettersFound() {
      return this.letters.filter(letter => letter !== "").length;
    }
  },
  mounted() {
    this.initializeStarField();
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
        this.gameStore.saveProgress(); // Bewaar in LocalStorage

        // 🔹 Zoek Firestore document op basis van playerName
        try {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(gameInstanceRef, where("name", "==", this.gameStore.playerName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Haal het eerste document op (aangezien je verwacht dat er maar één match is)
            const playerDoc = querySnapshot.docs[0];
            await updateDoc(playerDoc.ref, { game1completed: true });
            console.log("Game 1 voortgang opgeslagen in Firestore! ✅");

             // 🔹 Zet het spel weer op 'beschikbaar' in de games-collectie
            const gameRef = doc(db, "games", "game1");
            await updateDoc(gameRef, { available: true });
            console.log("Game 1 opnieuw beschikbaar gemaakt in Firestore! 🔓");
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
        this.message = "Dat is niet het juiste woord. Probeer het nog eens!";
        this.isCorrect = false;
        this.shakeWordInput();
      }
    },
    moveToNext(index, event) {
      if (event.inputType === "insertText" && event.data) {
        // Play sound effect
        this.playLetterSound();
        
        // Add animation
        this.justFound = index;
        setTimeout(() => {
          this.justFound = null;
        }, 2000);
        
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
        this.$router.push('/');
      }
    },
    triggerConfetti() {
      // Create confetti canvas
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
      
      // Create confetti pieces
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
      
      // Animate confetti
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
      const input = document.querySelector('.word-input');
      input.classList.add('shake');
      setTimeout(() => {
        input.classList.remove('shake');
      }, 500);
    },
    playLetterSound() {
      // Create audio context and oscillator
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 440 + Math.random() * 220; // Random tone
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        
        // Fade out
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        
        // Stop after fade out
        setTimeout(() => {
          oscillator.stop();
        }, 300);
      } catch (e) {
        console.log('Audio not supported');
      }
    },
    initializeStarField() {
      const stars = document.querySelector('.stars');
      
      // Add stars
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 10}s`;
        star.style.animationDuration = `${Math.random() * 3 + 1}s`;
        stars.appendChild(star);
      }
    }
  }
};
</script>

<style scoped>
.game-container {
  margin-top: 5vh;
  font-family: 'Montserrat', sans-serif;
  background-color: #000000;
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  color: #ecf0f1;
  position: relative;
  overflow: hidden;
}

/* Stars background */
.stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background-color: white;
  border-radius: 50%;
  opacity: 0.7;
  animation: twinkle ease infinite;
}

@keyframes twinkle {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.twinkling {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  background: linear-gradient(125deg, rgba(0,0,0,0.8) 0%, rgba(20,20,40,0.8) 100%);
}

.game-header {
  text-align: center;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 800px;
  position: relative;
  z-index: 1;
}
.gameimages {
  display: flex;
  flex-direction: column;
}
.gameimage {
  max-width: 80%;
  border:#000000;
  border-radius: 10px;
}
.title {
  font-size: 3rem;
  color: #ffffff;
  margin-bottom: 1rem;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(100, 100, 255, 0.4);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.6), 0 0 20px rgba(100, 100, 255, 0.4);
  }
  to {
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 0 30px rgba(100, 100, 255, 0.6);
  }
}

.instructions {
  background-color: rgba(44, 62, 80, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 100, 255, 0.2);
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(5px);
}

.instructions:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 100, 255, 0.3);
}

.instructions p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.instruction-detail {
  color: #bdc3c7;
  font-size: 0.95rem;
  margin-top: 0.75rem;
}

.letter-progress {
  width: 100%;
  max-width: 800px;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.letter-boxes {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.letter-box {
  position: relative;
  width: 80px;
  height: 80px;
  background-color: rgba(70, 70, 70, 0.7);
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.letter-box.found {
  background-color: rgba(100, 100, 200, 0.3);
  box-shadow: 0 8px 16px rgba(100, 100, 200, 0.3);
  transform: translateY(-5px);
}

.letter-box.pulse {
  animation: pulse 2s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.glow-effect {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
  top: -50%;
  left: -50%;
  opacity: 0;
  animation: glow-animation 2s ease infinite;
}

@keyframes glow-animation {
  0% { opacity: 0; }
  50% { opacity: 0.5; }
  100% { opacity: 0; }
}

.letter-input {
  width: 60px;
  height: 60px;
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  color: #ecf0f1;
  background: transparent;
  transition: all 0.3s ease;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
}

.letter-box.found .letter-input {
  border-color: #ffffff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

.letter-input:focus {
  outline: none;
  border-color: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

/* Progress status moved to word-submission-header */
.progress-status {
  font-size: 1rem;
  color: #bdc3c7;
  margin-left: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.progress-bar {
  width: 150px;
  height: 8px;
  background-color: rgba(50, 50, 50, 0.7);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #9b59b6);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.found-count {
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}

.word-submission {
  width: 100%;
  max-width: 800px;
  background-color: rgba(70, 70, 70, 0.7);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 1;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(5px);
}

.word-submission:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(100, 100, 255, 0.2);
}

/* New header section for word submission with progress bar */
.word-submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  color: #ffffff;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
}

.word-input-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.word-input {
  flex: 1;
  padding: 1rem 1.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  border: 3px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  background-color: rgba(26, 26, 26, 0.6);
  color: #ecf0f1;
}

.word-input:focus {
  outline: none;
  border-color: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.word-input.shake {
  animation: shake 0.5s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Redesigned check button */
.check-button {
  padding: 0.8rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(155, 89, 182, 0.4);
  position: relative;
  overflow: hidden;
}

.button-text {
  margin-right: 0.5rem;
}

.button-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.check-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(155, 89, 182, 0.6);
  background: linear-gradient(135deg, #8e44ad, #6c3483);
}

.check-button:hover .button-icon {
  transform: translateX(3px);
}

.check-button:active {
  transform: translateY(0);
}

.result-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.result-container {
  background-color: rgba(70, 70, 70, 0.9);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.9); }
  to { transform: scale(1); }
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  position: relative;
}

.correct .result-icon {
  color: #ffffff;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
}

.incorrect .result-icon {
  color: #e74c3c;
  text-shadow: 0 0 15px rgba(231, 76, 60, 0.8);
}

.firework {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: firework 2s ease infinite;
  z-index: -1;
}

.firework:nth-child(1) {
  background-color: #ff3333;
  animation-delay: 0s;
}

.firework:nth-child(2) {
  background-color: #33ff33;
  animation-delay: 0.2s;
}

.firework:nth-child(3) {
  background-color: #3333ff;
  animation-delay: 0.4s;
}

.firework:nth-child(4) {
  background-color: #ffff33;
  animation-delay: 0.6s;
}

.firework:nth-child(5) {
  background-color: #ff33ff;
  animation-delay: 0.8s;
}

@keyframes firework {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(15);
    opacity: 0;
  }
}

.result-message {
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.correct .result-message {
  color: #ffffff;
}

.incorrect .result-message {
  color: #e74c3c;
}

.close-result {
  padding: 0.75rem 1.5rem;
  background-color: rgba(26, 26, 26, 0.6);
  color: #ecf0f1;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-result:hover {
  background-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .game-container {
    padding: 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .letter-box {
    width: 65px;
    height: 65px;
  }
  
  .letter-input {
    width: 50px;
    height: 50px;
    font-size: 1.7rem;
  }
  
  .word-submission-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .progress-status {
    margin-left: 0;
    margin-top: 1rem;
    align-items: flex-start;
  }
  
  .word-input-container {
    flex-direction: column;
  }
  
  .word-input {
    width: 100%;
    padding: 0.8rem;
    font-size: 1.3rem;
  }
  
  .check-button {
    width: 100%;
    padding: 0.8rem;
  }
}
</style>