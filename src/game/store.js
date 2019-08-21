import Vue from 'vue';
import Vuex from 'vuex';

import { DATA, TYPES, STATUS, MODE } from './data/pacman';

Vue.use(Vuex);

const state = {
  maze: {
    pacman: JSON.parse(JSON.stringify(DATA.maze)),
    blinky: JSON.parse(JSON.stringify(DATA.maze)),
    pinky: JSON.parse(JSON.stringify(DATA.maze)),
    inky: JSON.parse(JSON.stringify(DATA.maze)),
    clyde: JSON.parse(JSON.stringify(DATA.maze))
  },
  status: STATUS.INITIAL,
  mode: '',
  score: 0,
  pacman: {
    x: 13,
    y: 23,
    direction: 'right'
  },
  ghosts: {
    blinky: {
      x: 14,
      y: 11,
      blocked: []
    },
    pinky: {
      x: 14,
      y: 13,
      blocked: []
    },
    inky: {
      x: 12,
      y: 14,
      blocked: []
    },
    clyde: {
      x: 16,
      y: 15,
      blocked: []
    }
  }
};

const getters = {
  pacman(state) {
    return state.pacman;
  },
  status(state) {
    return state.status;
  },
  mode(state) {
    return state.mode;
  }
};

const mutations = {
  TOGGLE_PLAY_GAME(state) {
    if (state.status === STATUS.PLAY) {
      state.status = STATUS.PAUSED;
    } else {
      state.status = STATUS.PLAY;
    }
  },
  RESET_GAME(state) {
    state.status = STATUS.RESET;
    state.pacman = {
      x: 13,
      y: 23,
      direction: 'right'
    };
    state.maze = {
      pacman: JSON.parse(JSON.stringify(DATA.maze)),
      blinky: JSON.parse(JSON.stringify(DATA.maze)),
      pinky: JSON.parse(JSON.stringify(DATA.maze)),
      inky: JSON.parse(JSON.stringify(DATA.maze)),
      clyde: JSON.parse(JSON.stringify(DATA.maze))
    };
  },
  SET_MODE(state, payload) {
    state.mode = payload.mode;
  },
  INCREMENT(state, payload) {
    state.score += payload;
  },
  SET_DIRECTION(state, payload) {
    state.pacman.direction = payload;
  },
  MOVE_PACMAN(state, payload) {
    state.pacman = payload;
    state.maze.pacman[state.pacman.y][state.pacman.x] = TYPES.GROUND;

    if (payload.direction === 'left') {
      if (state.pacman.x === 0) {
        state.pacman.x = 27;
      } else if (state.maze.pacman[state.pacman.y][state.pacman.x - 1] !== TYPES.WALL) {
        state.pacman.x = state.pacman.x - 1;
      }
    } else if (payload.direction === 'up') {
      if (state.maze.pacman[state.pacman.y - 1][state.pacman.x] !== TYPES.WALL) {
        state.pacman.y = state.pacman.y - 1;
      }
    } else if (payload.direction === 'right') {
      if (state.pacman.x === 27) {
        state.pacman.x = 0;
      } else if (state.maze.pacman[state.pacman.y][state.pacman.x + 1] !== TYPES.WALL) {
        state.pacman.x = state.pacman.x + 1;
      }
    } else if (payload.direction === 'down') {
      if (
        state.maze.pacman[state.pacman.y + 1][state.pacman.x] !== TYPES.WALL &&
        state.maze.pacman[state.pacman.y + 1][state.pacman.x] !== TYPES.DOOR
      ) {
        state.pacman.y = state.pacman.y + 1;
      }
    }
    if (state.maze.pacman[state.pacman.y][state.pacman.x] === TYPES.POWER) {
      state.score += 50;
      state.mode = MODE.FRIGHTENED;
    }
    if (state.maze.pacman[state.pacman.y][state.pacman.x] === TYPES.COIN) {
      state.score += 10;
    }

    state.maze.pacman[state.pacman.y][state.pacman.x] = TYPES.PACMAN;
  },
  CLEAR_GHOST(state, payload) {
    state.ghosts[payload.name].blocked.map(tile => {
      state.maze[payload.name][tile.y][tile.x] = TYPES.GROUND;
    });
  },
  BLOCK_GHOST(state, payload) {
    if (payload.x && payload.y) {
      state.maze[payload.name][payload.y][payload.x] = TYPES.WALL;
      state.ghosts[payload.name].blocked.push({
        y: [payload.y],
        x: [payload.x]
      });
    }
  },
  MOVE_GHOST(state, payload) {
    state.ghosts[payload.name].x = payload.x;
    state.ghosts[payload.name].y = payload.y;
  },
  DEATH_GHOST(state) {
    state.score += 100;
  },
  GAME_OVER(state) {
    state.status = STATUS.GAMEOVER;
  }
};

export default new Vuex.Store({
  state,
  getters,
  mutations
});
