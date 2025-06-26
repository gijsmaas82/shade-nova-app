import { defineStore } from "pinia";
import { db } from "../firebase"; // Zorg ervoor dat je Firestore hebt ingesteld
import { updateDoc, collection, query, getDocs, where  } from "firebase/firestore";

export const useGameStore = defineStore("gameStore", {
    state: () => ({
      playerName: "",
      vaultCode: "",
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
        const savedCode = localStorage.getItem("vaultCode");

        if (savedProgress) {
          this.gameProgress = savedProgress;
        }

        if (savedCode) {
          this.vaultCode = savedCode;
        }

        if (this.playerName) {
          try {
            const gameInstanceRef = collection(db, "gameinstances");
            const q = query(gameInstanceRef, where("name", "==", this.playerName));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0];
              const data = docSnap.data();

              this.gameProgress = {
                game1completed: data.game1completed,
                game2completed: data.game2completed,
                game3completed: data.game3completed,
                game4completed: data.game4completed,
                game5completed: data.game5completed,
              };

              this.vaultCode = data.vaultCode || "";
              localStorage.setItem("gameProgress", JSON.stringify(this.gameProgress));
              localStorage.setItem("vaultCode", this.vaultCode);

              // console.log("Voortgang + vaultCode geladen:", this.gameProgress, this.vaultCode);
            }
          } catch (err) {
            console.error("Fout bij ophalen voortgang/vaultCode:", err);
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
  