const kitchenPattern = /\bkitchen\b/i;
const bathroomPattern = /\bbathroom\b/i;

export function renovationTag(rawTag: string | null | undefined) {
  const tag = rawTag?.trim();

  if (!tag) return "Misc";
  if (kitchenPattern.test(tag)) return "Kitchen";
  if (bathroomPattern.test(tag)) return "Bathroom";
  return "Misc";
}

export function liveCostGroupForTag(rawTag: string | null | undefined, name = "") {
  const tag = renovationTag(rawTag);
  const searchableText = `${rawTag ?? ""} ${name}`.toLowerCase();

  if (tag === "Kitchen" || (!rawTag && searchableText.includes("kitchen"))) return "Kitchen";
  if (tag === "Bathroom" || (!rawTag && searchableText.includes("bathroom"))) return "Bathroom";
  return "Misc";
}
