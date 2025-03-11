<template>
    <div class="container">
      <div v-if="!transitionToShade" class="letters">
        <div v-for="(letter, index) in letters" :key="index" class="letter-wrapper">
          <span class="letter" :style="{ animationDelay: `${index * 0.5}s` }">
            {{ letter.char }}
          </span>
          <span class="word" :class="{ 'show-word': showWords }" :style="{ animationDelay: `${2 + index * 0.5}s` }">
            {{ letter.word }}
          </span>
        </div>
      </div>
      
      <div v-if="transitionToShade" class="shade-container fade-in">
        <h1 class="shade-title">S.H.A.D.E</h1>
        <button class="start-button" @click="startGame">Start Spel</button>
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
            }, 1000);
          }, 2000);
        }, 2500);
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
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: radial-gradient(circle, #222 30%, #111 100%);
    color: #ccc;
    font-family: 'Orbitron', sans-serif;
    transition: opacity 1s ease-in-out;
    margin: 0px;
  }
  .letters {
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
    animation: slide-in 0.7s forwards ease-in-out;
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
  .shade-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .shade-container.fade-in {
    opacity: 0;
    animation: fade-in 1.5s forwards ease-in-out;
  }
  .shade-title {
    font-size: 5rem;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  }
  .start-button {
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
  }
  .start-button:hover {
    background: linear-gradient(135deg, #666, #222);
  }
  </style>
  