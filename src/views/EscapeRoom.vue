<template>
    <div class="game-container">
      <div class="game-page">
        <h1>🔪 Welkom bij de EscapeRoom! 🕵️‍♂️</h1>
        <p>De beruchte detectivezaak wacht op jou... Ga naar lokaal J2.06 bij het leerplein om het spel te starten.</p>
        <p>Los de raadsels op en voer de geheime code in om verder te gaan naar het volgende mysterie.</p>
        
        <input v-model="enteredCode" type="text" placeholder="Voer de geheime code in..." />
        <button @click="checkCode">Ontgrendel de waarheid</button>
        
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        correctCode: "MOORD", // Pas deze code aan naar de juiste waarde
        enteredCode: "",
        errorMessage: ""
      };
    },
    methods: {
      checkCode() {
        if (this.enteredCode === this.correctCode) {
          this.$router.push("/"); // Vervang met de juiste route
        } else {
          this.errorMessage = "Verkeerde code... het mysterie blijft onopgelost.";
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .game-container {
    /* background: url('@/assets/background.jpg') no-repeat center center fixed; */
    background: #111;
    background-size: cover;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .game-page {
    text-align: center;
    padding: 20px;
    background-color: #1a1a1a;
    color: #ff4444;
    font-family: 'Creepster', cursive;
    border: 3px solid #ff4444;
    box-shadow: 0 0 15px red;
    max-width: 600px;
    margin: 50px;
    padding: 20px;
    border-radius: 10px;
    position: relative;
    z-index: 2; /* Zorg ervoor dat de game page boven de achtergrondafbeelding verschijnt */
  }
  
  input {
    margin: 10px;
    padding: 10px;
    border: 2px solid #ff4444;
    background-color: #333;
    color: white;
    font-size: 18px;
    text-align: center;
  }
  
  button {
    padding: 10px 15px;
    background-color: #ff4444;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    transition: 0.3s;
  }
  
  button:hover {
    background-color: darkred;
    box-shadow: 0 0 10px red;
  }
  
  .error {
    color: yellow;
    margin-top: 10px;
    font-weight: bold;
  }
  </style>
  