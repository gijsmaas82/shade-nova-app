import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import SnowOwl from '../views/SnowOwl.vue';
import EscapeRoom from '@/views/EscapeRoom.vue';
import FeelIT from '@/views/FeelIT.vue';
import ArgTeam1 from '@/views/ArgTeam1.vue';
import AgentFromage from '@/views/AgentFromage.vue';
import LaserLockdown from '@/views/LaserLockdown.vue';
import QrCode from '@/views/QrCode.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/snowowl', component: SnowOwl },
  { path: '/game1', component: ArgTeam1 },
  { path: '/game2', component: AgentFromage },
  { path: '/game3', component: LaserLockdown },
  { path: '/game4', component: FeelIT },
  { path: '/game5', component: EscapeRoom },
  { path: '/qrcode', component: QrCode }
  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
