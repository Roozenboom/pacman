<template>
  <main>
    <div class="container">
      <div class="score">SCORE: {{score}}</div>
      <div class="game">
        <div class="ui">
          <span
            v-for="(line, index) in ui"
            :key="index"
            class="line"
            :class="line.classes"
            :style="{ gridArea: line.y + ' / ' + line.x + '/ span ' + line.rows + '/ span ' + line.cols}"
          ></span>
        </div>
        <Pacman></Pacman>
        <Ghost name="blinky"></Ghost>
        <Ghost name="pinky"></Ghost>
        <Ghost name="inky"></Ghost>
        <Ghost name="clyde"></Ghost>

        <div class="message-box" v-if="status !== 2">
          <p>{{message}}</p>
        </div>
      </div>
    </div>
  </main>
</template>
<script>
import { mapState } from "vuex";

import { Timer } from "../lib/timer.js";

import { DATA, STATUS, MODE } from "./data/pacman";

import Ghost from "./components/ghost";
import Pacman from "./components/pacman";

const timeouts = [];

export default {
  name: "Game",
  components: { Ghost, Pacman },
  data() {
    return {
      ui: DATA.ui,
      message: ""
    };
  },
  computed: mapState(["status", "score", "mode"]),
  mounted() {
    this.createGame();
    this.gameStatus();
  },
  methods: {
    createGame() {
      document.addEventListener("keydown", e => {
        if (e.keyCode === 32) {
          if (this.status === STATUS.GAMEOVER) {
            this.$store.commit("RESET_GAME");
          } else {
            this.$store.commit("TOGGLE_PLAY_GAME");
          }
        }
      });
    },
    gameStatus() {
      if (this.status === STATUS.INITIAL) {
        this.message = "Press 'spacebar' to start";
      }
      this.$store.watch(
        (state, getters) => getters.status,
        (newValue, oldValue) => {
          if (oldValue === STATUS.INITIAL || oldValue === STATUS.RESET) {
            this.setLevel();
          }
          if (oldValue === STATUS.PAUSED) {
            this.resumeGamePlay();
          }
          switch (newValue) {
            case STATUS.RESET:
              this.message = "Press 'spacebar' to start";
              break;
            case STATUS.PAUSED:
              this.message = "Paused";
              this.pauseGamePlay();
              break;
            case STATUS.GAMEOVER:
              clearTimeout(timeouts);
              this.message = "GAME OVER!";
              break;
            default:
              this.message = "";
              break;
          }
        }
      );
      this.$store.watch(
        (state, getters) => getters.mode,
        (newValue) => {
          if(newValue === MODE.FRIGHTENED) {
            this.pauseGamePlay();

            timeouts.push(
              new Timer(() => {
                this.resumeGamePlay();
              }, 1000 * 15)
            );

          }
        }
      );
    },
    setLevel() {
      let offset = 0;
      const level = {
        1: [
          { id: 1, time: 0, mode: MODE.SCATTER },
          { id: 2, time: 7, mode: MODE.CHASE },
          { id: 3, time: 20, mode: MODE.SCATTER },
          { id: 4, time: 7, mode: MODE.CHASE },
          { id: 5, time: 20, mode: MODE.SCATTER },
          { id: 6, time: 5, mode: MODE.CHASE },
          { id: 7, time: 20, mode: MODE.SCATTER },
          { id: 8, time: 5, mode: MODE.CHASE }
        ]
      };

      level[1].map(item => {
        offset += item.time;
        timeouts.push(
          new Timer(() => {
            this.setGameMode(item.mode);
          }, 1000 * offset)
        );
      });
    },
    pauseGamePlay() {
      timeouts.map(timer => {
        timer.pause();
      });
    },
    resumeGamePlay() {
      timeouts.map(timer => {
        timer.resume();
      });
    },
    setGameMode(mode) {
      this.$store.commit("SET_MODE", { mode });
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
.score {
  font-family: "Press Start 2P", cursive;
  font-size: 0.875rem;
  color: #ddd;
  text-align: right;
}
.game {
  position: relative;
  width: 100%;
  height: calc(100vh - 2rem);
  max-height: 800px;
}
.game::before {
  content: "";
  display: block;
  padding-top: 100%;
}

.message-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(34, 34, 34, 0.6);
  z-index: 100;
}
.message-box p {
  font-family: "Press Start 2P", cursive;
  font-size: 1.25rem;
  color: #ddd;
  margin-top: -2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ui {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(28, 1fr);
  grid-template-rows: repeat(31, 1fr);
  overflow: hidden;
}

span.line {
  position: relative;
}

span.border {
  margin: 4px;
  border: 2px solid #15a;
}
span.border-top {
  margin-top: 4px;
  border-top: 2px solid #15a;
}
span.border-right {
  margin-right: 4px;
  border-right: 2px solid #15a;
}
span.border-bottom {
  margin-bottom: 4px;
  border-bottom: 2px solid #15a;
}
span.border-left {
  margin-left: 4px;
  border-left: 2px solid #15a;
}
span.border-y {
  margin-top: 4px;
  margin-bottom: 4px;
  border-top: 2px solid #15a;
  border-bottom: 2px solid #15a;
}
span.border-y::before,
span.border-y::after {
  content: "";
  border-top: 2px solid #15a;
  border-bottom: 2px solid #15a;
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 6px;
}
span.border-y::before {
  left: -6px;
}
span.border-y::after {
  right: -6px;
}
span.door {
  border-color: #fbd;
  margin: 8px;
}
span.door::before,
span.door::after {
  border-color: #fbd;
}
span.door-l::after,
span.door-r::before {
  display: none;
}
span.border-x {
  margin-left: 4px;
  margin-right: 4px;
  border-left: 2px solid #15a;
  border-right: 2px solid #15a;
}
span.border-x::before,
span.border-x::after {
  content: "";
  border-left: 0.125rem solid #15a;
  border-right: 0.125rem solid #15a;
  position: absolute;
  left: -2px;
  right: -2px;
  height: 6px;
}
span.border-x::before {
  top: -6px;
}
span.border-x::after {
  bottom: -6px;
}
.close-top-left::before {
  content: "";
  border-left: 0.125rem solid #15a;
  position: absolute;
  left: 4px;
  height: 12px;
  top: -6px;
}
.close-top-right::before {
  content: "";
  border-right: 0.125rem solid #15a;
  position: absolute;
  right: 4px;
  height: 12px;
  top: -6px;
}
.close-bottom-left::after {
  content: "";
  border-left: 0.125rem solid #15a;
  position: absolute;
  left: 4px;
  height: 12px;
  bottom: -6px;
}
.close-bottom-right::after {
  content: "";
  border-right: 0.125rem solid #15a;
  position: absolute;
  right: 4px;
  height: 12px;
  bottom: -6px;
}

.close-left-top::before {
  content: "";
  border-top: 0.125rem solid #15a;
  position: absolute;
  top: 4px;
  width: 12px;
  left: -6px;
}
.close-left-bottom::before {
  content: "";
  border-bottom: 0.125rem solid #15a;
  position: absolute;
  bottom: 4px;
  width: 12px;
  left: -6px;
}
.close-right-top::after {
  content: "";
  border-top: 0.125rem solid #15a;
  position: absolute;
  top: 4px;
  width: 12px;
  right: -6px;
}
.close-right-bottom::after {
  content: "";
  border-bottom: 0.125rem solid #15a;
  position: absolute;
  bottom: 4px;
  width: 12px;
  right: -6px;
}
</style>