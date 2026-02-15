// biome-ignore lint/performance/noNamespaceImport: drizzle schema aggregation
import * as relations from "./migrations/relations";
// biome-ignore lint/performance/noNamespaceImport: drizzle schema aggregation
import * as tables from "./migrations/schema";

// biome-ignore lint/performance/noBarrelFile: drizzle expects re-exports from schema
export * from "./migrations/relations";
export * from "./migrations/schema";

export const schema = {
  ...tables,
  ...relations,
};
