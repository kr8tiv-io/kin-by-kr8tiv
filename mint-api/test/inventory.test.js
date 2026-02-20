import test from "node:test";
import assert from "node:assert/strict";

import { buildTierInventory, classifyTier } from "../src/inventory.js";

function asset(id, tierLabel) {
  return {
    id,
    content: {
      metadata: {
        name: `Genesis ${tierLabel} ${id}`,
        attributes: [{ trait_type: "Tier", value: tierLabel }]
      }
    }
  };
}

test("classifyTier recognizes tier trait values", () => {
  assert.equal(classifyTier(asset("a1", "Egg")), "egg");
  assert.equal(classifyTier(asset("b1", "Hatchling")), "hatchling");
  assert.equal(classifyTier(asset("c1", "Elder")), "elder");
});

test("buildTierInventory enforces 20/20/20 caps and deduplicates ids", () => {
  const assets = [];
  for (let i = 1; i <= 25; i += 1) {
    assets.push(asset(`egg-${i.toString().padStart(2, "0")}`, "Egg"));
    assets.push(asset(`hatch-${i.toString().padStart(2, "0")}`, "Hatchling"));
    assets.push(asset(`elder-${i.toString().padStart(2, "0")}`, "Elder"));
  }

  // Duplicate asset id should not count twice.
  assets.push(asset("egg-01", "Egg"));

  const inventory = buildTierInventory(assets, {
    egg: 20,
    hatchling: 20,
    elder: 20
  });

  assert.equal(inventory.egg.length, 20);
  assert.equal(inventory.hatchling.length, 20);
  assert.equal(inventory.elder.length, 20);
  assert.deepEqual(inventory.egg.slice(0, 3), ["egg-01", "egg-02", "egg-03"]);
});

test("buildTierInventory ignores assets without supported tier metadata", () => {
  const unknown = {
    id: "mystery-1",
    content: {
      metadata: {
        name: "Genesis Mystery",
        attributes: [{ trait_type: "Type", value: "Unknown" }]
      }
    }
  };

  const inventory = buildTierInventory([unknown], {
    egg: 20,
    hatchling: 20,
    elder: 20
  });

  assert.deepEqual(inventory, { egg: [], hatchling: [], elder: [] });
});
