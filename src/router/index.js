import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import SnowOwl from '../views/SnowOwl.vue';
// import EscapeRoom from '@/views/EscapeRoom.vue';
// import FeelIT from '@/views/FeelIT.vue';
import ArgTeam1 from '@/views/ArgTeam1.vue';
// import AgentFromage from '@/views/AgentFromage.vue';
import LaserLockdown from '@/views/LaserLockdown.vue';
import QrCode from '@/views/QrCode.vue';
// import MarioClone from '@/views/MarioClone.vue';
import FlappyWifi from '@/views/FlappyWifi.vue';
// import CyberClues from '@/views/CyberClues.vue';
import MultiChoice from '@/views/MultiChoice.vue';
import SpaceInvaders from '@/views/SpaceInvaders.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/snowowl', component: SnowOwl },
  { path: '/game1', component: MultiChoice },
  { path: '/game2', component: SpaceInvaders },
  { path: '/game3', component: LaserLockdown },
  { path: '/game4', component: FlappyWifi },
  { path: '/game5', component: ArgTeam1 },
  { path: '/qrcode', component: QrCode }
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
      return { top: 0 }
    }
});

export default router;
