
import { MongoClient } from 'mongodb';
import { env } from './env.js';

let client;
let db;

export const connectDb = async () => {
  client = new MongoClient(env.MONGODB_URI);

  await client.connect();

  db = client.db(env.DB_NAME);

  await ensureIndexes(db);

  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('DB not connected');
  }

  return db;
};

export const col = (name) => {
  return getDb().collection(name);
};

async function ensureIndexes(database) {
  await database.collection('users').createIndex(
    { firebaseUid: 1 },
    { unique: true }
  );

  await database.collection('workspaces').createIndex(
    { slug: 1 },
    { unique: true }
  );

  await database.collection('workspaceMembers').createIndex(
    { workspaceId: 1, userId: 1 },
    { unique: true }
  );

  await database.collection('workspaceMembers').createIndex(
    { userId: 1 }
  );

  await database.collection('projects').createIndex(
    { workspaceId: 1, slug: 1 },
    { unique: true }
  );

  await database.collection('tasks').createIndex(
    { workspaceId: 1, projectId: 1, status: 1, order: 1 }
  );

  await database.collection('tasks').createIndex(
    { workspaceId: 1, assignees: 1, dueDate: 1 }
  );

  await database.collection('comments').createIndex(
    { workspaceId: 1, taskId: 1, createdAt: 1 }
  );

  await database.collection('notifications').createIndex(
    { userId: 1, read: 1, createdAt: -1 }
  );

  await database.collection('timeEntries').createIndex(
    { workspaceId: 1, userId: 1, startedAt: -1 }
  );

  await database.collection('timeEntries').createIndex(
    { userId: 1 },
    {
      unique: true,
      partialFilterExpression: { endedAt: null }
    }
  );

  await database.collection('invitations').createIndex(
    { tokenHash: 1 },
    { unique: true }
  );

  await database.collection('activityLogs').createIndex(
    { workspaceId: 1, createdAt: -1 }
  );
}
