<template>
  <div class="container">
    <!-- Als er geen speler in de store is, toon de pop-ups -->
    <div v-if="!gameStore.playerName && showPopup" class="popup">
      <h2>{{ popups[popupIndex].title }}</h2>
      <img :src="popups[popupIndex].img" alt="Popup image" />
      <p>{{ popups[popupIndex].text }}</p>
      <button @click="nextPopup">Volgende</button>
      <input v-if="popups[popupIndex].input" v-model="playerName" 
              placeholder="Jouw naam" />
      <button v-if="popupIndex === popups.length - 1" @click="startGame">Start Spel</button>
    </div>

    <!-- Als er een speler is, toon de beschikbare spellen -->
    <div v-if="gameStore.playerName" class="game-board">
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { db } from "../firebase";
import { collection, getDoc, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from 'vue-router';
import { useGameStore } from "../stores/gameStore";

export default {
  setup() {
    const showPopup = ref(true); // Popup zichtbaar wanneer er nog geen speler is
    const popupIndex = ref(0);
    const router = useRouter();
    const gameStore = useGameStore();
    const playerName = ref(''); // Maak een reactive waarde voor de naam

    // Pop-up configuraties
    const popups = ref([
      { title: "Welkom!", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Dit is het begin van je avontuur!" },
      { title: "Hoe werkt het?", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Je speelt vijf spellen en verzamelt codes." },
      { title: "Jouw naam", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Vul je naam in om te beginnen!", input: true }
    ]);

    // Spellen beschikbaarheid
    const tiles = ref([
      { name: "Spel 1", available: true },
      { name: "Spel 2", available: true },
      { name: "Spel 3", available: true },
      { name: "Spel 4", available: true },
      { name: "Spel 5", available: true }
    ]);

    // Ga naar de volgende popup
    const nextPopup = () => {
      if (popupIndex.value < popups.value.length - 1) {
        popupIndex.value++;
      }
    };

    // Haal de beschikbaarheid van spellen uit Firestore
    const fetchGameStatus = async () => {
      // Itereer over de tiles (5 spellen in dit geval)
      for (let i = 1; i <= tiles.value.length; i++) {
        // Haal het game document op voor elk spel
        const gameRef = doc(db, "games", `game${i}`);
        const gameDoc = await getDoc(gameRef);

        if (gameDoc.exists()) {
          const isAvailable = gameDoc.data().available;  // Verkrijg beschikbaarheid vanuit Firestore

          // Verkrijg voortgang van de speler uit de Pinia store
          const isCompletedByPlayer = gameStore.gameProgress[`game${i}completed`];
          // console.log(`Game ${i} completed by player: ${isCompletedByPlayer}`);

          // Alleen beschikbaar als Firestore "available: true" én speler heeft het spel nog niet afgerond
          tiles.value[i - 1].available = isAvailable && !isCompletedByPlayer;

          // Log de status van de tegel
          // console.log(`Tile ${i} available status: ${tiles.value[i - 1].available}`);
        } else {
          console.error(`Game ${i} bestaat niet in Firestore!`);
        }
      }
    };

    // Selecteer een spel om te starten
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

    // Start het spel als naam is ingevuld
    const startGame = async () => {
      if (!playerName.value) {
        alert("Voer een naam in om te starten!");
        return;
      }

      // Zet de naam pas wanneer op startGame wordt geklikt
      gameStore.setPlayerName(playerName.value);

      try {
        const gameInstanceRef = collection(db, "gameinstances");

        await addDoc(gameInstanceRef, {
          name: gameStore.playerName, // Gebruik de naam uit de store
          start: serverTimestamp(),
          game1completed: false,
          game2completed: false,
          game3completed: false,
          game4completed: false,
          game5completed: false
        });

        // Verberg de pop-up pas nadat de naam is ingesteld en het spel is gestart
        showPopup.value = false;
        console.log("Game gestart en opgeslagen in Firestore!");

      } catch (error) {
        console.error("Fout bij opslaan van gameinstance:", error);
      }
    };

    // Reset alle spellen naar 'available: true'
    const resetGames = async () => {
      try {
        for (let i = 1; i <= tiles.value.length; i++) {
          const gameRef = doc(db, "games", `game${i}`);
          await updateDoc(gameRef, { available: true });
        }
        console.log("Alle spellen zijn gereset.");

        // Lokale UI updaten
        tiles.value.forEach(tile => tile.available = true);
      } catch (error) {
        console.error("Fout bij het resetten van de spellen:", error);
      }
    };
    let statusInterval;
    onMounted(() => {
      
      gameStore.loadProgress(); // Laad de voortgang uit Firestore & localStorage
      fetchGameStatus();
      statusInterval = setInterval(fetchGameStatus, 2000);
    });

    onBeforeUnmount(() => {
      clearInterval(statusInterval);
    });

    return { showPopup, popupIndex, popups, nextPopup, tiles, selectGame, resetGames, startGame, gameStore, playerName };
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
