<template>
  <div class="mission mission--qr">
    <section class="card surface-frosted qr-card">
      <span class="badge">Uitnodiging</span>
      <h1>Deel je missie</h1>
      <p class="section-subtext">Genereer een QR-code van deze pagina zodat andere agenten direct kunnen inscannen.</p>
      <button class="btn" @click="generateQRCode">Genereer QR-code</button>
      <canvas ref="qrCanvas" v-if="qrVisible" class="qr-card__canvas"></canvas>
    </section>
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
      qrVisible.value = true;
      await nextTick();

      if (qrCanvas.value) {
        await QRCode.toCanvas(qrCanvas.value, window.location.href, { width: 240, color: { dark: '#ffffff', light: '#0d1327' } });
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

<style scoped>
.mission {
  display: flex;
  justify-content: center;
  padding: 0 1.25rem;
  margin-top: 1rem;
}

.qr-card {
  max-width: 380px;
  width: 100%;
  text-align: center;
  display: grid;
  gap: 1.25rem;
  padding: 2.5rem 1.75rem;
}

.qr-card__canvas {
  margin: 0 auto;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(13, 19, 39, 0.9);
  padding: 12px;
}
</style>
