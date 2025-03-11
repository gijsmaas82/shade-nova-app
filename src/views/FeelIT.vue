<template>
  <div class="container">
    <!-- Tekstgedeelte -->
    <div class="text-box">
      <h1>FeelIt</h1>
      <p>Wij zijn Feel It</p>
    </div>

    <!-- Afbeelding -->
    <div class="image-box">
      <img :src="imageSrc" alt="FeelIt Afbeelding" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const imageSrc = ref('/afbeelding.png'); 
</script>

<style scoped>
/* Algemene container */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f4f8, #d9e2ec);
  padding: 20px;
}

/* Tekstgedeelte */
.text-box {
  max-width: 500px;
  padding: 20px;
}

.text-box h1 {
  font-size: 3rem;
  color: #2c3e50;
  font-weight: bold;
  margin-bottom: 300px;
  position: absolute;
  right: 700px;
}

.text-box p {
  font-size: 1.2rem;
  color: #4a5568;
}

/* Afbeeldingsgedeelte */
.image-box {
  margin-top: 20px;
}

.image-box img {
  width: 100%;
  max-width: 350px;
  border-radius: 15px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

/* Hover effect */
.image-box img:hover {
  transform: scale(1.05);
}

/* Responsief ontwerp */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
    text-align: left;
  }

  .text-box {
    flex: 1;
    padding-right: 40px;
  }

  .image-box {
    flex: 1;
  }
}
</style>
