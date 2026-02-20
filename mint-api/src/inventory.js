export function classifyTier(asset) {
  const metadata = asset?.content?.metadata ?? {};
  const attrs = Array.isArray(metadata.attributes) ? metadata.attributes : [];

  for (const attr of attrs) {
    const key = String(attr?.trait_type ?? "").trim().toLowerCase();
    if (key !== "tier") continue;
    const raw = String(attr?.value ?? "").trim().toLowerCase();
    if (raw.includes("egg")) return "egg";
    if (raw.includes("hatch")) return "hatchling";
    if (raw.includes("elder")) return "elder";
  }

  const name = String(metadata.name ?? "").toLowerCase();
  if (name.includes("egg")) return "egg";
  if (name.includes("hatch")) return "hatchling";
  if (name.includes("elder")) return "elder";
  return null;
}

export function buildTierInventory(assets, tierCaps) {
  const byTier = {
    egg: [],
    hatchling: [],
    elder: []
  };

  for (const asset of assets ?? []) {
    const tier = classifyTier(asset);
    if (!tier) continue;
    const identifier = String(asset?.id ?? "");
    if (!identifier) continue;
    byTier[tier].push(identifier);
  }

  const sorted = {
    egg: [...new Set(byTier.egg)].sort(),
    hatchling: [...new Set(byTier.hatchling)].sort(),
    elder: [...new Set(byTier.elder)].sort()
  };

  return {
    egg: sorted.egg.slice(0, Number(tierCaps?.egg ?? 20)),
    hatchling: sorted.hatchling.slice(0, Number(tierCaps?.hatchling ?? 20)),
    elder: sorted.elder.slice(0, Number(tierCaps?.elder ?? 20))
  };
}
