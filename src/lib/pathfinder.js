const _private = {
  distanceM: (xC, yC, xT, yT) => Math.abs(xT - xC) + Math.abs(yT - yC),
  outOfBounds: (x, y) => x < 0 || x >= graph.data[0].length || y < 0 || y >= graph.data.length
};

class Step {
  constructor(xC, yC, xT, yT, totalSteps, parentStep) {
    this.x = xC;
    this.y = yC;
    this.g = totalSteps;
    this.h = _private.distanceM(xC, yC, xT, yT);
    this.f = totalSteps + this.h;
    this.parent = parentStep;
  }
}

class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export const path = {
  closed: [],
  open: [],
  step: 0,

  addOpen: step => path.open.push(step),
  removeOpen: step => (path.open = path.open.filter(item => item !== step)),
  inOpen: step => path.open.filter(item => item.x === step.x && item.y === step.y).reduce((acc, cur) => cur, false),
  getBestOpen: () => path.open[path.open.reduce((acc, cur, i) => (cur.f < path.open[acc].f ? i : acc), 0)],
  addClosed: step => path.closed.push(step),
  inClosed: step => path.closed.filter(item => item.x === step.x && item.y === step.y).reduce((acc, cur) => cur, false),

  findPath: (xC, yC, xT, yT) => {
    let current, record, stepCost;

    path.reset();
    path.addOpen(new Step(xC, yC, xT, yT, path.step, false));

    while (path.open.length !== 0) {
      current = path.getBestOpen();

      if (current.x === xT && current.y === yT) {
        return path.buildPath(current, []);
      }

      path.removeOpen(current);
      path.addClosed(current);

      graph.getNeighbors(current.x, current.y).map(item => {
        stepCost = current.g + graph.getCost(item.x, item.y);

        record = path.inClosed(item);
        if (record && stepCost >= record.g) return false;

        record = path.inOpen(item);
        if (!record || stepCost < record.g) {
          if (!record) {
            path.addOpen(new Step(item.x, item.y, xT, yT, stepCost, current));
          } else {
            record.parent = current;
            record.g = stepCost;
            record.f = stepCost + record.h;
          }
        }
      });
    }

    return false;
  },

  buildPath: (tile, stack) => {
    stack.push(tile);
    return tile.parent ? path.buildPath(tile.parent, stack) : stack;
  },

  reset: () => (path.closed = path.open = [])
};

export const graph = {
  data: null,
  setData(map) {
    this.data = map;
  },
  blocked: (x, y) => _private.outOfBounds(x, y) || graph.data[y][x] === 0,
  getCost(xT, yT) {
    return graph.data[yT][xT];
  },
  getNeighbors: (x, y) => {
    const neighbors = [];

    if (!graph.blocked(x + 1, y)) neighbors.push(new Tile(x + 1, y));
    if (!graph.blocked(x - 1, y)) neighbors.push(new Tile(x - 1, y));
    if (!graph.blocked(x, y + 1)) neighbors.push(new Tile(x, y + 1));
    if (!graph.blocked(x, y - 1)) neighbors.push(new Tile(x, y - 1));

    return neighbors;
  }
};
