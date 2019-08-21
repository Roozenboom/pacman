<template>
  <div class="ghost">
    <span v-for="(row, rI) in maze[name]"
          :key="rI"
          class="row">
      <span v-for="(col, cI) in row"
            :key="cI"
            :ref="`x${cI}y${rI}`"
            class="tile"></span>
    </span>
  </div>
</template>

<script>
import { mapState } from "vuex";

import { graph, path } from "../../lib/pathfinder";
import { Timer } from "../../lib/timer.js";

import { DATA, STATUS, MODE } from "../data/pacman";

const FPS = 4;
const SHOW_GHOST_TARGET = false;

const timeouts = { blinky: [], pinky: [], inky: [], clyde: [] };
const animationreference = { blinky: [], pinky: [], inky: [], clyde: [] };

export default {
  name: "Ghost",
  props: ["name"],
  data() {
    return {
      ghost: {
        blinky: {
          x: 14,
          y: 11,
          timeout: 0
        },
        pinky: {
          x: 14,
          y: 13,
          timeout: 4
        },
        inky: {
          x: 12,
          y: 14,
          timeout: 16
        },
        clyde: {
          x: 16,
          y: 15,
          timeout: 32
        }
      }
    };
  },
  computed: mapState(["status", "mode", "maze", "ghosts", "pacman"]),
  mounted() {
    this.setupPath();

    this.$store.watch(
      (state, getters) => getters.status,
      (newValue, oldValue) => {
        if (oldValue === STATUS.INITIAL || oldValue === STATUS.RESET) {
          this.createGhost();
        }
        if (newValue === STATUS.RESET) {
          this.resetGhost();
        }
        if (oldValue === STATUS.PAUSED) {
          this.resumeGamePlay();
        }
        if (newValue === STATUS.PAUSED) {
          this.pauseGamePlay();
        }
      }
    );
  },
  methods: {
    createGhost() {
      this.setGhost(this.ghost[this.name], this.name);
      timeouts[this.name] = [
        new Timer(() => {
          this.moveGhost(DATA.ghosts[this.name].start, 1);
        }, 1000 * this.ghost[this.name].timeout)
      ];
    },
    setGhost(position, name) {
      if (position) {
        const ghost = this.$refs[`x${position.x}y${position.y}`][0];
        if (ghost) {
          if (name) {
            this.$store.commit("MOVE_GHOST", {
              name: this.name,
              x: position.x,
              y: position.y
            });
          }
          if (name) {
            name = this.mode === MODE.FRIGHTENED ? "death" : name;
          }
          ghost.setAttribute("data-ghost", name);

          if (position.x === this.pacman.x && position.y === this.pacman.y) {
            if (this.mode === MODE.FRIGHTENED) {
              this.$store.commit("DEATH_GHOST", {
                ghost: this.name,
                position
              });
            } else {
              this.$store.commit("GAME_OVER", {
                ghost: this.name,
                position
              });
            }
          }
        }
      }
    },
    moveGhost(steps, index) {
      if (this.status === STATUS.GAMEOVER) return;
      if (this.status !== STATUS.PLAY) {
        let int = setInterval(() => {
          clearInterval(int);
          this.moveGhost(steps, index);
        }, 500);
      } else {
        this.doMove(steps, index);
      }
    },
    doMove(steps, index) {
      setTimeout(() => {
        this.$store.commit("CLEAR_GHOST", {
          name: this.name
        });
        if (steps.length - 1 !== 0) {
          this.setGhost(steps[index - 1], "");
          this.$store.commit("BLOCK_GHOST", {
            name: this.name,
            ...steps[index - 1]
          });
        }
        this.setGhost(steps[index], this.name);

        if (index < steps.length - 1 && index < 8) {
          this.setGhost(steps[index - 1], "");
          this.setGhost(steps[index], this.name);

          let i = index + 1;

          if (
            ["clyde"].includes(this.name) &&
            this.getDistance() < 8 &&
            index >= 8
          ) {
            this.nextMove();
          } else {
            animationreference[this.name].push(
              requestAnimationFrame(() => {
                this.moveGhost(steps, i);
              })
            );
          }
        } else {
          this.nextMove();
        }
      }, 1000 / FPS);
    },
    nextMove() {
      if (this.mode === MODE.SCATTER) {
        const index = DATA.ghosts[this.name].scatter.findIndex(
          pos =>
            pos.x === this.ghosts[this.name].x &&
            pos.y === this.ghosts[this.name].y
        );

        if (index >= 0) {
          this.moveGhost(DATA.ghosts[this.name].scatter, index + 1);
        } else {
          this.findGhostPath({
            x: DATA.ghosts[this.name].scatter[0].x,
            y: DATA.ghosts[this.name].scatter[0].y
          });
        }
      } else if (this.mode !== MODE.SCATTER) {
        this.findGhostPath(this.getTarget());
      } else {
        this.findGhostPath({
          x: Math.floor(Math.random() * 28) + 1,
          y: Math.floor(Math.random() * 31) + 1,
          offset: {
            dir: "x",
            x: 1,
            y: 1
          }
        });
      }
    },
    resetGhost() {
      timeouts[this.name].map(timer => {
        timer.cancel();
      });

      cancelAnimationFrame(animationreference[this.name]);
      animationreference[this.name] = [];

      this.removeGhost();
    },
    removeGhost() {
      const ghost = this.$refs[
        `x${this.ghosts[this.name].x}y${this.ghosts[this.name].y}`
      ][0];
      ghost.setAttribute("data-ghost", "");
      this.setGhostTarget(null, null);
    },
    pauseGamePlay() {
      timeouts[this.name].map(timer => {
        timer.pause();
      });
    },
    resumeGamePlay() {
      timeouts[this.name].map(timer => {
        timer.resume();
      });
    },
    setupPath() {
      graph.setData(this.maze[this.name]);
    },
    getDistance() {
      return (
        Math.abs(this.pacman.x - this.ghosts[this.name].x) +
        Math.abs(this.pacman.y - this.ghosts[this.name].y)
      );
    },
    getTarget() {
      const target = {
        x: this.pacman.x,
        y: this.pacman.y,
        offset: {
          dir: "x",
          x: this.pacman.x - this.ghosts[this.name].x > 0 ? -1 : 1,
          y: this.pacman.y - this.ghosts[this.name].y > 0 ? -1 : 1
        }
      };

      if (["clyde"].includes(this.name) && this.getDistance() < 8) {
        target.x = DATA.ghosts[this.name].scatter[0].x;
        target.y = DATA.ghosts[this.name].scatter[0].y;
      }

      if (["pinky", "inky"].includes(this.name) && this.getDistance() > 8) {
        switch (this.pacman.direction) {
          case "left":
            target.x = this.pacman.x - 4;
            break;
          case "top":
            target.y = this.pacman.y - 4;
            break;
          case "right":
            target.x = this.pacman.x + 4;
            break;
          case "bottom":
            target.y = this.pacman.y + 4;
            break;
          default:
            break;
        }

        if (this.name === "inky") {
          const vector = {
            x: target.x - this.ghosts.blinky.x,
            y: target.y - this.ghosts.blinky.y
          };

          target.offset = {
            dir: "x",
            x: vector.x > 0 ? -1 : 1,
            y: vector.y > 0 ? -1 : 1
          };
          target.x = Math.min(
            Math.max(parseInt(target.x + vector.x * 2), 1),
            28
          );
          target.y = Math.min(
            Math.max(parseInt(target.y + vector.y * 2), 1),
            31
          );
        }
      }

      return target;
    },
    setGhostTarget(step, status) {
      for (let key in this.$refs) {
        this.$refs[key][0].setAttribute("data-status", "empty");
      }
      if (SHOW_GHOST_TARGET && step) {
        const tile = this.$refs[`x${step.x}y${step.y}`][0];
        tile.setAttribute("data-status", status);
      }
    },
    findGhostPath(target) {
      this.setupPath();

      const result = path.findPath(
        this.ghosts[this.name].x,
        this.ghosts[this.name].y,
        target.x,
        target.y
      );

      if (result) {
        this.setGhostTarget(result[0], this.name);
        this.moveGhost(result.reverse(), 1);
      } else {
        if (target.offset.dir === "x") {
          target.offset.dir = "y";
          target.x = Math.min(
            Math.max(parseInt(target.x + target.offset.x), 1),
            28
          );
          if (target.x === 1) {
            target.offset.x = 1;
          }
          if (target.x === 28) {
            target.offset.x = -1;
          }
        } else {
          target.offset.dir = "x";
          target.y = Math.min(
            Math.max(parseInt(target.y + target.offset.y), 1),
            31
          );
          if (target.y === 1) {
            target.offset.y = 1;
          }
          if (target.y === 31) {
            target.offset.y = -1;
          }
        }
        this.findGhostPath(target);
      }
    }
  }
};
</script>

<style scoped>
.ghost {
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

span.row {
  display: grid;
  grid-row: span 1;
  grid-column: span 28;
  grid-template-columns: repeat(28, 1fr);
}
.tile {
  margin: -3px;
}
.tile[data-ghost="blinky"] {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 211 206"><path fill="%23d31" d="M211 206V88h-17V39h-14l-1-16h-14V8l-31-1V0H73v7H44v16l-16-1v16H12l-1 47H0v121h12v-13h16v-17h16v16h15v14h29v-30h29v30h34l1-15h13v-15h14v15h15v15z"/><path fill="%23fff" d="M166 54h-17V39h-31v15h-13v44h13v16h31V98h17zM75 55H58V40H27v15H13v44h14v16h31V99h17z"/><path fill="%2335a" d="M139 94h-29V66h29zM48 94H19V67h29z"/></svg>')
    center center no-repeat;
}
.tile[data-status="blinky"] {
  background: red;
}
.tile[data-ghost="pinky"] {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 211 206"><path fill="%23fbd" d="M211 206V88h-17V39h-14l-1-16h-14V8l-31-1V0H73v7H44v16l-16-1v16H12l-1 47H0v121h12v-13h16v-17h16v16h15v14h29v-30h29v30h34l1-15h13v-15h14v15h15v15z"/><path fill="%23fff" d="M166 54h-17V39h-31v15h-13v44h13v16h31V98h17zM75 55H58V40H27v15H13v44h14v16h31V99h17z"/><path fill="%2335a" d="M139 94h-29V66h29zM48 94H19V67h29z"/></svg>')
    center center no-repeat;
}
.tile[data-status="pinky"] {
  background: pink;
}
.tile[data-ghost="inky"] {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 211 206"><path fill="%234be" d="M211 206V88h-17V39h-14l-1-16h-14V8l-31-1V0H73v7H44v16l-16-1v16H12l-1 47H0v121h12v-13h16v-17h16v16h15v14h29v-30h29v30h34l1-15h13v-15h14v15h15v15z"/><path fill="%23fff" d="M166 54h-17V39h-31v15h-13v44h13v16h31V98h17zM75 55H58V40H27v15H13v44h14v16h31V99h17z"/><path fill="%2335a" d="M139 94h-29V66h29zM48 94H19V67h29z"/></svg>')
    center center no-repeat;
}
.tile[data-status="inky"] {
  background: cyan;
}
.tile[data-ghost="clyde"] {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 211 206"><path fill="%23fb5" d="M211 206V88h-17V39h-14l-1-16h-14V8l-31-1V0H73v7H44v16l-16-1v16H12l-1 47H0v121h12v-13h16v-17h16v16h15v14h29v-30h29v30h34l1-15h13v-15h14v15h15v15z"/><path fill="%23fff" d="M166 54h-17V39h-31v15h-13v44h13v16h31V98h17zM75 55H58V40H27v15H13v44h14v16h31V99h17z"/><path fill="%2335a" d="M139 94h-29V66h29zM48 94H19V67h29z"/></svg>')
    center center no-repeat;
}
.tile[data-status="clyde"] {
  background: orange;
}
.tile[data-ghost="death"] {
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 221 217" ><path d="M 221.74 216.345 L 221.69 215.405 L 221.69 92.048 L 204.352 92.363 L 204.044 40.703 L 188.964 40.703 L 188.656 24.109 L 172.96 24.109 L 172.96 8.14 L 141.261 7.828 L 140.645 0 L 76.632 0 L 76.322 7.513 L 46.162 7.828 L 46.162 23.795 L 29.545 23.483 L 29.545 39.763 L 12.311 39.763 L 12.003 89.857 L 0 89.543 L 0.308 216.033 L 12.311 216.033 L 12.387 202.883 L 29.237 202.883 L 29.237 185.037 L 46.267 184.932 L 46.267 201.631 L 62.269 201.839 L 62.475 216.657 L 92.225 216.868 L 92.225 184.932 L 123.411 184.724 L 123.207 216.657 L 159.111 216.868 L 159.317 200.795 L 173.883 200.795 L 173.729 184.725 L 188.501 184.725 L 188.656 200.691 L 204.044 200.377 L 204.044 216.501 Z" fill="%233f5da8"></path><path d="M 91.922 113.234 L 69.072 113.234 L 69.072 89.404 L 91.922 89.404 Z M 149.082 113.255 L 126.212 113.255 L 126.212 89.403 L 149.082 89.403 Z M 56.414 170.242 L 39.857 170.242 L 39.857 153.684 L 56.414 153.684 Z M 72.781 153.497 L 56.222 153.497 L 56.222 136.939 L 72.781 136.939 Z M 89.342 170.055 L 72.784 170.055 L 72.784 153.496 L 89.341 153.496 Z" fill="%23fff"></path><path d="M 105.9 153.497 L 89.341 153.497 L 89.341 136.939 L 105.899 136.939 Z" fill="%23fff"></path><path d="M 122.261 169.867 L 105.702 169.867 L 105.702 153.308 L 122.261 153.308 Z" fill="%23fff"></path><path d="M 138.631 153.497 L 122.073 153.497 L 122.073 136.94 L 138.63 136.94 Z M 155.188 170.054 L 138.63 170.054 L 138.63 153.497 L 155.188 153.497 Z M 171.745 153.497 L 155.188 153.497 L 155.188 136.94 L 171.745 136.94 Z" fill="%23fff"></path></svg>')
    center center no-repeat;
}

@keyframes blink {
  50% {
    background-color: transparent;
  }
}
</style>