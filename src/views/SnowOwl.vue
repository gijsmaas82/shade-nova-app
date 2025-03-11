<template>
  <div class="container">
    <div v-if="showPopup" class="popup">
      <h2>{{ popups[popupIndex].title }}</h2>
      <img :src="popups[popupIndex].img" alt="Popup image" />
      <p>{{ popups[popupIndex].text }}</p>
      <button @click="nextPopup">Volgende</button>
    </div>

    <div v-if="!showPopup" class="game-board">
      <h1>Selecteer een spel</h1>
      <div 
        v-for="(tile, index) in tiles" 
        :key="index" 
        :class="['tile', { 'disabled': !tile.available }]" 
        @click="selectGame(index)">
        {{ tile.name }}
      </div>

      <!-- 🔹 Developer Reset Button -->
      <button @click="resetGames" class="reset-button">
        Reset Spellen
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useRouter } from 'vue-router';

export default {
  setup() {
    const showPopup = ref(true);
    const popupIndex = ref(0);
    const router = useRouter();

    const popups = ref([
      { title: "Welkom!", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Dit is het begin van je avontuur!" },
      { title: "Hoe werkt het?", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Je speelt vijf spellen en verzamelt codes." },
      { title: "Klaar?", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Klik op een tegel om een spel te starten!" }
    ]);

    const tiles = ref([
      { name: "Spel 1", available: false },
      { name: "Spel 2", available: false },
      { name: "Spel 3", available: false },
      { name: "Spel 4", available: false },
      { name: "Spel 5", available: false }
    ]);

    const nextPopup = () => {
      if (popupIndex.value < popups.value.length - 1) {
        popupIndex.value++;
      } else {
        showPopup.value = false;
      }
    };

    const fetchGameStatus = async () => {
      const querySnapshot = await getDocs(collection(db, "games"));
      let index = 0;

      querySnapshot.forEach((doc) => {
        if (tiles.value[index]) {
          tiles.value[index].available = doc.data().available;
        }
        index++;
      });
    };

    const selectGame = async (index) => {
      if (tiles.value[index].available) {
        console.log(`Spel ${index + 1} gestart`);

        const gameRef = doc(db, "games", `game${index + 1}`);

        try {
          await updateDoc(gameRef, { available: false });
          tiles.value[index].available = false;
          console.log(`Spel ${index + 1} is nu bezet`);
          router.push(`game${index + 1}`);
        } catch (error) {
          console.error("Fout bij het bijwerken van het spel:", error);
        }
      }
    };

    // 🔹 Reset alle spellen in Firestore naar available: true
    const resetGames = async () => {
      try {
        for (let i = 1; i <= tiles.value.length; i++) {
          const gameRef = doc(db, "games", `game${i}`);
          await updateDoc(gameRef, { available: true });
        }
        console.log("Alle spellen zijn gereset.");

        // 🔹 Lokale UI updaten
        tiles.value.forEach(tile => tile.available = true);
      } catch (error) {
        console.error("Fout bij het resetten van de spellen:", error);
      }
    };

    onMounted(fetchGameStatus);

    return { showPopup, popupIndex, popups, nextPopup, tiles, selectGame, resetGames };
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #111;
  color: #fff;
  font-family: "Orbitron", sans-serif;
}

.popup {
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 0 10px #fff;
}

.popup img {
  width: 200px;
  margin: 10px 0;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  background: #333;
  color: #fff;
  border: none;
  cursor: pointer;
}

button:hover {
  background: #555;
}

.game-board {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.tile {
  width: 200px;
  padding: 15px;
  text-align: center;
  background: linear-gradient(135deg, #666, #222);
  border: 2px solid #fff;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.tile:hover {
  background: linear-gradient(135deg, #888, #444);
}

.tile.disabled {
  background: #444;
  cursor: not-allowed;
  opacity: 0.5;
}

/* 🔹 Stijl voor Reset-knop */
.reset-button {
  margin-top: 20px;
  padding: 12px 24px;
  font-size: 1rem;
  background: red;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.reset-button:hover {
  background: darkred;
}
</style>
