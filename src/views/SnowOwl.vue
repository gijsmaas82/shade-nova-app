<template>
  <div class="container">
    <!-- Als er geen speler in de store is, toon de pop-ups -->
    <div v-if="!gameStore.playerName && showPopup" class="popup">
      <h2>{{ popups[popupIndex].title }}</h2>
      <img :src="popups[popupIndex].img" alt="Popup image" />
      <p>{{ popups[popupIndex].text }}</p>
      <div class="navbuttons">
        <button v-if="popupIndex !== 0" @click="nextPopup">Vorige</button>
        <button v-if="popupIndex !== popups.length - 1" @click="nextPopup">Volgende</button>
      </div>
      <input v-if="popups[popupIndex].input" v-model="playerName" class="word-input"
              placeholder="Jouw naam" />
      <button v-if="popupIndex === popups.length - 1" @click="startGame">Start Spel</button>
    </div>

    <!-- Als er een speler is, toon de beschikbare spellen -->
    <div v-if="gameStore.playerName" class="game-board">
      <h1>Selecteer een spel</h1>
      <p>Klik hieronder op een beschikbare tegel. Je krijgt dan instructies over waar je de game kan spelen. Wanneer een spel bezet is of als je het spel al hebt gedaan wordt de tegel uitgezet. Lukt het jou om de kluis te openen?</p>
      <div 
        v-for="(tile, index) in tiles" 
        :key="index" 
        :class="['tile', { 'disabled': !tile.available }]" 
        @click="selectGame(index)">
        <h2>{{ tile.title }}</h2>
        <p>Skill: {{  tile.skill }}</p>
        <img :src="tile.img" alt="Popup image" />
      </div>

      <div v-if="allGamesCompleted" class="popup completed-popup">
        <h2>Gefeliciteerd, Agent!</h2>
        <img src="@/assets/sneeuwuil.png" alt="Gefeliciteerd" />
        <p>Je hebt alle spellen voltooid en bent nu officieel een S.H.A.D.E. agent!</p>
        <p>De code om de kluis te openen is: 404</p>
        <button @click="gameStore.clearPlayer()">Opnieuw spelen</button>
      </div>

      <!-- 🔹 Developer Reset Button -->
      <button @click="resetGames" class="reset-button">
        Reset Spellen
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
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
      { title: "Welkom!", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Wanneer je dit leest betekent het dat je bent uitgenodigd voor de ultieme test! Doorsta jij de nacht van de sneeuwuil?" },
      { title: "Wat is S.H.A.D.E!", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "S.H.A.D.E is een geheim genootschap en is op zoek naar nieuwe leden. Agenten van S.H.A.D.E werken in het geheim aan de digitale bescherming van onze democratische instituties. Wij zijn een groep van ethische hackers." },
      { title: "De nacht van de sneeuwuil.", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Om toegelaten te worden tot S.H.A.D.E. moet je een initiatietest doen. De nacht van de sneeuwuil! Do you have what it takes to become a S.H.A.D.E. agent?" },
      { title: "Hoe werkt het?", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Zo meteen krijg je instructies om op verschillende plekken op het leerplein games te spelen. Elke game staat in het teken van een skill die je moet tonen om toegelaten te worden. Je speelt vijf spellen en verzamelt codes. De codes voer je in in deze website. Heb je alle codes dan mag jij de kluis openen en jezelf een S.H.A.D.E. agent noemen." },
      { title: "Jouw naam", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Vul eerst je naam in! Daarna kan je op de startknop drukken en dan begint jouw nacht van de sneeuwuil!", input: true }
    ]);

    // Spellen beschikbaarheid
    const tiles = ref([
      { id: 1, name: "Spel 1", img: new URL('@/assets/dimensions-collapsing.png', import.meta.url).href, title: "Dimensions collapsing", skill: "Ruimtelijk inzicht", available: true },
      { id: 2, name: "Spel 2", img: new URL('@/assets/agent-fromage.png', import.meta.url).href, title: "Agent Fromage", skill: "Vingervlugheid", available: true },
      { id: 3, name: "Spel 3", img: new URL('@/assets/laser-lockdown.png', import.meta.url).href, title: "Laser Lockdown", skill: "Precisie", available: true },
      { id: 4, name: "Spel 4", img: new URL('@/assets/feel-it.png', import.meta.url).href, title: "Feel IT", skill: "Presteren onder druk", available: true },
      { id: 5, name: "Spel 5", img: new URL('@/assets/dead-body.png', import.meta.url).href, title: "Murder mystery", skill: "Deductie", available: true }
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
    const allGamesCompleted = computed(() => {
      const progress = gameStore.gameProgress || {};
      return [
        progress.game1completed,
        progress.game2completed,
        progress.game3completed,
        progress.game4completed,
        progress.game5completed
      ].every(Boolean);
    });
    let statusInterval;
    onMounted(() => {
      
      gameStore.loadProgress(); // Laad de voortgang uit Firestore & localStorage
      fetchGameStatus();
      statusInterval = setInterval(fetchGameStatus, 2000);
    });

    onBeforeUnmount(() => {
      clearInterval(statusInterval);
    });

    return { showPopup, popupIndex, popups, nextPopup, tiles, selectGame, resetGames, startGame, gameStore, playerName, allGamesCompleted };
  }
};
</script>

<style scoped>
.container {
  margin-top: 5vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Zorgt ervoor dat de inhoud niet geforceerd in het midden blijft */
  background: #111;
  color: #fff;
  font-family: "Orbitron", sans-serif;
  overflow: auto; /* Maakt scrollen mogelijk als de inhoud te groot is */
  padding-bottom: 50px; /* Extra ruimte onderaan voor betere scrollervaring */
}

.popup {
  /* font-family: 'Creepster', cursive; */
  margin-top: 5vh;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 0 10px #fff;
  max-width: 80vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.popup h2 {
  font-family: 'Sixtyfour Convergence', sans-serif;
}
.popup p {
  font-family: 'Creepster', cursive;
  font-size: 1.5rem;
}
.popup img {
  width: 200px;
  margin: 10px 0;
}
.completed-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 0 15px #fff;
}

.completed-popup img {
  width: 200px;
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
  max-width: 90%;
}

button {
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
}

button:hover {
  background: #555;
}

.game-board {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.game-board h1 {
  font-family: 'Sixtyfour Convergence', sans-serif;
}
.game-board p {
  font-family: 'Creepster', cursive;
  margin: 10px; 
}
.tile {
  width: 70vw;
  padding: 15px;
  text-align: center;
  background: linear-gradient(135deg, #666, #222);
  border: 2px solid #fff;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s;
}

.tile h2 {
  font-family: 'Creepster', cursive;
  /* margin-top: 20px; */
  padding: 10px 20px;
  font-size: 1.5rem;
  font-weight: bold;
}
.tile p {
  font-family: 'Creepster', cursive;
  font-size: 1rem;
  font-weight: bold;
}

.tile img {
  width: 200px;
  margin: 10px 0;
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
