# BlockCity Empire — MVP Game Design Document

## 1) Core Loop & Mandatory Rules
- Starting state: each player spawns with exactly **800 coins**, `0 crystals`, and `guest` profile by default.
- Housing gate: player is auto-assigned to rented room at login; daily rent is **120 coins/day**.
- Land gate: first plot base cost is **2500**, ensuring players cannot buy on first tick.
- Admin economy seed at server boot:
  - Bakery (0,0)
  - Coffee Shop (-1,0)
  - Supermarket (1,0)
  - Hair Salon (0,-1)
  - Gym (0,1)
- Players apply for jobs at these five admin buildings to bootstrap earnings.

## 2) Camera, City Grid, and Expansion
- View: top-down orbit camera with scene rotated **45°** on Y-axis for isometric feel.
- Grid uses discrete integer coordinates `(x,z)` where each tile is a **1×1 plot**.
- At world init, only center + Moore ring (`3×3`) are buyable.
- On plot purchase:
  1. Mark plot owner.
  2. Auto-place road on 4 cardinal adjacent edges.
  3. Unlock Moore neighborhood around newly owned plot.
- Plot cost formula:

```js
plotCost = Math.round(2500 * Math.pow(1.15, ownedPlots*0.18 + totalCityBuildings*0.04));
```

## 3) Buildings
- Types: `Residential` and `Commercial`.
- Visual L1 form: gray cube (`1×1×1`).
- Upgrade cost:

```js
upgradeCost(level) = Math.round(420 * Math.pow(level, 1.72));
```

- No hard cap on level.
- Upgrade grants:
  - +1 editable floor
  - +new product/service slots (by business rules)
  - +new worker slots
- Maintenance per in-game day:

```js
maintenance(level) = 8 * level;
```

## 4) Editor (MVP)
- Per-floor editor state shape: floor index + texture maps + prefab placements.
- Pixel paint target surfaces: 4 walls + floor + ceiling.
- Texture resolution: 32×32 canvas per editable surface.
- Prefab catalog: windows, doors, signs, plants, furniture, neon signs.
- Design score (`0-100`) generated from coverage + variety + theme bonus.
- Design score impacts NPC entry probability.

## 5) Business Rules
- Allowed businesses (MVP exact set): Bakery, Coffee Shop, Supermarket, Hair Salon, Gym, Pizza Place, Clothing Store, Flower Shop.
- Production/services:
  - Goods: produced by workers over time.
  - Services: occupancy slots with queue/availability.
- Owners can set:
  - Product/service prices
  - Worker salaries

## 6) NPC Visit & Economy Formula

```js
P_enter = (100 - price_factor) * design_score * reputation * (1 - occupancy)
```

- `price_factor` = normalized 0-100 price competitiveness.
- `design_score` and `reputation` normalized 0-1 in simulation runtime.
- `occupancy` normalized 0-1.

## 7) Multiplayer + Auth MVP
- Socket.io authoritative state for:
  - active players
  - plots
  - roads
  - buildings
- Auth endpoints:
  - `/api/auth/guest` returns JWT for guest sessions.
- JWT is required for persistent identity in later milestones; guest mode is default for local testing.

## 8) Monetization (MVP)
- Premium currency: `Crystals`.
- Uses:
  - instant floor upgrade with 50% coin discount equivalent
  - exclusive decorations
  - avatar salon cosmetics (free hair/clothing switch once unlocked)

## 9) Data Models (Mongoose-ready)

```ts
Player {
  _id, name, guest, coins, crystals,
  rentedRoom: boolean,
  avatar: {skin, hair, shirt, pants},
  position: {x,y,z},
  ownedPlots: [{x,z}],
  jobs: [buildingId]
}

Plot {
  _id, x, z, ownerId|null, buyable: boolean,
  roads: {north:boolean,south:boolean,east:boolean,west:boolean}
}

Building {
  _id, ownerId, ownerName,
  type, category, x, z,
  level, designScore,
  floors: [{
    wallNorthTex, wallSouthTex, wallEastTex, wallWestTex, floorTex, ceilingTex,
    prefabs: [{type, x, y, z, rotY}]
  }],
  workers: [{playerId, role, salary}],
  inventory: [{item, qty, price}],
  serviceSlots: [{slotType, occupiedByNpcId|null}]
}
```

## 10) Balance Table (Upgrade cost + maintenance, levels 1..15)

| Level | Upgrade To Next | Daily Maintenance |
|---:|---:|---:|
| 1 | 420 | 8 |
| 2 | 1389 | 16 |
| 3 | 2778 | 24 |
| 4 | 4554 | 32 |
| 5 | 6696 | 40 |
| 6 | 9186 | 48 |
| 7 | 12013 | 56 |
| 8 | 15165 | 64 |
| 9 | 18633 | 72 |
| 10 | 22411 | 80 |
| 11 | 26491 | 88 |
| 12 | 30867 | 96 |
| 13 | 35534 | 104 |
| 14 | 40486 | 112 |
| 15 | 45720 | 120 |

> Note: values follow strict formula `round(420 * level^1.72)`; this produces steeper growth than sample approximation text.

## 11) Implementation Sequence
1. Bootstrap monorepo structure + shared business config.
2. Backend Express + Socket.io server, in-memory city state, guest JWT route.
3. Core city logic: initial buyable 3×3, plot purchase, road auto-placement, Moore unlock.
4. Admin starter buildings seeding on boot.
5. Frontend React + R3F scene with 45° city rotation and top-down controls.
6. Multiplayer presence: connect sockets, spawn players, movement sync.
7. Plot purchase UI/interaction + server reconciliation.
8. Building placement flow on owned plots.
9. MVP editor: 32×32 pixel painter (start with one wall), apply to cube texture.
10. Economy loop tick: rent + maintenance deduction + worker production.
11. Jobs UI for admin buildings.
12. Persistence with MongoDB models and migration from in-memory state.
13. Add NPC walkers (random + A*) and entry decision formula.
14. Polish + balancing + QA.
