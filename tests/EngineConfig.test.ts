import { PlayerType, UnitType } from "@openfront/engine-api/game/GameTypes";
import { GameConfig } from "@openfront/engine-api/Schemas";
import { Config } from "@openfront/engine-lib/configuration/Config";
import { EngineConfig } from "@openfront/engine/configuration/EngineConfig";
import type { Game, Player } from "@openfront/engine/game/Game";
import { describe, expect, it } from "vitest";

describe("EngineConfig.unitInfo", () => {
  for (const instantBuild of [false, true]) {
    const gameConfig = { instantBuild } as unknown as GameConfig;
    const shared = new Config(gameConfig, false);
    const engine = new EngineConfig(gameConfig, false);

    it(`adds a cost to the shared unit stats (instantBuild=${instantBuild})`, () => {
      for (const type of Object.values(UnitType)) {
        const { cost, ...stats } = engine.unitInfo(type);
        expect(stats).toEqual(shared.unitInfo(type));
        expect(typeof cost).toBe("function");
      }
    });
  }

  it("caches per unit type", () => {
    const engine = new EngineConfig({} as unknown as GameConfig, false);
    expect(engine.unitInfo(UnitType.City)).toBe(engine.unitInfo(UnitType.City));
  });

  it("prices advanced structures progressively and nuclear weapons higher", () => {
    let built = 0;
    const player = {
      type: () => PlayerType.Human,
      isLobbyCreator: () => false,
      unitsOwned: () => built,
      unitsConstructed: () => built,
    } as unknown as Player;
    const engine = new EngineConfig({} as unknown as GameConfig, false);
    const cost = (unit: UnitType) =>
      engine.unitInfo(unit).cost({} as Game, player);

    expect(cost(UnitType.Bunker)).toBe(1_000_000n);
    expect(cost(UnitType.SupplyPost)).toBe(250_000n);
    expect(cost(UnitType.AtomBomb)).toBe(5_000_000n);
    expect(cost(UnitType.HydrogenBomb)).toBe(30_000_000n);
    built = 1;
    expect(cost(UnitType.Bunker)).toBe(2_000_000n);
    expect(cost(UnitType.SupplyPost)).toBe(500_000n);
  });
});
