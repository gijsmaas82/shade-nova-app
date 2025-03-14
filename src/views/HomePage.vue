<template>
  <div class="container">
    <div v-if="!transitionToShade" class="letters">
      <div v-for="(letter, index) in letters" :key="index" class="letter-wrapper">
        <span class="letter" :style="{ animationDelay: `${index * 0.8}s` }">
          {{ letter.char }}
        </span>
        <span class="word" :class="{ 'show-word': showWords }" :style="{ animationDelay: `${3 + index * 0.5}s` }">
          {{ letter.word }}
        </span>
      </div>
    </div>

    <div v-if="transitionToShade" class="shade-container fade-in">
      <h1 class="shade-title fade-up">S.H.A.D.E</h1>
      <h2 class="subtitle fade-in-delayed">Presents</h2>
      <h3 class="game-title fade-in-later">De Nacht van de Sneeuwuil</h3>
      <div class="button-wrapper fade-in-last">
        <img class="button-img" src="sneeuwuil.png"/>
        <button class="start-button " @click="startGame">Start Spel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const letters = ref([
      { char: 'S', word: 'ociety for the' },
      { char: 'H', word: 'idden' },
      { char: 'A', word: 'dvancement of' },
      { char: 'D', word: 'igital' },
      { char: 'E', word: 'ducation' }
    ]);
    const showWords = ref(false);
    const transitionToShade = ref(false);
    const router = useRouter();

    onMounted(() => {
      setTimeout(() => {
        showWords.value = true;
        setTimeout(() => {
          showWords.value = false;
          setTimeout(() => {
            transitionToShade.value = true;
          }, 1500); // Extra vertraging voordat de letters omhoog bewegen
        }, 3000);
      }, 4000);
    });

    const startGame = () => {
      console.log("Spel gestart");
      router.push("/snowowl");
    };

    return { letters, showWords, transitionToShade, startGame };
  }
};
</script>

<style scoped>
.container {
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(circle, #222 30%, #111 100%);
  color: #ccc;
  font-family: 'Orbitron', sans-serif;
  transition: opacity 1s ease-in-out;
}

.letters {
  font-family: 'Creepster', cursive;
  display: flex;
  flex-direction: column;
  align-items: start;
}

.letter-wrapper {
  display: flex;
  align-items: center;
  font-size: 4rem;
  font-weight: bold;
  text-transform: uppercase;
}

.letter {
  opacity: 0;
  transform: translateY(-50px);
  animation: slide-in 1s forwards ease-in-out;
}

@keyframes slide-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.word {
 
  opacity: 0;
  font-size: 1.5rem;
  margin-left: 1rem;
  color: #999;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  transition: opacity 1s ease-in-out;
  animation: fade-in 1s forwards ease-in-out;
}

@keyframes fade-in {
  to {
    opacity: 1;
  }
}

/* S.H.A.D.E verschijnt omhoog */
.shade-container {
  font-family: 'Creepster', cursive;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.shade-title {
 
  font-size: 4rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  opacity: 0;
  animation: fade-up 1.5s forwards ease-in-out 1s;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* "Presents" verschijnt eerst */
.subtitle {
  font-family: 'Sixtyfour Convergence', sans-serif;
  font-size: 2rem;
  color: #ffcc00;
  opacity: 0;
  animation: fade-in-delayed 1.5s forwards ease-in-out 2s;
}

@keyframes fade-in-delayed {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* "De Nacht van de Sneeuwuil" verschijnt later */
.game-title {
 
  font-size: 3rem;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
  opacity: 0;
  animation: fade-in-later 2s forwards ease-in-out 3s;
}

@keyframes fade-in-later {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.button-wrapper {
  animation: fade-in-last 2s forwards ease-in-out 5s;
  opacity: 0;
  background: linear-gradient(135deg, #444, #111);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.button-img {
  margin: 10px;
  border:#222;
  border-radius:10px;
  box-shadow: #00ffff;
  max-width: 80%;
}
/* Startknop komt als laatste */
.start-button {
  font-family: 'Sixtyfour Convergence', sans-serif;
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #444, #111);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
  margin: 10px;
  /* opacity: 0; */
  
}

@keyframes fade-in-last {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.start-button:hover {
  background: linear-gradient(135deg, #666, #222);
}
</style>
