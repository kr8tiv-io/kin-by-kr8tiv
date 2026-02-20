import test from "node:test";
import assert from "node:assert/strict";

import { classifyTier, buildTierInventory } from "../src/inventory.js";

function asset(name, tierTrait) {
  return {
    id: `${name}-id`,
    content: {
      metadata: {
        name,
        attributes: tierTrait ? [{ trait_type: "Tier", value: tierTrait }] : []
      }
    }
  };
}

test("classifyTier prefers explicit Tier trait", () => {
  assert.equal(classifyTier(asset("KIN #001", "Egg")), "egg");
  assert.equal(classifyTier(asset("KIN #002", "Hatchling")), "hatchling");
  assert.equal(classifyTier(asset("KIN #003", "Elder")), "elder");
});

test("classifyTier falls back to name", () => {
  assert.equal(classifyTier(asset("KIN Egg #004")), "egg");
  assert.equal(classifyTier(asset("KIN Hatchling #005")), "hatchling");
  assert.equal(classifyTier(asset("KIN Elder #006")), "elder");
  assert.equal(classifyTier(asset("KIN Unknown #007")), null);
});

test("buildTierInventory enforces cap deterministically", () => {
  const assets = [];
  for (let i = 1; i <= 25; i += 1) {
    assets.push(asset(`KIN Egg #${i.toString().padStart(3, "0")}`, "Egg"));
  }
  const inventory = buildTierInventory(assets, { egg: 20, hatchling: 20, elder: 20 });

  assert.equal(inventory.egg.length, 20);
  assert.equal(inventory.egg[0].includes("#001"), true);
  assert.equal(inventory.egg[19].includes("#020"), true);
});