<template>
  <div class="intro-text">
    Loop naar kamer 2.10 om te beginnen met het spel
  </div>
  <div class="wrapper">
    <div class="container">
      <p>Zoek alle letters en maak er een woord van.</p>
      
      <div class="letter-boxes">
        <input v-for="(letter, index) in letters" 
          :key="index" 
          v-model="letters[index]" 
          class="letter-input" 
          maxlength="1" 
          @input="moveToNext(index, $event)"
          @keydown.backspace="moveToPrevious(index, $event)"
          ref="inputs" />
      </div>
      
      <div class="word-input-container">
        <input v-model="wordInput" class="word-input" placeholder="Typ hier je woord" maxlength="5" />
        <button @click="checkWord" class="check-button">Controleer</button>
      </div>
      
      <div v-if="message" class="result" :class="{'correct': isCorrect, 'incorrect': !isCorrect}">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      letters: Array(5).fill(""),
      wordInput: "",
      correctWord: "KLAAR",
      message: "",
      isCorrect: false
    };
  },
  methods: {
    checkWord() {
      const word = this.wordInput.toUpperCase();
      if (word === this.correctWord) {
        this.message = "Correct! Je hebt het geheimen woord gevonden en kan nu door!";
        this.isCorrect = true;
      } else {
        this.message = "Incorrect woord, probeer het nog eens.";
        this.isCorrect = false;
      }
    },
    moveToNext(index, event) {
      if (event.inputType === "insertText" && event.data && index < this.letters.length - 1) {
        this.$refs.inputs[index + 1].focus();
      }
    },
    moveToPrevious(index, event) {
      if (event.key === "Backspace" && !this.letters[index] && index > 0) {
        this.$refs.inputs[index - 1].focus();
      }
    }
  }
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
}
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}
.container {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 90%;
}
.letter-boxes {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}
.letter-input {
  width: 45px;
  height: 45px;
  text-align: center;
  font-size: 22px;
  border: 2px solid #ccc;
  border-radius: 6px;
  transition: 0.2s ease-in-out;
}
.letter-input:focus {
  border-color: #6e8efb;
  outline: none;
}
.word-input-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 15px;
}
.word-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: 18px;
  text-align: center;
}
.check-button {
  padding: 12px 22px;
  border: none;
  border-radius: 6px;
  background: #6e8efb;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: 0.3s;
}
.check-button:hover {
  background: #5a7ae5;
}
.result {
  margin-top: 15px;
  font-weight: bold;
}
.correct {
  color: green;
}
.incorrect {
  color: red;
}
@media (max-width: 500px) {
  .letter-boxes {
    gap: 5px;
  }
  .letter-input {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }
  .word-input-container {
    flex-direction: column;
  }
  .word-input {
    width: 100%;
  }
}
</style>