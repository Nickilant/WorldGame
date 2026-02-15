import { START_COINS } from '../config/constants.js';
import { cardinalRoads, mooreNeighborhood, plotKey, computePlotCost } from '../utils/grid.js';

const defaultAvatar = {
  skin: '#f1c27d',
  shirt: '#4d9eff',
  pants: '#2c3e50',
  hair: '#2d1c13'
};

const defaultPlayer = ({ id, name, avatar, accountId }) => ({
  id,
  accountId,
  name,
  coins: START_COINS,
  crystals: 0,
  guest: false,
  rentedRoom: true,
  avatar: avatar || defaultAvatar,
  position: { x: 0, y: 0.2, z: 0 },
  ownedPlots: []
});

export class CityState {
  constructor() {
    this.players = new Map();
    this.buildings = [];
    this.plots = new Map();
    this.roads = new Map();
    this.seedInitialBuyablePlots();
  }

  seedInitialBuyablePlots() {
    for (let x = -1; x <= 1; x += 1) {
      for (let z = -1; z <= 1; z += 1) {
        this.plots.set(plotKey(x, z), {
          x,
          z,
          ownerId: null,
          buyable: true
        });
      }
    }
  }

  registerPlayer(id, profile) {
    const player = defaultPlayer({
      id,
      name: profile?.name || `Player-${id.slice(-4)}`,
      avatar: profile?.avatar,
      accountId: profile?.accountId || null
    });
    this.players.set(id, player);
    return player;
  }

  movePlayer(id, position) {
    const player = this.players.get(id);
    if (!player) return;
    player.position = {
      x: Number(position.x) || 0,
      y: 0.2,
      z: Number(position.z) || 0
    };
  }

  removePlayer(id) {
    this.players.delete(id);
  }

  buyPlot(playerId, x, z) {
    const player = this.players.get(playerId);
    const key = plotKey(x, z);
    const plot = this.plots.get(key);
    if (!player || !plot || !plot.buyable || plot.ownerId) {
      return { ok: false, reason: 'Invalid plot.' };
    }

    const cost = computePlotCost({
      ownedPlots: player.ownedPlots.length,
      totalCityBuildings: this.buildings.length
    });

    if (player.coins < cost) {
      return { ok: false, reason: `Not enough coins. Need ${cost}.` };
    }

    player.coins -= cost;
    plot.ownerId = playerId;
    player.ownedPlots.push({ x, z });

    cardinalRoads(x, z).forEach((road) => {
      this.roads.set(plotKey(road.x, road.z), road);
    });

    mooreNeighborhood(x, z).forEach((neighbor) => {
      const nKey = plotKey(neighbor.x, neighbor.z);
      if (!this.plots.has(nKey)) {
        this.plots.set(nKey, { ...neighbor, ownerId: null, buyable: true });
      }
    });

    return { ok: true, cost, coins: player.coins };
  }

  placeBuilding(playerId, payload) {
    const player = this.players.get(playerId);
    if (!player) return { ok: false, reason: 'No player.' };

    const ownsPlot = player.ownedPlots.some((plot) => plot.x === payload.x && plot.z === payload.z);
    if (!ownsPlot) return { ok: false, reason: 'Must own plot.' };

    const occupied = this.buildings.some((b) => b.x === payload.x && b.z === payload.z);
    if (occupied) return { ok: false, reason: 'Plot occupied.' };

    const building = {
      id: `b-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ownerId: playerId,
      ownerName: player.name,
      type: payload.type,
      x: payload.x,
      z: payload.z,
      level: 1,
      designScore: 0.3,
      wallTexture: payload.wallTexture ?? null
    };
    this.buildings.push(building);
    return { ok: true, building };
  }

  toSnapshot() {
    return {
      players: Array.from(this.players.values()),
      buildings: this.buildings,
      plots: Array.from(this.plots.values()),
      roads: Array.from(this.roads.values())
    };
  }
}

export const cityState = new CityState();
