const { MongoClient, ObjectId } = require('mongodb');

let dbInstance = null;

const normalizeValue = (value) => {
  if (value instanceof ObjectId) {
    return value.toString();
  }

  if (value && typeof value === 'object' && '_id' in value) {
    return normalizeValue(value._id);
  }

  return value;
};

const matchesQuery = (doc, query = {}) =>
  Object.entries(query).every(([key, expected]) => normalizeValue(doc[key]) === normalizeValue(expected));

const createCursor = (docs) => {
  let items = [...docs];

  return {
    sort(sortSpec = {}) {
      const [[field, direction]] = Object.entries(sortSpec);
      items.sort((a, b) => {
        const left = a[field] instanceof Date ? a[field].getTime() : a[field];
        const right = b[field] instanceof Date ? b[field].getTime() : b[field];

        if (left === right) {
          return 0;
        }

        return direction >= 0 ? (left > right ? 1 : -1) : (left > right ? -1 : 1);
      });

      return this;
    },
    async toArray() {
      return [...items];
    },
  };
};

const createMemoryCollection = (store) => ({
  async findOne(query = {}) {
    return store.find((doc) => matchesQuery(doc, query)) || null;
  },

  find(query = {}) {
    return createCursor(store.filter((doc) => matchesQuery(doc, query)));
  },

  async insertOne(doc) {
    const nextDoc = {
      ...doc,
      _id: doc._id || new ObjectId(),
    };

    store.push(nextDoc);

    return { insertedId: nextDoc._id };
  },

  async updateOne(query = {}, update = {}) {
    const doc = store.find((entry) => matchesQuery(entry, query));

    if (!doc) {
      return { matchedCount: 0, modifiedCount: 0 };
    }

    if (update.$set) {
      Object.assign(doc, update.$set);
    }

    return { matchedCount: 1, modifiedCount: 1 };
  },

  async findOneAndUpdate(query = {}, update = {}, options = {}) {
    const doc = store.find((entry) => matchesQuery(entry, query));

    if (!doc) {
      return null;
    }

    if (update.$set) {
      Object.assign(doc, update.$set);
    }

    return options.returnDocument === 'after' ? { ...doc } : null;
  },

  async deleteOne(query = {}) {
    const index = store.findIndex((doc) => matchesQuery(doc, query));

    if (index === -1) {
      return { deletedCount: 0 };
    }

    store.splice(index, 1);
    return { deletedCount: 1 };
  },

  async deleteMany(query = {}) {
    const before = store.length;
    const remaining = store.filter((doc) => !matchesQuery(doc, query));

    store.splice(0, store.length, ...remaining);

    return { deletedCount: before - store.length };
  },
});

const createMemoryDb = () => {
  const collections = new Map();

  return {
    collection(name) {
      if (!collections.has(name)) {
        collections.set(name, []);
      }

      return createMemoryCollection(collections.get(name));
    },
  };
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
  console.log('Connecting to MONGO_URI:', uri ? uri.substring(0, 30) + '...' : 'undefined');

  try {
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    dbInstance = client.db('llm-chat');
    console.log('Native MongoDB Driver Connected successfully!');
  } catch (error) {
    console.error(`Native MongoDB Connection Warning: ${error.message}`);
    console.error('Falling back to in-memory storage for local development.');
    dbInstance = createMemoryDb();
  }
};

const getDb = () => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call connectDB first.');
  }

  return dbInstance;
};

module.exports = { connectDB, getDb };
