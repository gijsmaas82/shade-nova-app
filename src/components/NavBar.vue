<template>
  <nav class="navbar">
    <div v-if="gameStore.playerName" class="player-info">
      👤 {{ gameStore.playerName }}
    </div>
    <div v-if="gameStore.playerName" class="game-progress">
      🎮 {{ completedGames }}/5 spellen voltooid
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useGameStore } from "../stores/gameStore";

export default {
  setup() {
    const gameStore = useGameStore();

    // Bereken het aantal voltooide spellen
    const completedGames = computed(() => {
      const progress = gameStore.gameProgress || {}; // Voorkom undefined errors
      return [
        progress.game1completed,
        progress.game2completed,
        progress.game3completed,
        progress.game4completed,
        progress.game5completed
      ].filter(Boolean).length;
    });

    let interval = ref(null);
    
    onMounted(() => {
      // 🚀 Elke 3 seconden checken of er een update is
      interval.value = setInterval(() => {
        gameStore.loadProgress(); // 🔄 Ophalen van nieuwe data
      }, 3000);
    });

    onUnmounted(() => {
      clearInterval(interval.value); // ❌ Voorkom geheugenlekken
    });

    return { gameStore, completedGames };
  },
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  background: rgba(0, 0, 0, 0.8); /* Transparante achtergrond */
  backdrop-filter: blur(5px); /* Luxe blurry effect */
  z-index: 1000;
  height: 60px; /* Zorgt ervoor dat er altijd een navbar is, ook als deze leeg is */
}

.player-info {
  margin-left: 20px;
}

.game-progress {
  margin-right: 20px;
}
</style>
