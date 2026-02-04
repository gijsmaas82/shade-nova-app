<template>
  <div class="snowowl">
    <transition name="fade-scale">
      <section v-if="!gameStore.playerName && showPopup" class="snowowl__intro card surface-frosted">
        <div class="snowowl__intro-header">
          <span class="badge">Briefing {{ popupIndex + 1 }} / {{ popups.length }}</span>
          <div class="snowowl__intro-dots">
            <span v-for="(popup, index) in popups" :key="popup.title" :class="['snowowl__intro-dot', { 'is-active': index === popupIndex }]"></span>
          </div>
        </div>
        <img :src="popups[popupIndex].img" :alt="popups[popupIndex].title" class="snowowl__intro-image" />
        <h2>{{ popups[popupIndex].title }}</h2>
        <p>{{ popups[popupIndex].text }}</p>
        <input
          v-if="popups[popupIndex].input"
          v-model="playerName"
          class="snowowl__name-input"
          placeholder="Jouw codenaam"
          maxlength="20"
        />
        <p v-if="duplicateNotice" class="snowowl__duplicate-notice">{{ duplicateNotice }}</p>
        <div v-if="existingAgent" class="snowowl__duplicate-actions">
          <button class="btn" @click="confirmExistingAgent" :disabled="isCheckingName">
            Ga verder als {{ playerName }}
          </button>
          <button class="btn btn--ghost" @click="cancelExistingAgent" :disabled="isCheckingName">
            Kies andere codenaam
          </button>
        </div>
        <div class="snowowl__intro-actions">
          <button class="btn btn--subtle" v-if="popupIndex > 0" @click="goBack">Vorige</button>
          <button
            class="btn"
            v-if="popupIndex < popups.length - 1"
            @click="goForward"
          >
            Volgende
          </button>
          <button
            class="btn"
            v-if="popupIndex === popups.length - 1"
            :disabled="!canStart || isCheckingName || !!existingAgent"
            @click="startGame"
          >
            Start missie
          </button>
        </div>
      </section>
    </transition>

    <div v-if="gameStore.playerName" class="snowowl__dashboard">
      <section class="card surface-frosted snowowl__welcome">
        <div>
          <span class="badge">Welkom agent</span>
          <h1>{{ gameStore.playerName }}</h1>
          <p class="section-subtext">Voltooi alle missies op het leerplein om jouw persoonlijke kluiscode te onthullen.</p>
        </div>
        <button class="btn btn--ghost" @click="switchPlayer">Wissel agent</button>
      </section>

      <section class="card snowowl__status">
        <div class="snowowl__progress">
          <div class="snowowl__progress-circle" :style="progressCircleStyle">
            <div class="snowowl__progress-inner">
              <strong>{{ displayedCompletedCount }}</strong>
              <span>van {{ tiles.length }}</span>
            </div>
          </div>
          <div class="snowowl__progress-copy">
            <h3>Missie voortgang</h3>
            <p class="section-subtext">Je hebt {{ displayedCompletedCount }} van de {{ tiles.length }} missies voltooid.</p>
          </div>
        </div>
        <div class="snowowl__vault">
          <div class="snowowl__vault-header">
            <span class="badge">Kluiscode</span>
            <!-- Tekst vóórdat alle spellen klaar zijn -->
            <p class="section-subtext" v-if="!allGamesCompleted">
              Elk voltooid spel onthult een nieuw cijfer.
            </p>

            <!-- Tekst NA voltooiing -->
            <div v-else class="section-subtext section-success">
              <h2>Gefeliciteerd, agent!</h2>
              <p>Je hebt alle missies voltooid. Gebruik de volledige code hieronder om de kluis te openen. Klik hierboven op wissel agent als je opnieuw wilt spelen.</p>
            </div>
          </div>
          <div class="snowowl__vault-dial">
            <div class="snowowl__vault-ring">
              <span
                v-for="(digit, index) in maskedVaultDigits"
                :key="index"
                :class="['snowowl__vault-digit', { 'is-revealed': index < displayedCompletedCount }]"
                :style="dialPositions[index]"
              >
                {{ digit }}
              </span>
              <div class="snowowl__vault-core">
                <span class="snowowl__vault-core-label">Ontgrendeld</span>
                <strong>{{ displayedCompletedCount }} / {{ tiles.length }}</strong>
              </div>
            </div>
          </div>
        </div>

      </section>

      <section class="snowowl__tiles">
        <h2 class="section-heading">Kies je volgende missie</h2>
        <p class="section-subtext">Klik op het plaatje van een missie. Volg de instructies. Ga naar de locatie op het leerplein, speel het spel en vul de code in.</p>
        <div class="snowowl__tile-grid">
          <article
            v-for="(tile, index) in tiles"
            :key="tile.id"
            :class="['snowowl__tile card', `state-${tile.state}`]"
            @click="selectGame(index)"
          >
            <div class="snowowl__tile-header">
              <span class="badge">Missie {{ index + 1 }}</span>
              <span class="snowowl__tile-status" :class="tileStatusClass(tile)">
                {{ tileStatusLabel(tile) }}
              </span>
            </div>
            <img :src="tile.img" :alt="tile.title" class="snowowl__tile-image" />
            <h3>{{ tile.title }}</h3>
            <p class="section-subtext">Focus: {{ tile.skill }}</p>
          </article>
        </div>
      </section>

      <button class="btn btn--ghost snowowl__reset" @click="resetGames">Reset spellen</button>
    </div>

    <!-- <transition name="fade-scale">
      <div v-if="allGamesCompleted" class="snowowl__complete">
        <div class="snowowl__complete-card card surface-frosted">
          <h2>Gefeliciteerd, agent!</h2>
          <p>Je hebt alle missies voltooid. Gebruik de volledige code hieronder om de kluis te openen.</p>
          <div class="snowowl__vault-digits snowowl__vault-digits--large">
            <span v-for="(digit, index) in fullVaultDigits" :key="index" class="snowowl__vault-digit is-revealed">
              {{ digit }}
            </span>
          </div>
          <div class="snowowl__complete-actions">
            <button class="btn" @click="switchPlayer">Opnieuw spelen</button>
          </div>
        </div>
      </div>
    </transition> -->
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed, watch } from "vue";
import { db } from "../firebase";
import { collection, getDoc, getDocs, doc, updateDoc, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { useRouter } from 'vue-router';
import { useGameStore } from "../stores/gameStore";

export default {
  setup() {
    const showPopup = ref(true);
    const popupIndex = ref(0);
    const router = useRouter();
    const gameStore = useGameStore();
    const playerName = ref('');
    const vaultCode = ref('');
    const isCheckingName = ref(false);
    const duplicateNotice = ref('');
    const existingAgent = ref(null);
    const duplicateAgentName = ref('');
    const progressReady = ref(false);

    const popups = ref([
      { title: "Welkom!", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Je staat op het punt om de ultieme test van S.H.A.D.E. te ervaren. S.H.A.D.E. beschermt onze digitale samenleving. Alleen de scherpste agenten krijgen toegang." },
      // { title: "Wat is S.H.A.D.E?", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "S.H.A.D.E. beschermt onze digitale samenleving. Alleen de scherpste agenten krijgen toegang." },
      { title: "De nacht van de sneeuwuil", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Voltooi vijf missies verspreid over het leerplein en verzamel alle cijfers van de kluis. Ga naar de locatie van elke missie, speel het spel en voer de code in." },
      // { title: "Hoe werkt het?", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Ga naar de locatie van elke missie, speel het spel, keer terug en voer de code in." },
      { title: "Jouw codenaam", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, text: "Vul je naam in en start de missie van de sneeuwuil!", input: true }
    ]);

    const tiles = ref([
      { id: 1, name: "Spel 1", progressKey: "game1completed", img: new URL('@/assets/sneeuwuil.png', import.meta.url).href, title: "Smart Quiz", skill: "Intelligentie", available: true, state: "available" },
      { id: 2, name: "Spel 2", progressKey: "game2completed", img: new URL('@/assets/game2/boss.png', import.meta.url).href, title: "Space Invaders", skill: "Vingervlugheid", available: true, state: "available" },
      { id: 3, name: "Spel 3", progressKey: "game3completed", img: new URL('@/assets/laser-lockdown.png', import.meta.url).href, title: "Laser Lockdown", skill: "Precisie", available: true, state: "available" },
      { id: 4, name: "Spel 4", progressKey: "game4completed", img: new URL('@/assets/game4/flappy.png', import.meta.url).href, title: "Flappy Wifi", skill: "Presteren onder druk", available: true, state: "available" },
      { id: 5, name: "Spel 5", progressKey: "game5completed", img: new URL('@/assets/dimensions-collapsing.png', import.meta.url).href, title: "Dimensions Collapsing", skill: "Ruimtelijk inzicht", available: true, state: "available" }
    ]);

    const STALE_LOCK_MS = 7 * 60 * 1000;

    const goForward = () => {
      if (popupIndex.value < popups.value.length - 1) {
        popupIndex.value += 1;
      }
    };

    const goBack = () => {
      if (popupIndex.value > 0) {
        popupIndex.value -= 1;
      }
    };

    const computeTileState = (isAvailable, isCompleted) => {
      if (isCompleted) {
        return "completed";
      }
      return isAvailable ? "available" : "active";
    };

    const fetchGameStatus = async (enableProgress = false) => {
      for (const tile of tiles.value) {
        const gameRef = doc(db, "games", `game${tile.id}`);
        try {
          const gameDoc = await getDoc(gameRef);
          const isCompletedByPlayer = gameStore.gameProgress[tile.progressKey] === true;

          let isAvailable = true;
          let lockedBy = null;
          let lockedAtMs = null;

          if (gameDoc.exists()) {
            const data = gameDoc.data();
            isAvailable = data.available !== false;
            lockedBy = data.lockedBy ?? null;
            if (data.lockedAt && typeof data.lockedAt.toMillis === 'function') {
              lockedAtMs = data.lockedAt.toMillis();
            }
          }

          if (!isAvailable) {
            const now = Date.now();
            const lockAge = lockedAtMs ? now - lockedAtMs : Number.POSITIVE_INFINITY;
            const shouldRelease = !lockedBy || !lockedAtMs || lockAge > STALE_LOCK_MS || isCompletedByPlayer;

            if (shouldRelease) {
              try {
                await updateDoc(gameRef, { available: true, lockedBy: null, lockedAt: null });
                isAvailable = true;
              } catch (releaseError) {
                console.error("Fout bij automatisch vrijgeven van spel:", releaseError);
              }
            }
          }

          const nextState = computeTileState(isAvailable, isCompletedByPlayer);
          if (tile.state !== nextState) {
            tile.state = nextState;
          }
          const nextAvailable = nextState === "available";
          if (tile.available !== nextAvailable) {
            tile.available = nextAvailable;
          }
        } catch (error) {
          console.error("Fout bij ophalen status van spel:", error);
          const fallbackCompleted = gameStore.gameProgress[tile.progressKey] === true;
          const fallbackState = computeTileState(true, fallbackCompleted);
          if (tile.state !== fallbackState) {
            tile.state = fallbackState;
          }
          const fallbackAvailable = fallbackState === "available";
          if (tile.available !== fallbackAvailable) {
            tile.available = fallbackAvailable;
          }
        }
      }

      if (gameStore.playerName && (enableProgress || progressReady.value)) {
        progressReady.value = true;
      } else if (!gameStore.playerName) {
        progressReady.value = false;
      }
    };

    const selectGame = async (index) => {
      const tile = tiles.value[index];
      if (!tile || tile.state !== "available") return;

      const gameRef = doc(db, "games", `game${tile.id}`);

      try {
        await updateDoc(gameRef, {
          available: false,
          lockedBy: gameStore.playerName || null,
          lockedAt: serverTimestamp()
        });
        tile.state = "active";
        tile.available = false;
        router.push(`/game${tile.id}`);
      } catch (error) {
        console.error("Fout bij het bijwerken van het spel:", error);
      }
    };

    const getRandomVaultCode = async () => {
      try {
        const docRef = doc(db, "vaultcodes", "codes");
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          const allCodes = snapshot.data().codesArray;
          const randomIndex = Math.floor(Math.random() * allCodes.length);
          return allCodes[randomIndex];
        }
        return null;
      } catch (err) {
        console.error("Fout bij ophalen vaultcodes:", err);
        return null;
      }
    };

    const startGame = async () => {
      if (!canStart.value || isCheckingName.value) {
        return;
      }

      playerName.value = playerName.value.trim();
      if (!playerName.value) {
        return;
      }

      isCheckingName.value = true;
      duplicateNotice.value = '';
      duplicateAgentName.value = '';
      existingAgent.value = null;
      progressReady.value = false;

      try {
        const gameInstanceRef = collection(db, "gameinstances");
        const existingQuery = query(gameInstanceRef, where("name", "==", playerName.value));
        const snapshot = await getDocs(existingQuery);

        if (!snapshot.empty) {
          existingAgent.value = snapshot.docs[0];
          duplicateAgentName.value = playerName.value;
          duplicateNotice.value = `Codenaam ${playerName.value} is al actief. Ben jij dit?`;
          return;
        }

        gameStore.setPlayerName(playerName.value);

        const rawCode = await getRandomVaultCode();
        // console.log("Raw: ",rawCode);
        const map = [2, 3, 4, 0, 1]; // nieuwe index → oude index

        const code = map.map(idx => rawCode[idx]).join("");
        // console.log(code);
        if (!code) {
          alert("Kon geen kluiscode ophalen. Probeer opnieuw.");
          return;
        }

        vaultCode.value = code;
        gameStore.vaultCode = code;
        localStorage.setItem("vaultCode", code);

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

        await fetchGameStatus(true);
        progressReady.value = true;
        showPopup.value = false;
      } catch (error) {
        console.error("Fout bij opslaan gameinstance:", error);
        duplicateNotice.value = "Er trad een fout op bij het starten van de missie. Probeer het opnieuw.";
      } finally {
        isCheckingName.value = false;
      }
    };

    const confirmExistingAgent = async () => {
      if (!existingAgent.value) {
        return;
      }

      isCheckingName.value = true;
      progressReady.value = false;
      try {
        const trimmedName = playerName.value.trim();
        const agentData = existingAgent.value.data ? existingAgent.value.data() : null;

        gameStore.setPlayerName(trimmedName);
        if (agentData) {
          gameStore.setProgress(agentData);
          gameStore.vaultCode = agentData.vaultCode || '';
          localStorage.setItem("vaultCode", gameStore.vaultCode);
        } else {
          await gameStore.loadProgress();
        }
        vaultCode.value = gameStore.vaultCode;

        await fetchGameStatus(true);
        progressReady.value = true;
        showPopup.value = false;
        duplicateNotice.value = '';
        duplicateAgentName.value = '';
        existingAgent.value = null;
      } catch (error) {
        console.error("Fout bij het laden van de bestaande agent:", error);
        duplicateNotice.value = "Kon de bestaande missie niet laden. Probeer het opnieuw.";
      } finally {
        isCheckingName.value = false;
      }
    };

    const cancelExistingAgent = () => {
      existingAgent.value = null;
      duplicateAgentName.value = '';
      duplicateNotice.value = 'Kies een andere codenaam, deze naam is al in gebruik.';
      playerName.value = '';
      progressReady.value = false;
    };

    const resetGames = async () => {
      try {
        const resetFields = {
          game1completed: false,
          game2completed: false,
          game3completed: false,
          game4completed: false,
          game5completed: false
        };

        if (gameStore.playerName) {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(gameInstanceRef, where("name", "==", gameStore.playerName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const agentDoc = querySnapshot.docs[0];
            await updateDoc(agentDoc.ref, resetFields);
          }
        }

        gameStore.resetProgress();
        progressReady.value = false;

        for (const tile of tiles.value) {
          const gameRef = doc(db, "games", `game${tile.id}`);
          await updateDoc(gameRef, { available: true, lockedBy: null, lockedAt: null });
          tile.state = "available";
          tile.available = true;
        }

        await fetchGameStatus(true);
        progressReady.value = true;
      } catch (error) {
        console.error("Fout bij het resetten van de spellen:", error);
      }
    };

    const switchPlayer = () => {
      gameStore.clearPlayer();
      showPopup.value = true;
      popupIndex.value = 0;
      playerName.value = '';
      vaultCode.value = '';
      progressReady.value = false;
    };

    const completedCount = computed(() => {
      const progress = gameStore.gameProgress || {};
      const flags = [
        progress.game1completed,
        progress.game2completed,
        progress.game3completed,
        progress.game4completed,
        progress.game5completed
      ];
      return flags.filter(value => value === true).length;
    });

    const displayedCompletedCount = computed(() => (progressReady.value ? completedCount.value : 0));
    const allGamesCompleted = computed(() => progressReady.value && displayedCompletedCount.value === tiles.value.length);

    const CODE_LENGTH = 5;
    const CODE_PLACEHOLDER = '•';

    const rawVaultCode = computed(() => (gameStore.vaultCode || '').trim());
    const paddedVaultCode = computed(() => rawVaultCode.value.padEnd(CODE_LENGTH, CODE_PLACEHOLDER).slice(0, CODE_LENGTH));

    const maskedVaultDigits = computed(() => {
      if (!progressReady.value) {
        return Array(CODE_LENGTH).fill(CODE_PLACEHOLDER);
      }

      return paddedVaultCode.value.split('').map((digit, index) => {
        const hasValue = index < rawVaultCode.value.length && digit !== CODE_PLACEHOLDER;
        return index < completedCount.value && hasValue ? digit : CODE_PLACEHOLDER;
      });
    });

    const dialPositions = computed(() => {
      const digits = maskedVaultDigits.value;
      const total = digits.length || CODE_LENGTH;
      const radius = 36;
      return digits.map((_, index) => {
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
        const x = (50 + Math.cos(angle) * radius).toFixed(2);
        const y = (50 + Math.sin(angle) * radius).toFixed(2);
        return {
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)'
        };
      });
    });

    const fullVaultDigits = computed(() => paddedVaultCode.value.split(''));
    const canStart = computed(() => playerName.value.trim().length > 1);

    const progressPercent = computed(() => {
      if (!tiles.value.length || !progressReady.value) return 0;
      return Math.round((completedCount.value / tiles.value.length) * 100);
    });

    const progressCircleStyle = computed(() => {
      const degrees = (progressPercent.value / 100) * 360;
      return {
        background: `conic-gradient(var(--accent-color) ${degrees}deg, rgba(255, 255, 255, 0.12) ${degrees}deg)`
      };
    });

    const tileStatusLabel = tile => {
      if (tile.state === "completed") return "Voltooid";
      if (tile.state === "active") return "Bezig";
      return "Beschikbaar";
    };

    const tileStatusClass = tile => ({
      "is-locked": tile.state === "active",
      "is-complete": tile.state === "completed"
    });

    let statusInterval;
    onMounted(() => {
      const savedName = localStorage.getItem("playerName");

      if (savedName) {
        gameStore.playerName = savedName;
        gameStore.loadProgress();
        showPopup.value = false;
      }

      fetchGameStatus(true);
      statusInterval = setInterval(() => fetchGameStatus(), 2500);
    });

    watch(playerName, (value) => {
      const trimmed = value.trim();
      if (!trimmed) {
        duplicateNotice.value = '';
        duplicateAgentName.value = '';
        existingAgent.value = null;
        progressReady.value = false;
        return;
      }

      if (duplicateAgentName.value && trimmed !== duplicateAgentName.value) {
        duplicateNotice.value = '';
        duplicateAgentName.value = '';
        existingAgent.value = null;
        progressReady.value = false;
      }
    });

    watch(
      () => ({ ...gameStore.gameProgress }),
      () => {
        fetchGameStatus();
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      clearInterval(statusInterval);
    });

    return {
      showPopup,
      popupIndex,
      popups,
      goForward,
      goBack,
      tiles,
      selectGame,
      resetGames,
      startGame,
      confirmExistingAgent,
      cancelExistingAgent,
      gameStore,
      playerName,
      completedCount,
      displayedCompletedCount,
      maskedVaultDigits,
      dialPositions,
      fullVaultDigits,
      allGamesCompleted,
      canStart,
      progressCircleStyle,
      switchPlayer,
      tileStatusLabel,
      tileStatusClass,
      duplicateNotice,
      existingAgent,
      isCheckingName,
      progressReady
    };
  }
};
</script>

<style scoped>
.snowowl {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  padding: 0 1.25rem;
  max-width: 980px;
  margin: 0 auto;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.35s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}

.snowowl__intro {
  text-align: left;
  display: grid;
  gap: 1.25rem;
  padding: 2rem 1.75rem;
}

.snowowl__intro-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.snowowl__intro-dots {
  display: inline-flex;
  gap: 0.5rem;
}

.snowowl__intro-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.3s ease, transform 0.3s ease;
}

.snowowl__intro-dot.is-active {
  background: var(--accent-color);
  transform: scale(1.25);
}

.snowowl__intro-image {
  width: min(220px, 60vw);
  justify-self: center;
  filter: drop-shadow(0 22px 35px rgba(0, 0, 0, 0.45));
}

.snowowl__name-input {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  text-align: center;
}

.snowowl__intro-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.snowowl__duplicate-notice {
  margin: 0.75rem 0 0;
  color: var(--warning-color);
  font-weight: 600;
  text-align: center;
}

.snowowl__duplicate-actions {
  display: grid;
  gap: 0.75rem;
  margin: 0.75rem 0;
}

.snowowl__duplicate-actions .btn {
  width: 100%;
}

.snowowl__dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
}

.snowowl__welcome {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.75rem;
}

.snowowl__welcome h1 {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 5vw, 2.2rem);
  margin: 0.25rem 0 0;
}

.snowowl__status {
  display: grid;
  gap: 1.5rem;
}

.snowowl__progress {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.5rem;
  align-items: center;
}

.snowowl__progress-circle {
  width: clamp(100px, 32vw, 120px);
  height: clamp(100px, 32vw, 120px);
  border-radius: 50%;
  display: grid;
  place-items: center;
  padding: 6px;
  background: rgba(255, 255, 255, 0.08);
}

.snowowl__progress-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(3, 6, 18, 0.85);
  display: grid;
  place-items: center;
  gap: 0.2rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.snowowl__progress-inner strong {
  font-size: 2rem;
  margin: 0;
}

.snowowl__progress-inner span {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.snowowl__progress-copy h3 {
  margin: 0;
  font-size: 1.3rem;
}

.snowowl__vault {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
  text-align: center;
}


.snowowl__vault-dial {
  width: 100%;
  display: grid;
  place-items: center;
  padding: 0.75rem 0 1.25rem;
}

.snowowl__vault-ring {
  position: relative;
  width: clamp(220px, 68vw, 280px);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.18);
  background: radial-gradient(circle at 50% 50%, rgba(124, 92, 255, 0.12), rgba(9, 13, 28, 0.92) 60%);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.45);
}

.snowowl__vault-ring::after {
  content: '';
  position: absolute;
  inset: 16%;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 18px rgba(124, 92, 255, 0.3);
  opacity: 0.7;
}

.snowowl__vault-ring .snowowl__vault-digit {
  position: absolute;
  width: clamp(44px, 13vw, 54px);
  height: clamp(44px, 13vw, 54px);
  font-size: 1.35rem;
  pointer-events: none;
}

.snowowl__vault-core {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  gap: 0.2rem;
  padding: 0.75rem 1rem;
  border-radius: 50%;
  background: rgba(3, 6, 18, 0.92);
  border: 1px solid rgba(124, 92, 255, 0.22);
  box-shadow: 0 0 25px rgba(124, 92, 255, 0.25);
}

.snowowl__vault-core-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.snowowl__vault-core strong {
  font-size: 1.1rem;
  letter-spacing: 0.08em;
}

.snowowl__vault-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.snowowl__vault-digits {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.snowowl__vault-digit {
  width: clamp(48px, 14vw, 56px);
  height: clamp(48px, 14vw, 56px);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-disabled);
  transition: transform 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.snowowl__vault-digit.is-revealed {
  color: #fff;
  border-color: rgba(124, 92, 255, 0.35);
  background: rgba(124, 92, 255, 0.15);
  box-shadow: 0 0 12px rgba(124, 92, 255, 0.35);
}

.snowowl__vault-digits .snowowl__vault-digit.is-revealed {
  transform: translateY(-3px);
}

.snowowl__vault-digits--large .snowowl__vault-digit {
  width: clamp(56px, 16vw, 68px);
  height: clamp(56px, 16vw, 68px);
  font-size: 1.8rem;
}

.snowowl__tiles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}

.snowowl__tile-grid {
  display: grid;
  gap: var(--gap-md);
}

.snowowl__tile {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease;
}

.snowowl__tile.state-available:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 40px rgba(6, 10, 25, 0.45);
}

.snowowl__tile.state-active {
  cursor: not-allowed;
  opacity: 0.6;
  filter: grayscale(0.15);
}

.snowowl__tile.state-completed {
  cursor: not-allowed;
  border: 1px solid rgba(74, 227, 140, 0.25);
  box-shadow: 0 18px 40px rgba(6, 25, 18, 0.35);
}

.snowowl__tile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.snowowl__tile-status {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.4rem 0.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  border: 1px solid transparent;
}

.snowowl__tile-status.is-locked {
  background: rgba(255, 107, 107, 0.12);
  color: var(--danger-color);
  border-color: rgba(255, 107, 107, 0.35);
}

.snowowl__tile-status.is-complete {
  background: rgba(74, 227, 140, 0.12);
  color: var(--success-color);
  border-color: rgba(74, 227, 140, 0.35);
}

.snowowl__tile-image {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.snowowl__tile h3 {
  margin: 0;
  font-size: 1.25rem;
}

.snowowl__reset {
  align-self: center;
}

.snowowl__complete {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(3, 6, 18, 0.7);
  backdrop-filter: blur(6px);
  z-index: 1050;
}

.snowowl__complete-card {
  max-width: 420px;
  text-align: center;
  display: grid;
  gap: 1.5rem;
  padding: 2.25rem 1.75rem;
}

.snowowl__complete-actions {
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .snowowl__welcome {
    flex-direction: column;
    align-items: stretch;
    gap: 1.25rem;
  }

  .snowowl__welcome .btn {
    width: 100%;
  }

  .snowowl__status {
    gap: 1.25rem;
  }

  .snowowl__progress {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .snowowl__progress-copy {
    text-align: center;
  }

  .snowowl__vault {
    justify-items: center;
    text-align: center;
  }

  .snowowl__vault-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .snowowl__vault-ring {
    width: min(240px, 80vw);
  }
}
@media (min-width: 768px) {
  .snowowl__intro {
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .snowowl__intro-image {
    width: min(260px, 100%);
  }

  .snowowl__intro-actions {
    justify-content: flex-end;
  }

  .snowowl__status {
    grid-template-columns: 1fr 1fr;
    align-items: center;
  }

  .snowowl__vault {
    justify-items: flex-start;
  }

  .snowowl__tile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>


