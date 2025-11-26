<template>
  <div class="app-shell">
    <NavBar />
    <main class="view-shell">
      <router-view />
    </main>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';
export default {
  name: 'App',
  components: {
    NavBar
  }
}
</script>

<style>
.app-shell {
  min-height: 100vh;
}

.view-shell {
  padding-top: calc(var(--navbar-height, 96px) + 20px);
  padding-bottom: 32px;
}

@media (min-width: 768px) {
  .view-shell {
    padding-top: calc(var(--navbar-height, 96px) + 32px);
  }
}
</style>

