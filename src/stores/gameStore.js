import { defineStore } from "pinia";
import { db } from "../firebase"; // Zorg ervoor dat je Firestore hebt ingesteld
import { updateDoc, collection, query, getDocs, where } from "firebase/firestore";

const defaultProgress = () => ({
  game1completed: false,
  game2completed: false,
  game3completed: false,
  game4completed: false,
  game5completed: false,
});

const normalizeProgress = (progress) => {
  const base = defaultProgress();
  if (!progress || typeof progress !== "object") {
    return base;
  }

  Object.keys(base).forEach((key) => {
    base[key] = progress[key] === true;
  });

  return base;
};

export const useGameStore = defineStore("gameStore", {
  state: () => ({
    playerName: "",
    vaultCode: "",
    gameProgress: defaultProgress(),
  }),

  actions: {
    setPlayerName(name) {
      if (this.playerName !== name) {
        this.resetProgress();
        this.vaultCode = "";
        localStorage.removeItem("vaultCode");
      }
      this.playerName = name;
      localStorage.setItem("playerName", name);

      this.loadProgress();
    },
    saveProgress() {
      localStorage.setItem("gameProgress", JSON.stringify(this.gameProgress));
    },
    setProgress(progress) {
      this.gameProgress = normalizeProgress(progress);
      this.saveProgress();
    },
    resetProgress() {
      this.gameProgress = defaultProgress();
      this.saveProgress();
    },
    async loadProgress() {
      let savedProgress = null;
      try {
        const raw = localStorage.getItem("gameProgress");
        savedProgress = raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.warn("Kon lokale voortgang niet parsen:", err);
      }

      const savedCode = localStorage.getItem("vaultCode");

      this.gameProgress = savedProgress ? normalizeProgress(savedProgress) : defaultProgress();

      if (savedCode) {
        this.vaultCode = savedCode;
      } else {
        this.vaultCode = "";
      }

      if (this.playerName) {
        try {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(gameInstanceRef, where("name", "==", this.playerName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();

            this.gameProgress = normalizeProgress(data);
            this.vaultCode = data.vaultCode || "";
            this.saveProgress();
            localStorage.setItem("vaultCode", this.vaultCode);
          }
        } catch (err) {
          console.error("Fout bij ophalen voortgang/vaultCode:", err);
        }
      }
    },
    clearPlayer() {
      localStorage.removeItem("playerName");
      localStorage.removeItem("gameProgress");
      localStorage.removeItem("vaultCode");

      this.playerName = "";
      this.resetProgress();
      this.vaultCode = "";
    },
    async completeGame(gameKey) {
      this.gameProgress[gameKey] = true;
      this.saveProgress();

      if (this.playerName) {
        try {
          const gameInstanceRef = collection(db, "gameinstances");
          const q = query(gameInstanceRef, where("name", "==", this.playerName));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const playerDoc = querySnapshot.docs[0];
            await updateDoc(playerDoc.ref, { [gameKey]: true });
            console.log(`${gameKey} voortgang opgeslagen voor ${this.playerName} in Firestore!`);
          } else {
            console.error("Speler niet gevonden in Firestore!");
          }
        } catch (error) {
          console.error("Fout bij updaten van Firestore:", error);
        }
      }
    },
  },
});
