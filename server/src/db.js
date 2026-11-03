import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');
const metadataCollectionName = '_gyaandhara_metadata';

const defaultData = {
  users: [],
  subjects: [],
  lessons: [],
  questions: [],
  user_progress: [],
  badges: [],
  user_badges: [],
  quiz_attempts: [],
  chat_messages: [],
  game_plays: [],
  game_progress: [],
  teacher_quizzes: [],
  teacher_quiz_attempts: [],
  seasonal_content: [],
  mentor_requests: [],
  mentor_answers: [],
  story_sessions: [],
  loot_boxes: [],
  community_quests: [],
  community_quest_members: [],
  ncert_progress: [],
  villages: [],
  village_leaderboards: [],
  _counters: {
    users: 0,
    subjects: 0,
    lessons: 0,
    questions: 0,
    user_progress: 0,
    badges: 0,
    quiz_attempts: 0,
    chat_messages: 0,
    game_plays: 0,
    game_progress: 0,
    teacher_quizzes: 0,
    teacher_quiz_attempts: 0,
    seasonal_content: 0,
    mentor_requests: 0,
    mentor_answers: 0,
    story_sessions: 0,
    loot_boxes: 0,
    community_quests: 0,
    community_quest_members: 0,
    ncert_progress: 0,
    villages: 0,
    village_leaderboards: 0,
  },
};

fs.mkdirSync(dataDir, { recursive: true });

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(defaultData));
}

function loadFileData() {
  if (!fs.existsSync(dbPath)) {
    const data = cloneDefaultData();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    return data;
  }
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  for (const key of Object.keys(defaultData)) {
    if (key === '_counters') {
      data._counters = { ...defaultData._counters, ...data._counters };
    } else if (!(key in data)) {
      data[key] = defaultData[key];
    }
  }
  return data;
}

function saveFileData(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

let data = loadFileData();
let client;
let mongoDatabase;
let persistenceMode = 'file';
let writeQueue = Promise.resolve();

function enqueueWrite(operation) {
  const result = writeQueue.then(operation);
  writeQueue = result.catch(() => {});
  return result;
}

async function migrateFileData(metadata) {
  const marker = await metadata.findOne({ _id: 'json_migration_v1' });
  if (marker) return;

  const tableNames = Object.keys(defaultData).filter((name) => name !== '_counters');
  const legacyData = loadFileData();
  for (const name of tableNames) {
    const records = legacyData[name] || [];
    if (records.length) {
      await mongoDatabase.collection(name).bulkWrite(
        records.map((record) => ({
          updateOne: {
            filter: { id: record.id },
            update: { $setOnInsert: record },
            upsert: true,
          },
        })),
        { ordered: true }
      );
    }
  }

  await metadata.updateOne(
    { _id: 'counters' },
    { $max: legacyData._counters },
    { upsert: true }
  );
  await metadata.insertOne({ _id: 'json_migration_v1', completed_at: new Date().toISOString() });
  console.log('Merged existing JSON data into MongoDB collections without replacing existing records.');
}

const db = {
  async connect() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      data = loadFileData();
      persistenceMode = 'file';
      console.warn('MONGODB_URI is not set; using local JSON storage.');
      return;
    }

    client = new MongoClient(uri);
    await client.connect();
    mongoDatabase = client.db(process.env.MONGODB_DB_NAME || 'gyaandhara');
    const metadata = mongoDatabase.collection(metadataCollectionName);
    await migrateFileData(metadata);

    const tableNames = Object.keys(defaultData).filter((name) => name !== '_counters');
    const collections = await Promise.all(
      tableNames.map((name) => mongoDatabase.collection(name).find({}).toArray())
    );
    data = Object.fromEntries(tableNames.map((name, index) => [name, collections[index]]));
    const counters = await metadata.findOne({ _id: 'counters' });
    data._counters = { ...defaultData._counters, ...(counters || {}) };
    delete data._counters._id;
    for (const name of tableNames) {
      const maxId = data[name].reduce(
        (maximum, record) => Math.max(maximum, Number(record.id) || 0),
        0
      );
      data._counters[name] = Math.max(data._counters[name] || 0, maxId);
    }
    persistenceMode = 'mongodb';
    console.log(`Connected to MongoDB database "${mongoDatabase.databaseName}".`);
  },

  get mode() {
    return persistenceMode;
  },

  get(table) {
    return data[table] || [];
  },

  find(table, predicate) {
    return this.get(table).find(predicate);
  },

  filter(table, predicate) {
    return this.get(table).filter(predicate);
  },

  insert(table, record) {
    return enqueueWrite(async () => {
      const id = (data._counters[table] || 0) + 1;
      const row = { id, ...record };
      if (persistenceMode === 'mongodb') {
        await mongoDatabase.collection(table).insertOne(row);
        await mongoDatabase.collection(metadataCollectionName).updateOne(
          { _id: 'counters' },
          { $max: { [table]: id } },
          { upsert: true }
        );
      }
      data._counters[table] = id;
      data[table].push(row);
      if (persistenceMode === 'file') saveFileData(data);
      return row;
    });
  },

  update(table, predicate, updates) {
    return enqueueWrite(async () => {
      const index = data[table].findIndex(predicate);
      if (index === -1) return null;
      const updated = { ...data[table][index], ...updates };
      if (persistenceMode === 'mongodb') {
        await mongoDatabase.collection(table).replaceOne({ id: updated.id }, updated);
      }
      data[table][index] = updated;
      if (persistenceMode === 'file') saveFileData(data);
      return updated;
    });
  },

  upsert(table, predicate, record) {
    return enqueueWrite(async () => {
      const index = data[table].findIndex(predicate);
      if (index !== -1) {
        const updated = { ...data[table][index], ...record };
        if (persistenceMode === 'mongodb') {
          await mongoDatabase.collection(table).replaceOne({ id: updated.id }, updated);
        }
        data[table][index] = updated;
        if (persistenceMode === 'file') saveFileData(data);
        return updated;
      }

      const id = (data._counters[table] || 0) + 1;
      const row = { id, ...record };
      if (persistenceMode === 'mongodb') {
        await mongoDatabase.collection(table).insertOne(row);
        await mongoDatabase.collection(metadataCollectionName).updateOne(
          { _id: 'counters' },
          { $max: { [table]: id } },
          { upsert: true }
        );
      }
      data._counters[table] = id;
      data[table].push(row);
      if (persistenceMode === 'file') saveFileData(data);
      return row;
    });
  },

  deleteWhere(table, predicate) {
    return enqueueWrite(async () => {
      const removed = data[table].filter(predicate);
      data[table] = data[table].filter((item) => !predicate(item));
      if (persistenceMode === 'mongodb') {
        const ids = removed.map((r) => r.id);
        if (ids.length) {
          await mongoDatabase.collection(table).deleteMany({ id: { $in: ids } });
        }
      }
      if (persistenceMode === 'file') saveFileData(data);
      return removed.length;
    });
  },

  deleteAll(table) {
    return enqueueWrite(async () => {
      if (persistenceMode === 'mongodb') {
        await mongoDatabase.collection(table).deleteMany({});
      }
      data[table] = [];
      if (persistenceMode === 'file') saveFileData(data);
    });
  },

  reset() {
    return enqueueWrite(async () => {
      if (persistenceMode === 'mongodb') {
        await Promise.all(
          Object.keys(defaultData)
            .filter((name) => name !== '_counters')
            .map((name) => mongoDatabase.collection(name).deleteMany({}))
        );
        await mongoDatabase.collection(metadataCollectionName).updateOne(
          { _id: 'counters' },
          { $set: defaultData._counters },
          { upsert: true }
        );
      }
      data = cloneDefaultData();
      if (persistenceMode === 'file') saveFileData(data);
    });
  },
};

export default db;
