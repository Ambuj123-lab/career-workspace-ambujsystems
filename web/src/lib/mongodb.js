import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.warn("[MongoDB] Connection warning (non-blocking):", err.message);
      return null;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect().catch((err) => {
    console.warn("[MongoDB] Connection warning (non-blocking):", err.message);
    return null;
  });
}

export async function getDb() {
  try {
    if (!uri) return null;
    const c = await clientPromise;
    if (!c) return null;
    const dbName = process.env.MONGODB_DB_NAME || "covercraft_db";
    return c.db(dbName);
  } catch (err) {
    console.warn("[MongoDB] getDb error:", err.message);
    return null;
  }
}

/**
 * Log user session telemetry upon login / visit
 */
export async function logUserTelemetry(user) {
  try {
    const db = await getDb();
    if (!db || !user?.email) return;

    const usersCol = db.collection("users");
    await usersCol.updateOne(
      { email: user.email },
      {
        $set: {
          name: user.name || "Anonymous",
          image: user.image || null,
          lastActive: new Date(),
        },
        $setOnInsert: {
          firstSeen: new Date(),
          generationCount: 0,
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.warn("[MongoDB Telemetry] Failed to log user:", err.message);
  }
}

/**
 * Log cover letter generation telemetry
 */
export async function logGenerationTelemetry(data) {
  try {
    const db = await getDb();
    if (!db) return;

    const generationsCol = db.collection("generations");
    await generationsCol.insertOne({
      ...data,
      timestamp: new Date(),
    });

    if (data.userEmail) {
      const usersCol = db.collection("users");
      await usersCol.updateOne(
        { email: data.userEmail },
        {
          $inc: { generationCount: 1 },
          $set: { lastActive: new Date() },
        }
      );
    }
  } catch (err) {
    console.warn("[MongoDB Telemetry] Failed to log generation:", err.message);
  }
}

export default clientPromise;
