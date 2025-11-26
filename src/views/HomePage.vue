<template>
  <div class="home">
    <section class="home__highlights">
      <span class="badge">Nieuwe missie</span>
        <h1 class="home__title">De Nacht van de Sneeuwuil</h1>
        <p class="home__subtitle">
          Stap in de exclusieve wereld van S.H.A.D.E. Verzamel codes op het leerplein, los high-tech missies op en ontgrendel
          de geheime kluis.
        </p>
      <h2 class="section-heading">Wat staat je te wachten?</h2>
      <p class="section-subtext">Elke missie prikkelt een andere vaardigheid. Kies slim, werk samen en blijf scherp.</p>
      <div class="home__highlight-grid">
        <article v-for="item in highlights" :key="item.title" class="home__highlight card">
          <div class="home__highlight-icon">{{ item.icon }}</div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="home__timeline card">
      <h2 class="section-heading">Zo word je een S.H.A.D.E agent</h2>
      <ol class="home__timeline-list">
        <li v-for="(step, index) in steps" :key="index" class="home__timeline-step">
          <div class="home__step-index">{{ index + 1 }}</div>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </div>
        </li>
      </ol>
    </section>
    <section class="home__hero card surface-frosted">
      <div class="home__hero-copy">
        <div class="home__actions">
          <button class="btn" @click="startGame">
            Start jouw missie
          </button>
          <button class="btn btn--ghost" @click="openInvite">
            Scan uitnodiging
          </button>
        </div>
        <div class="home__meta">
          <div class="stat-pill">
            <span>🧠</span>
            <span>5 unieke skills</span>
          </div>
          <div class="stat-pill">
            <span>🔐</span>
            <span>1 geheime kluis</span>
          </div>
        </div>
      </div>
      <div class="home__hero-visual shadow-ring">
        <img :src="heroImage" alt="Sneeuwuil" />
        <div class="home__glow"></div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();
    const heroImage = new URL('@/assets/sneeuwuil.png', import.meta.url).href;

    const highlights = ref([
      {
        icon: '🧭',
        title: 'Verken het leerplein',
        description: 'Ontdek vijf fysieke spelzones, elk met een unieke uitdaging en eigen sfeer.'
      },
      {
        icon: '🕵️',
        title: 'Werk als een echte agent',
        description: 'Gebruik jouw inzicht, creativiteit en team om te ontsnappen uit digitale complotten.'
      },
      {
        icon: '🔓',
        title: 'Ontgrendel de kluis',
        description: 'Verzamel de vijf cijfers en kraak de S.H.A.D.E vaultcode om je badge te verdienen.'
      }
    ]);

    const steps = ref([
      {
        title: 'Meld je aan',
        description: 'Start de missie, voer je codenaam in en ontvang jouw persoonlijke kluiscode.'
      },
      {
        title: 'Voltooi vijf missies',
        description: 'Ga naar de aangegeven locaties, speel de games en verzamel cijfers voor de kluis.'
      },
      {
        title: 'Claim je badge',
        description: 'Keer terug naar de Snow Owl hub, voer de cijfers in en word officieel S.H.A.D.E agent.'
      }
    ]);

    const startGame = () => {
      router.push('/snowowl');
    };

    const openInvite = () => {
      router.push('/qrcode');
    };

    return { highlights, steps, startGame, openInvite, heroImage };
  }
};
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: var(--gap-lg);
  padding: 0 1.25rem;
}

.home__hero {
  display: grid;
  gap: var(--gap-md);
  padding: 2.25rem 1.75rem;
  position: relative;
  overflow: hidden;
}

.home__hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(124, 92, 255, 0.22), transparent 55%);
  z-index: 0;
}

.home__hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.home__title {
  font-family: var(--font-display);
  font-size: clamp(2.1rem, 5vw, 2.6rem);
  margin: 0;
  letter-spacing: 0.03em;
}

.home__subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.home__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.home__meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.home__hero-visual {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  padding: 1.5rem 0;
}

.home__hero-visual img {
  width: min(280px, 70vw);
  filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.45));
}

.home__glow {
  position: absolute;
  inset: auto 20% 0 20%;
  height: 30px;
  background: radial-gradient(circle, rgba(15, 20, 40, 0.55), transparent 70%);
  z-index: -1;
}

.home__highlights {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 0.25rem;
  text-align: left;
}

.home__highlight-grid {
  display: grid;
  gap: var(--gap-md);
}

.home__highlight {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}

.home__highlight-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  font-size: 1.4rem;
}

.home__highlight h3 {
  margin: 0;
  font-size: 1.2rem;
}

.home__highlight p {
  margin: 0;
  color: var(--text-secondary);
}

.home__timeline {
  display: flex;
  flex-direction: column;
  gap: var(--gap-sm);
}

.home__timeline-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.home__timeline-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: flex-start;
}

.home__step-index {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(124, 92, 255, 0.18);
  color: var(--accent-color);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.home__timeline-step h3 {
  margin: 0;
  font-size: 1.1rem;
}

.home__timeline-step p {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

@media (min-width: 768px) {
  .home {
    max-width: 960px;
    margin: 0 auto;
  }

  .home__hero {
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 2.75rem 2.5rem;
  }

  .home__highlight-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
