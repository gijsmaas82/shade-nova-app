<template>
    <div class="qr-container">
      <button @click="generateQRCode">Genereer QR-code</button>
      <canvas ref="qrCanvas" v-if="qrVisible"></canvas>
    </div>
  </template>
  
  <script>
  import QRCode from 'qrcode';
  import { ref, nextTick } from 'vue';
  
  export default {
    setup() {
      const qrCanvas = ref(null);
      const qrVisible = ref(false);
  
      const generateQRCode = async () => {
        console.log("Knop geklikt");
        qrVisible.value = true;

        await nextTick(); // Wacht tot Vue de DOM geüpdatet heeft

        if (qrCanvas.value) {
            console.log("check");
            await QRCode.toCanvas(qrCanvas.value, window.location.href, { width: 200 });
        } else {
            console.error("qrCanvas.value is nog steeds null");
        }
    };
  
      return {
        qrCanvas,
        qrVisible,
        generateQRCode
      };
    }
  };
  </script>
  
  <style>
  .qr-container {
    margin-top: 10vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }
  button {
    margin-top: 10vh;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    margin-bottom: 10px;
  }
  canvas {
    border: 1px solid #000;
    margin-top: 10px;
  }
  </style>
  