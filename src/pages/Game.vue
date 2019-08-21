<template>
  <main>
    <div class="container">
      <div class="pacman">
        <span
          v-for="(line, index) in lines"
          :key="index"
          class="line"
          :class="line.classes"
          :style="{ gridArea: line.y + ' / ' + line.x + '/ span ' + line.rows + '/ span ' + line.cols}"
        ></span>
        <span
          v-for="(dot, index) in dots"
          :key="'1000' + index"
          class
          :class="dot.classes"
          :style="{ gridArea: dot.y + ' / ' + dot.x + '/ span ' + dot.rows + '/ span ' + dot.cols}"
        ></span>
      </div>
    </div>
  </main>
</template>
<script>
import { pacman } from "../data/pacman";

export default {
  name: "Pacman",
  data() {
    return {
      lines: pacman.lines,
      dots: pacman.dots,
      map: pacman.map
    };
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.pacman {
  position: relative;
  width: 100%;
  height: calc(100vh - 2rem);
  max-height: 800px;
  display: grid;
  grid-template-columns: repeat(28, 1fr);
  grid-template-rows: repeat(31, 1fr);
  background-color: #222;
  overflow: hidden;
}

.pacman::before {
  content: "";
  display: block;
  padding-top: 100%;
}

span.dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #fff;
  justify-self: center;
  align-self: center;
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