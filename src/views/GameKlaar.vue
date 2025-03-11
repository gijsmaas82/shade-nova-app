<template>
  <div class="container">
    <h1>Voer je code in van de computer</h1>
    <div class="code-bar">
      <input 
        v-model="code" 
        type="text" 
        placeholder="Voer je code in..." 
        @input="validateCode" 
        maxlength="4"
        @keydown.enter="submitCode"
      />
    </div>
    <button @click="submitCode">Verzenden</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';  // Import Vue Router

export default {
  name: "GameKlaar",
  setup() {
    const code = ref("");
    const message = ref("");
    const router = useRouter(); // To navigate to different routes

    // Functie om de invoer te valideren, zodat alleen cijfers geaccepteerd worden
    const validateCode = () => {
      // Zorg ervoor dat de ingevoerde waarde alleen cijfers bevat
      code.value = String(code.value).replace(/[^0-9]/g, "");  // Zet het expliciet om naar een string
    };

    const submitCode = () => {
      if (code.value.trim() === "1234") {
        message.value = "✅ Code correct!";
        // Navigeren naar HomePage.vue wanneer de code correct is
        setTimeout(() => {
          router.push('/'); // Zorg ervoor dat '/home' het pad is voor je homepage
        }, 1000); // Wacht 1 seconde voor de overgang
      } else {
        message.value = "❌ Foute code, probeer opnieuw.";
      }
    };

    return { code, message, submitCode, validateCode };
  }
};
</script>

<style scoped>
/* Algemene styling */
* {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Achtergrond en container */
body, html {
  background-color: #f1f1f6; /* Lichte grijze achtergrond (Apple stijl) */
  color: #333; /* Donkergrijze tekstkleur voor een strakke uitstraling */
  width: 100%;
  height: 100%;
  font-size: 16px;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
  animation: fadeIn 1.5s ease-out;
}

/* Fade-in animatie voor het inladen van de container */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Titel */
h1 {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 40px;
  color: #1d1d1f; /* Donkere tekst voor een strakke look */
  animation: slideIn 1s ease-out; /* Voeg animatie toe voor de titel */
}

/* Titel animatie: van boven naar beneden */
@keyframes slideIn {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Code-balk styling */
.code-bar {
  width: 100%;
  max-width: 480px;  /* Vergroot het invoerveld */
  background-color: #ffffff;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: bounceIn 1s ease-out;
}

/* Bounce-in animatie voor de code-balk */
@keyframes bounceIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

input {
  width: 100%;
  padding: 20px;
  font-size: 2rem;  /* Vergroot de tekst */
  border: none;
  border-radius: 12px;
  outline: none;
  background-color: #f4f4f7; /* Apple lichte achtergrondkleur voor het invoerveld */
  color: #333; /* Donkergrijze tekst */
  text-align: center;
  letter-spacing: 1.5px; /* Vergemakkelijkt het lezen van cijfers */
  transition: background-color 0.5s ease, transform 0.3s ease; /* Snelle overgangseffecten */
  animation: focusAnimation 1s ease-out;
}

/* Placeholder tekstkleur */
input::placeholder {
  color: rgba(0, 0, 0, 0.5);
}

/* Focus animatie voor het invoerveld */
@keyframes focusAnimation {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

input:focus {
  background-color: #e1e1e6; /* Lichte verandering bij focus om het veld te benadrukken */
  transform: scale(1.05); /* Inzoomen bij focus voor extra effect */
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.7); /* Apple blauw gloed bij focus */
}

/* Knop styling */
button {
  margin-top: 30px;
  padding: 18px 40px;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
  background: #007aff; /* Apple blauw voor de knoppen */
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.5s ease, transform 0.3s ease; /* Snelle overgangseffecten */
  box-shadow: 0 6px 14px rgba(0, 122, 255, 0.6);
  width: 100%;
  max-width: 350px;
  animation: pulse 2s infinite; /* Pulsatie animatie voor de knop */
}

/* Pulsatie animatie voor de knop */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

button:hover {
  background: #0051d4; /* Donkerder blauw bij hover */
  box-shadow: 0 8px 18px rgba(0, 122, 255, 0.8);
  transform: scale(1.05);  /* Vergroot de knop bij hover */
}

button:focus {
  outline: none; /* Verwijder de standaard focus-ring van de knop */
  box-shadow: 0 0 12px rgba(0, 122, 255, 0.8); /* Apple focus glow bij knop */
}

/* Bericht styling */
p {
  margin-top: 20px;
  font-size: 1.4rem;
  color: #555;
  animation: fadeIn 1.5s ease-out; /* Bericht fade-in animatie */
}
</style>
