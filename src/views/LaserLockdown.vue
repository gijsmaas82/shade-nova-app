<template>
    <div class="container">
      <!-- Navigatiebalk -->
      <div class="nav">
        <a href="Speluitleg.html">Speluitleg</a>
      </div>
  
      <!-- Hoofdtitel -->
      <div class="opening">
        <h1>Laser L🔒ckdown</h1>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'LaserLockdown',
    methods: {
      helloWorld() {
        console.log("Hallo Wereld");
      }
    }
  }
  </script>
  
  <style scoped>
  /* Algemene stijlen */
  .container { 
    font-family: 'Sixtyfour Convergence', sans-serif;
    background-color: #0f0b45;
    text-align: center;
    min-height: 100vh;
  }
  
  .nav {
    background-color: #333;
    padding: 15px;
  }
  
  .nav a {
    color: white;
    text-decoration: none;
    font-size: 1.2em;
  }
  
  .nav button {
    padding: 10px;
    background-color: #4CAF50;
    border: none;
    color: white;
    cursor: pointer;
  }
  
  .nav button:hover {
    background-color: #45a049;
  }
  
  .opening h1 {
    font-size: 2.5em;
    margin-top: 20px;
    color: white;
  }
  </style>
  