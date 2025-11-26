<template>
  <header ref="navbarRef" class="navbar" :class="{ 'navbar--active': gameStore.playerName }">
    <div class="navbar__brand">
      <div class="navbar__logo shadow-ring">
        <img :src="logo" alt="S.H.A.D.E logo" />
      </div>
      <div class="navbar__copy">
        <span class="navbar__eyebrow">S.H.A.D.E</span>
        <span class="navbar__title">Agent Console</span>
      </div>
    </div>

    <div v-if="gameStore.playerName" class="navbar__status">
      <div class="navbar__agent">
        <span class="navbar__avatar">{{ playerInitial }}</span>
        <div>
          <p class="navbar__label">Ingelogd als</p>
          <p class="navbar__name">{{ gameStore.playerName }}</p>
        </div>
      </div>

      <div class="navbar__progress">
        <div class="navbar__progress-bar">
          <span class="navbar__progress-fill" :style="{ width: progressPercent + '%' }"></span>
        </div>
        <p class="navbar__progress-text">{{ completedGames }} / 5 missies voltooid</p>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useGameStore } from "../stores/gameStore";
import logo from "@/assets/logo.png";

export default {
  setup() {
    const gameStore = useGameStore();
    const navbarRef = ref(null);
    let resizeObserver = null;

    const completedGames = computed(() => {
      const progress = gameStore.gameProgress || {};
      return [
        progress.game1completed,
        progress.game2completed,
        progress.game3completed,
        progress.game4completed,
        progress.game5completed
      ].filter(value => value === true).length;
    });

    const progressPercent = computed(() => Math.round((completedGames.value / 5) * 100));

    const playerInitial = computed(() => {
      if (!gameStore.playerName) return "?";
      return gameStore.playerName.charAt(0).toUpperCase();
    });

    const intervalId = ref(null);

    const updateNavbarHeight = () => {
      if (navbarRef.value) {
        document.documentElement.style.setProperty("--navbar-height", `${navbarRef.value.offsetHeight}px`);
      }
    };

    onMounted(() => {
      nextTick(() => {
        updateNavbarHeight();
        resizeObserver = new ResizeObserver(() => updateNavbarHeight());
        if (navbarRef.value) {
          resizeObserver.observe(navbarRef.value);
        }
      });

      intervalId.value = setInterval(() => {
        gameStore.loadProgress();
      }, 3000);
    });

    onUnmounted(() => {
      clearInterval(intervalId.value);
      if (resizeObserver && navbarRef.value) {
        resizeObserver.disconnect();
      }
    });

    return { gameStore, completedGames, progressPercent, playerInitial, logo, navbarRef };
  },
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  background: linear-gradient(135deg, rgba(14, 18, 33, 0.92), rgba(21, 26, 48, 0.92));
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 18px 40px rgba(4, 7, 22, 0.55);
  z-index: 1000;
}

.navbar--active {
  border-bottom-color: rgba(124, 92, 255, 0.24);
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.navbar__logo {
  width: 42px;
  height: 42px;
  border-radius: 18px;
  background: rgba(124, 92, 255, 0.15);
  display: grid;
  place-items: center;
  border: 1px solid rgba(124, 92, 255, 0.3);
  padding: 8px;
}

.navbar__logo img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.navbar__copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.navbar__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(244, 246, 255, 0.6);
}

.navbar__title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  letter-spacing: 0.04em;
}

.navbar__status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar__agent {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.05);
}

.navbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(124, 92, 255, 0.15);
  display: grid;
  place-items: center;
  color: var(--accent-color);
  font-weight: 700;
  font-size: 1rem;
}

.navbar__label {
  margin: 0;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(244, 246, 255, 0.6);
}

.navbar__name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.navbar__progress {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 150px;
}

.navbar__progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

.navbar__progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(90deg, var(--accent-strong), #4ae6f7);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.navbar__progress-text {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(244, 246, 255, 0.7);
  letter-spacing: 0.04em;
}

@media (max-width: 720px) {
  .navbar {
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 14px 16px;
  }

  .navbar__brand {
    flex: 1 1 auto;
  }

  .navbar__status {
    flex: 1 1 auto;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: auto;
  }

  .navbar__agent {
    padding: 0.45rem 0.7rem;
  }

  .navbar__progress {
    flex: 0 1 140px;
    min-width: 0;
  }

  .navbar__progress-text {
    display: none;
  }

  .navbar__label {
    display: none;
  }
}
</style>


