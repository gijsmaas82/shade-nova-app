<template>
  <div id="app">
    <button @click="goToAgentFromage" class="glow-button">Naar het spel</button>
    <button @click="goToGameKlaar" class="glow-button">Spel is klaar?</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: "HomePage",
  setup() {
    const router = useRouter();

    const goToAgentFromage = () => {
      router.push("/AgentFromage");
    };

    const goToGameKlaar = () => {
      router.push("/GameKlaar");
    };

    return { goToAgentFromage, goToGameKlaar };
  }
}
</script>

<style scoped>
/* Zorg ervoor dat de hele pagina een witte achtergrond heeft */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff; /* Witte achtergrond */
  overflow: hidden;
}

/* Maak de container fullscreen en centreer de knoppen */
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  flex-direction: column;
  animation: fadeIn 1s ease-out;
}

/* Fade-in animatie voor het laden van de pagina */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Apple-stijl knoppen met gloed effect */
.glow-button {
  padding: 18px 36px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  border-radius: 12px;
  color: #fff;
  background: #007aff; /* Apple blauw voor knoppen */
  box-shadow: 0 0 15px rgba(0, 122, 255, 0.8);
  transition: all 0.3s ease-in-out;
  margin: 15px;
  backdrop-filter: blur(10px);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  animation: buttonPulse 2s infinite ease-in-out; /* Pulsatie animatie voor knoppen */
}

/* Pulsatie animatie voor de knoppen */
@keyframes buttonPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba(0, 122, 255, 0.8);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(0, 122, 255, 1);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 15px rgba(0, 122, 255, 0.8);
  }
}

/* Hover effect */
.glow-button:hover {
  background: #0051d4; /* Donkerder blauw bij hover, Apple-stijl */
  box-shadow: 0 0 30px rgba(0, 122, 255, 1);
  transform: scale(1.1); /* Knop groter bij hover */
  transition: all 0.3s ease-in-out;
}

/* Actief klik effect */
.glow-button:active {
  transform: scale(0.95);
  box-shadow: 0 0 20px rgba(0, 122, 255, 1);
}

/* Zorg ervoor dat de tekst van de knoppen iets strakker oogt */
.glow-button:focus {
  outline: none;
  border: 2px solid #007aff; /* Focus border in Apple blauw */
  box-shadow: 0 0 30px rgba(0, 122, 255, 0.8);
}

/* Zorg ervoor dat de pagina niet te fel oogt en dus een Apple-achtige look heeft */
#app {
  background-color: #ffffff; /* Witte achtergrondkleur */
  color: #333; /* Donkergrijze tekstkleur */
  font-size: 16px;
}
</style>
