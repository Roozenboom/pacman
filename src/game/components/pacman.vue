<template>
  <div class="pacman">
    <span v-for="(row, rI) in maze.pacman" :key="rI" class="row">
      <span v-for="(col, cI) in row" :key="cI" :ref="`x${cI}y${rI}`" class="tile"></span>
    </span>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { TYPES, STATUS } from "../data/pacman";

export default {
  name: "Pacman",
  computed: mapState(["status", "maze", "pacman", "ghosts"]),
  mounted() {
    this.$store.watch(
      (state, getters) => getters.status,
      (newValue, oldValue) => {
        if (oldValue === STATUS.INITIAL) {
          this.setupKeyboardControls();
          this.create();
        }
        if (newValue === STATUS.GAMEOVER) {
          this.gameover();
        }
        if (newValue === STATUS.RESET) {
          this.create();
        }
      }
    );

    this.$store.watch(
      (state, getters) => getters.pacman,
      (newValue, oldValue) => {
        if (this.status !== STATUS.RESET) this.setTileStatus(oldValue, "empty");
        this.setTileStatus(newValue, "pacman");
        this.setPacmanDirection(this.pacman);
      }
    );
  },
  methods: {
    create() {
      this.maze.pacman.map((row, rI) => {
        row.map((col, cI) => {
          switch (col) {
            case TYPES.COIN:
              this.setTileStatus({ x: cI, y: rI }, "coin");
              break;
            case TYPES.GROUND:
              this.setTileStatus({ x: cI, y: rI }, "ground");
              break;
            case TYPES.POWER:
              this.setTileStatus({ x: cI, y: rI }, "power");
              break;
            case TYPES.WALL:
              this.setTileStatus({ x: cI, y: rI }, "wall");
              break;
            default:
              break;
          }
        });
      });
      this.setTileStatus(this.pacman, "pacman");
    },
    setTileStatus(step, status) {
      const tile = this.$refs[`x${step.x}y${step.y}`][0];
      tile.setAttribute("data-status", status);
    },
    setPacmanDirection(pacman) {
      const tile = this.$refs[`x${pacman.x}y${pacman.y}`][0];
      tile.setAttribute("data-direction", pacman.direction);
    },
    gameover() {
      const tile = this.$refs[`x${this.pacman.x}y${this.pacman.y}`][0];
      tile.setAttribute("data-animation", "death");
    },
    move(direction) {
      if (this.status === STATUS.PLAY) {
        this.$store.commit("MOVE_PACMAN", {
          x: this.pacman.x,
          y: this.pacman.y,
          direction
        });
      }
    },
    setupKeyboardControls() {
      document.addEventListener("keydown", e => {
        if (e.keyCode === 37) {
          this.move("left");
        } else if (e.keyCode === 38) {
          this.move("up");
        } else if (e.keyCode === 39) {
          this.move("right");
        } else if (e.keyCode === 40) {
          this.move("down");
        }
      });
    }
  }
};
</script>

<style scoped>
.pacman {
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

.pacman .row {
  display: grid;
  grid-row: span 1;
  grid-column: span 28;
  grid-template-columns: repeat(28, 1fr);
}

.pacman .tile[data-status="coin"] {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #ddd;
  justify-self: center;
  align-self: center;
}

.pacman .tile[data-status="power"] {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: #ddd;
  justify-self: center;
  align-self: center;
  animation: blink 0.7s ease infinite;
}

.pacman .tile[data-status="pacman"] {
  position: relative;
  z-index: 99;
  margin: -3px;

  width: 32px;
  height: 32px;
}
.pacman .tile[data-status="pacman"][data-direction="left"] {
  transform: scaleX(-1);
}
.pacman .tile[data-status="pacman"][data-direction="up"] {
  transform: rotate(-90deg);
}
.pacman .tile[data-status="pacman"][data-direction="down"] {
  transform: rotate(90deg);
}

.pacman .tile[data-status="pacman"]::before,
.pacman .tile[data-status="pacman"]::after {
  content: "";
  display: block;
  position: absolute;
  height: 50%;
  width: 100%;
  background-color: #fe0;
}
.pacman .tile[data-status="pacman"]::before {
  top: 0;
  border-radius: 20px 20px 0 0;
  animation: top 0.8s linear infinite;
}
.pacman .tile[data-status="pacman"]::after {
  bottom: 0;
  border-radius: 0 0 20px 20px;
  animation: bottom 0.8s linear infinite;
}
.pacman .tile[data-status="pacman"][data-animation="death"] {
  background-color: #fe0;
  border-radius: 100%;
}
.pacman .tile[data-status="pacman"][data-animation="death"]::before,
.pacman .tile[data-status="pacman"][data-animation="death"]::after {
  animation: none;
}

@keyframes top {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-35deg);
  }
}

@keyframes bottom {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(35deg);
  }
}

@keyframes blink {
  50% {
    background-color: transparent;
  }
}
</style>