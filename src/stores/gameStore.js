import { defineStore } from "pinia";
import { db } from "../firebase"; // Zorg ervoor dat je Firestore hebt ingesteld
import { doc, updateDoc, getDoc, collection, query, getDocs, where  } from "firebase/firestore";

export const useGameStore = defineStore("gameStore", {
    state: () => ({
      playerName: "",
      gameProgress: {
        game1completed: false,
        game2completed: false,
        game3completed: false,
        game4completed: false,
        game5completed: false,
      },
    }),
  
    actions: {
      setPlayerName(name) {
        if (this.playerName !== name) {  // Alleen resetten als het een nieuwe speler is
          this.resetProgress(); // Reset de voortgang voor nieuwe speler
        }
        this.playerName = name;
        localStorage.setItem("playerName", name);
    
        // Laad voortgang pas na het instellen van de nieuwe speler
        this.loadProgress();
      },
      saveProgress() {
        localStorage.setItem("gameProgress", JSON.stringify(this.gameProgress));
      },
      setProgress(progress) {
        this.progress = progress || {  // Zorg dat progress nooit undefined is
          game1completed: false,
          game2completed: false,
          game3completed: false,
          game4completed: false,
          game5completed: false,
        };
      },
      resetProgress() {
        this.gameProgress = {
          game1completed: false,
          game2completed: false,
          game3completed: false,
          game4completed: false,
          game5completed: false,
        };
        localStorage.setItem("gameProgress", JSON.stringify(this.gameProgress));
      },
      async loadProgress() {
        const savedProgress = JSON.parse(localStorage.getItem("gameProgress"));
        if (savedProgress) {
          this.gameProgress = savedProgress;
        }
  
        if (this.playerName) {
          const playerDoc = doc(db, "gameinstances", this.playerName);
          const docSnap = await getDoc(playerDoc);
          if (docSnap.exists()) {
            this.gameProgress = {
              game1completed: docSnap.data().game1completed,
              game2completed: docSnap.data().game2completed,
              game3completed: docSnap.data().game3completed,
              game4completed: docSnap.data().game4completed,
              game5completed: docSnap.data().game5completed,
            };
  
            // Sync naar localStorage
            localStorage.setItem("gameProgress", JSON.stringify(this.gameProgress));
            const storedProgress = localStorage.getItem("gameProgress");
            if (storedProgress) {
                this.gameProgress = JSON.parse(storedProgress);
            }
            console.log("Game Progress geladen:", this.gameProgress);
          }
        }
      },
      clearPlayer() {
        // Verwijder de speler uit de localStorage
        localStorage.removeItem("playerName");
        localStorage.removeItem("gameProgress");

        // Reset de state van de store
        this.playerName = "";
        this.gameProgress = {
          game1completed: false,
          game2completed: false,
          game3completed: false,
          game4completed: false,
          game5completed: false,
        };
      },
      async completeGame(gameKey) {
        this.gameProgress[gameKey] = true;
        localStorage.setItem("gameProgress", JSON.stringify(this.gameProgress));
        // console.log("gameProgress: ", this.gameProgress)
        if (this.playerName) {
          try {
            // Zoek naar de speler in de gameinstances collectie op basis van de playerName
            const gameInstanceRef = collection(db, "gameinstances");
            const q = query(gameInstanceRef, where("name", "==", this.playerName)); // Zoek op basis van de playerName
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
            // Haal het eerste document op (er is maar 1 match)
            const playerDoc = querySnapshot.docs[0];
    
            // Update het document met de voortgang van het spel
            await updateDoc(playerDoc.ref, { [gameKey]: true });
            console.log(`${gameKey} voortgang opgeslagen voor ${this.playerName} in Firestore!`);
            } else {
            console.error("Speler niet gevonden in Firestore!");
            }
          } catch (error) {
            console.error("Fout bij updaten van Firestore:", error);
          }
        }
      }
    },
  });
  