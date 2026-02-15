export const START_COINS = 800;
export const ROOM_RENT_PER_DAY = 120;
export const FIRST_PLOT_COST = 2500;
export const BASE_PLOT_COST = 2500;

export const ADMIN_BUILDINGS = [
  { type: 'Bakery', x: -1, z: 0 },
  { type: 'Coffee Shop', x: 0, z: 0 },
  { type: 'Supermarket', x: 1, z: 0 },
  { type: 'Hair Salon', x: 0, z: -1 },
  { type: 'Gym', x: 0, z: 1 }
];

export const BUILDING_UPGRADE_COST = (currentLevel) =>
  Math.round(420 * Math.pow(currentLevel, 1.72));

export const buildingMaintenance = (level) => 8 * level;

export const NPC_ENTER_PROBABILITY = ({ priceFactor, designScore, reputation, occupancy }) =>
  (100 - priceFactor) * designScore * reputation * (1 - occupancy);
