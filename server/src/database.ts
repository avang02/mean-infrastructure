import * as mongodb from "mongodb";
import { Employee } from "./employee";
import { addListener } from "process";

export const collections: {
  employees?: mongodb.Collection<Employee>
} = {};

export async function connectToDatabase(uri: string) {
  const client = new mongodb.MongoClient(uri);
  await client.connect();

  const db = client.db("meanStackInfrastructure");
  await applySchemaValidation(db);

  const employeesCollection = db.collection<Employee>("employees");
  collections.employees = employeesCollection;
}

// Update our existing collection with JSON schema validation so we know our 
// documents will always match the shape of our Employee model,
// even if added elsewhere.
// For more inofrmation about schema validation, see this blog series:
// https://www.mongodb.com/blog/post/json-schema-validation--locking-down-your-model-the-smart-way
async function applySchemaValidation(db: mongodb.Db) {
  const jsonSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "position", "level"],
      additionalProperties: false,
      properties: {
        _id: {},
        name: {
          bsonType: "string",
          description: "'name' is required and is a string",
        },
        position: {
          bsonType: "string",
          description: "'position' is required and is a string",
          minLength: 5
        },
        level: {
            bsonType: "string",
            description: "'level' is required and is one of 'junior', 'mid', or 'senior'",
            enum: ["junior", "mid", "senior"],
        },
      },
    },
  }
}