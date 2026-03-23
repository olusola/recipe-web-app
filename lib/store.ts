import fs from "fs"
import path from "path"
import type { StoreDataType } from "./types"

const DB_PATH = path.join(process.cwd(), "data", "db.json")
const SEED_PATH = path.join(process.cwd(), "data", "mockdata.json")

const ensureDb = (): void => {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(DB_PATH)) {
    const seed = fs.readFileSync(SEED_PATH, "utf-8")
    fs.writeFileSync(DB_PATH, seed, "utf-8")
  }
}

export const getStore = (): StoreDataType => {
  ensureDb()
  const raw = fs.readFileSync(DB_PATH, "utf-8")
  return JSON.parse(raw) as StoreDataType
}

export const saveStore = (data: StoreDataType): void => {
  ensureDb()
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8")
}

export const generateNextId = (
  prefix: string,
  items: { id: string }[]
): string => {
  let max = 0
  const pattern = new RegExp(`^${prefix}(\\d+)$`)
  for (const item of items) {
    const match = item.id.match(pattern)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > max) max = num
    }
  }
  return `${prefix}${max + 1}`
}
