import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('Error: MONGODB_URI not found in .env file');
    process.exit(1);
}

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        const db = client.db();
        const collection = db.collection('test_connection');
        await collection.insertOne({ test: true, timestamp: new Date() });
        console.log('Successfully inserted a document into "test_connection" collection.');
        await collection.drop(); // Cleanup
        console.log('Successfully cleaned up test collection.');
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await client.close();
    }
}

run();
