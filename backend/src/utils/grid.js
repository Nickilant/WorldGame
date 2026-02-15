import { BASE_PLOT_COST } from '../config/constants.js';

export const plotKey = (x, z) => `${x},${z}`;

export const mooreNeighborhood = (x, z) => {
  const points = [];
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dz = -1; dz <= 1; dz += 1) {
      if (dx === 0 && dz === 0) continue;
      points.push({ x: x + dx, z: z + dz });
    }
  }
  return points;
};

export const cardinalRoads = (x, z) => [
  { x: x + 1, z },
  { x: x - 1, z },
  { x, z: z + 1 },
  { x, z: z - 1 }
];

export const computePlotCost = ({ ownedPlots, totalCityBuildings }) => {
  const exponent = ownedPlots * 0.18 + totalCityBuildings * 0.04;
  return Math.round(BASE_PLOT_COST * Math.pow(1.15, exponent));
};
