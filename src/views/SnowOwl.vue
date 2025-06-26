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
     <div v-if="gameStore.playerName" class="vault-code">
      <h3>Code kluis:</h3>
      <div class="vault-circle-layout">
        <div class="circle" :style="getCircleStyle(0)">{{ visibleVaultCode[2] }}</div>
        <div class="circle" :style="getCircleStyle(1)">{{ visibleVaultCode[3] }}</div>
        <div class="circle" :style="getCircleStyle(2)">{{ visibleVaultCode[4] }}</div>
        <div class="circle" :style="getCircleStyle(3)">{{ visibleVaultCode[0] }}</div>
        <div class="circle" :style="getCircleStyle(4)">{{ visibleVaultCode[1] }}</div>
      </div>
    </div>



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
        <p>De code om de kluis te openen is.</p>
        <div class="vault-circle-layout">
          <div class="circle" :style="getCircleStyle(0)">{{ visibleVaultCode[2] }}</div>
          <div class="circle" :style="getCircleStyle(1)">{{ visibleVaultCode[3] }}</div>
          <div class="circle" :style="getCircleStyle(2)">{{ visibleVaultCode[4] }}</div>
          <div class="circle" :style="getCircleStyle(3)">{{ visibleVaultCode[0] }}</div>
          <div class="circle" :style="getCircleStyle(4)">{{ visibleVaultCode[1] }}</div>
        </div>
        <button @click="gameStore.clearPlayer()">Opnieuw spelen</button>
      </div>

      <button 
        v-if="gameStore.playerName" 
        @click="gameStore.clearPlayer(); showPopup = true; popupIndex = 0; playerName = ''" 
        class="switch-player-button">
        Wissel van speler
      </button>

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
    const vaultCode = ref(''); // Volledige 5-cijferige code


    // Pop-up configuraties
    const popups = ref([
      { title: "Welkom!", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Wanneer je dit leest betekent het dat je bent uitgenodigd voor de ultieme test! Doorsta jij de nacht van de sneeuwuil?" },
      { title: "Wat is S.H.A.D.E!", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "S.H.A.D.E is een geheim genootschap en is op zoek naar nieuwe leden. Agenten van S.H.A.D.E werken in de schaduw aan de digitale bescherming van onze democratische instituties." },
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

    const getCircleStyle = (index) => {
      const angle = (index / 5) * 2 * Math.PI - Math.PI / 2; // Start bovenaan
      const radius = 80; // Straal van de grote cirkel in px
      const centerX = 100;
      const centerY = 100;

      const x = centerX + radius * Math.cos(angle) - 25; // -25 = halve breedte circle
      const y = centerY + radius * Math.sin(angle) - 25;

      return {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: '50px',
        height: '50px',
        border: '2px solid white',
        borderRadius: '50%',
        backgroundColor: '#111',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '1.6rem',
        fontWeight: 'bold'
      };
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

      gameStore.setPlayerName(playerName.value);

      const code = await getRandomVaultCode();
      if (!code) {
        alert("Kon geen kluiscode ophalen. Probeer opnieuw.");
        return;
      }

      vaultCode.value = code; // Lokale waarde bijhouden (optioneel)
      gameStore.vaultCode = code;
      localStorage.setItem("vaultCode", code);

      try {
        const gameInstanceRef = collection(db, "gameinstances");

        await addDoc(gameInstanceRef, {
          name: gameStore.playerName,
          start: serverTimestamp(),
          vaultCode: code,
          game1completed: false,
          game2completed: false,
          game3completed: false,
          game4completed: false,
          game5completed: false
        });

        showPopup.value = false;
        // console.log("Game gestart met code:", code);
      } catch (error) {
        console.error("Fout bij opslaan gameinstance:", error);
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

    const getRandomVaultCode = async () => {
      try {
        const docRef = doc(db, "vaultcodes", "codes");
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const allCodes = snapshot.data().codesArray;
          const randomIndex = Math.floor(Math.random() * allCodes.length);
          return allCodes[randomIndex];
        } else {
          console.error("vaultcodes/codes niet gevonden!");
          return null;
        }
      } catch (err) {
        console.error("Fout bij ophalen vaultcodes:", err);
        return null;
      }
    };

    const visibleVaultCode = computed(() => {
      const fullCode = gameStore.vaultCode || '';
      if (!fullCode || fullCode.length !== 5) return '*****';

      const progress = gameStore.gameProgress || {};
      const completedCount = [
        progress.game1completed,
        progress.game2completed,
        progress.game3completed,
        progress.game4completed,
        progress.game5completed
      ].filter(Boolean).length;

      return fullCode
        .split('')
        .map((char, index) => (index < completedCount ? char : '*'))
        .join('');
    });

    let statusInterval;
    onMounted(() => {
      const savedName = localStorage.getItem("playerName");

      if (savedName) {
        gameStore.playerName = savedName;
        gameStore.loadProgress();
        showPopup.value = false; // 👈 verberg introductie als speler al bekend is
      }

      fetchGameStatus();
      statusInterval = setInterval(fetchGameStatus, 2000);
    });

    onBeforeUnmount(() => {
      clearInterval(statusInterval);
    });

    return { showPopup, popupIndex, popups, nextPopup, tiles, selectGame, resetGames, startGame, gameStore, playerName, allGamesCompleted, visibleVaultCode, vaultCode, getCircleStyle };
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
.vault-code {
  margin-top: 20px;
  text-align: center;
  font-size: 1.8rem;
  letter-spacing: 0.5rem;
  font-family: 'Orbitron', sans-serif;
}

.code-display {
  font-size: 2.2rem;
  font-weight: bold;
  background: #222;
  border: 2px solid #fff;
  border-radius: 8px;
  padding: 10px 20px;
  margin-top: 10px;
  display: inline-block;
}
.vault-code {
  margin: 20px;
  text-align: center;
  font-family: 'Orbitron', sans-serif;
}

.vault-circle-layout {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  padding: 10px;
}

.circle {
  position: absolute;
  width: 50px;
  height: 50px;
  border: 2px solid white;
  border-radius: 50%;
  background-color: #111;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.6rem;
  font-weight: bold;
  margin: 10px;
}

/* Posities volgens de afbeelding */
.circle-1 {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
.circle-2 {
  bottom: 40px;
  left: 0;
}
.circle-3 {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}
.circle-4 {
  bottom: 40px;
  right: 0;
}
.circle-5 {
  bottom: 0;
  right: 0;
}

.switch-player-button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #333;
  color: white;
  border: 2px solid #fff;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.switch-player-button:hover {
  background: #555;
}



</style>
