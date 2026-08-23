import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_STORAGE_DIR = path.join(__dirname, '../.data');

// Local in-memory / JSON fallback store for ultra-resilience
class LocalDataStore {
  constructor() {
    this.dir = LOCAL_STORAGE_DIR;
    if (!fs.existsSync(this.dir)) {
      try {
        fs.mkdirSync(this.dir, { recursive: true });
      } catch (e) {
        console.warn('Could not create local storage directory:', e.message);
      }
    }
    this.memory = {
      workflows: new Map(),
      versions: new Map(),
      analyses: new Map(),
    };
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      const file = path.join(this.dir, 'store.json');
      if (fs.existsSync(file)) {
        const raw = fs.readFileSync(file, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.workflows) Object.entries(parsed.workflows).forEach(([k, v]) => this.memory.workflows.set(k, v));
        if (parsed.versions) Object.entries(parsed.versions).forEach(([k, v]) => this.memory.versions.set(k, v));
        if (parsed.analyses) Object.entries(parsed.analyses).forEach(([k, v]) => this.memory.analyses.set(k, v));
      }
    } catch (e) {
      console.warn('Failed to load disk store:', e.message);
    }
  }

  saveToDisk() {
    try {
      const file = path.join(this.dir, 'store.json');
      const obj = {
        workflows: Object.fromEntries(this.memory.workflows),
        versions: Object.fromEntries(this.memory.versions),
        analyses: Object.fromEntries(this.memory.analyses),
      };
      fs.writeFileSync(file, JSON.stringify(obj, null, 2));
    } catch (e) {
      console.warn('Failed to persist store to disk:', e.message);
    }
  }
}

export const localStore = new LocalDataStore();
export let isMongoConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flowintel_ai';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.log(`[MongoDB] Not detected or connection timed out (${error.message}). Running with Resilient Embedded Storage.`);
  }
};
