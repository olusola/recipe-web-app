import fs from "fs"
import path from "path"
import type { StoreDataType } from "./types"
import seedData from "../data/mockdata.json"

const isVercel = process.env.VERCEL === "1"

// In-memory store for Vercel (serverless, read-only filesystem).
// Data persists while the container is warm; reseeds on cold start.
let memoryStore: StoreDataType | null = null

const getMemoryStore = (): StoreDataType => {
  if (!memoryStore) {
    memoryStore = structuredClone(seedData) as StoreDataType
  }
  return memoryStore
}

const saveMemoryStore = (data: StoreDataType): void => {
  memoryStore = data
}

// File-based store for local development.
const getFileStore = (): StoreDataType => {
  const DB_PATH = path.join(process.cwd(), "data", "db.json")
  const SEED_PATH = path.join(process.cwd(), "data", "mockdata.json")

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(DB_PATH)) {
    const seed = fs.readFileSync(SEED_PATH, "utf-8")
    fs.writeFileSync(DB_PATH, seed, "utf-8")
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8")
  return JSON.parse(raw) as StoreDataType
}

const saveFileStore = (data: StoreDataType): void => {
  const DB_PATH = path.join(process.cwd(), "data", "db.json")

  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8")
}

export const getStore = (): StoreDataType => {
  return isVercel ? getMemoryStore() : getFileStore()
}

export const saveStore = (data: StoreDataType): void => {
  if (isVercel) {
    saveMemoryStore(data)
  } else {
    saveFileStore(data)
  }
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
