import Vue from 'vue';
import VueRouter from 'vue-router';

import Game from '@/game/game';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',
  routes: [{ path: '/game', component: Game }, { path: '*', redirect: '/game' }]
});
