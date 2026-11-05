import { z } from "zod";

// Internal keys are BIGINT identity columns (see docs/adr/0001-bigint-identifiers.md).
// Number.MAX_SAFE_INTEGER (2^53 - 1) is far above any order volume of one cafe, so a
// JSON number is lossless; the upper bound makes the guarantee explicit.
export const identifierSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
