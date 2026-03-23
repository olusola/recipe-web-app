/**
 * Resets data/db.json to the seed state before each E2E test run.
 * Import and call resetDb() in a beforeEach/beforeAll in your test files.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const seedPath = path.resolve(__dirname, "../../data/mockdata.json")
const dbPath = path.resolve(__dirname, "../../data/db.json")

export function resetDb() {
  const seed = fs.readFileSync(seedPath, "utf-8")
  fs.writeFileSync(dbPath, seed, "utf-8")
}
