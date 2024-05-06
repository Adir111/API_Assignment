import { Product } from './Product.mjs';
import { Status } from './Status.mjs';
import pkg from 'mongodb';
const { MongoClient, MongoError } = pkg;

// Define schema
const productsSchema = {
    title: 'products',
    required: ['name', 'description', 'category'],
    properties: {
        name: { bsonType: 'string' },
        description: { bsonType: 'string' },
        category: { bsonType: 'string' },
        amount: { bsonType: 'number' }
    }
}; 


// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";
// use when starting application as docker container
// let mongoUrlDocker = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

let databaseName = "my-db";


// Singleton class used for managing products. Using mongodb docker to save data.
export class ProductsManager {
    static #instance = null;

    static getInstance() {
        return ProductsManager.#instance ? ProductsManager.#instance : new ProductsManager();
    }

    constructor() {
        if (ProductsManager.#instance) {
            throw new Error("Singleton: Can't create more then 1 instance! Use GetInstance instead.")
        }
        
        let _lastStatus = Status.OK;
        ProductsManager.#instance = this;

        (async () => {
        const client = new MongoClient(mongoUrlLocal, mongoClientOptions);
        try {
            await client.connect();
            const db = client.db(databaseName);
            await db.createCollection('products', {
                validator: {
                    $jsonSchema: productsSchema
                }
            });
        } catch (err) {
            console.error("Error creating products schema: ", err);
        } finally {
            await client.close();
        }
        })();
         this.getLastStatus = function() {
            return _lastStatus;
        }

        

        // Returns all products
        this.getProducts = async function() {
            let client;
            try {
                client = await MongoClient.connect(mongoUrlLocal, mongoClientOptions);
                const db = client.db(databaseName);
                _lastStatus = Status.OK;
                const results = await db.collection("products").find({}, { projection: { _id: 0 } }).toArray();
                const products = results.map(data => new Product(data.name, data.description, data.category, data.amount));
                return products;
            } catch (err) {
                _lastStatus = Status.INTERNAL_SERVER_ERROR;
                console.error("Error occured: ", err);
                if (err instanceof MongoError) {
                    return "MongoDB error: " + err.message;
                } else {
                    return "Unexpected error: " + err.message;
                }
            } finally {
                if (client) client.close();
            }
        }



        // Returns undefined in case added successfully, otherwise returns error reason.
        this.addProduct = async function(name, description, category, amount) {
            let client;
            try {
                if (!name || !description || !category) {
                    _lastStatus = Status.BAD_REQUEST;
                    return 'Error: name, description, and category are required.';
                }
                if (amount != undefined && amount < 0) {
                    _lastStatus = Status.BAD_REQUEST;
                    return 'Error: amount must be higher or equal to 0';
                }
                
                client = await MongoClient.connect(mongoUrlLocal, mongoClientOptions);
                const db = client.db(databaseName);
                const collection = db.collection("products");

                const productExists = await collection.findOne({ name: name });
                if (productExists) {
                    _lastStatus = Status.BAD_REQUEST;
                    return 'Error: product with this name already exists.';
                } 
                await collection.insertOne(new Product(name, description, category, amount));

            } catch (err) {
                _lastStatus = Status.INTERNAL_SERVER_ERROR;
                console.error("Error occured: ", err);
                if (err instanceof MongoError) {
                    answer = "MongoDB error: " + err.message;
                } else {
                    answer = "Unexpected error with server: " + err.message;
                }
            } finally {
                if (client) {
                    client.close();
                }
            }
            _lastStatus = Status.CREATED;
            return undefined;
        }



        // Return undefined in case updated successfully, otherwise returns error reason.
        this.updateAmount = async function(name, newAmount) {
            let client;
            try {
                if (!name || newAmount == undefined) {
                    _lastStatus = Status.BAD_REQUEST;
                    return 'Error: name and amount are required.';
                }
                if (newAmount != undefined && newAmount < 0) {
                    _lastStatus = Status.BAD_REQUEST;
                    return 'Error: amount must be higher or equal to 0';
                }

                client = await MongoClient.connect(mongoUrlLocal, mongoClientOptions);
                const db = client.db(databaseName);
                const query = { name: name };
                const updatedProduct = { $set: { amount: newAmount }};

                const { matchedCount } = await db.collection("products").updateOne(query, updatedProduct);
                if (matchedCount === 0) {
                    _lastStatus = Status.NOT_FOUND;
                    return 'Error: product not found.';
                }

            } catch (err) {
                _lastStatus = Status.INTERNAL_SERVER_ERROR;
                console.error("Error occured: ", err);
                if (err instanceof MongoError) {
                    return "MongoDB error: " + err.message;
                } else {
                    return "Unexpected error with server: " + err.message;
                }
            } finally {
                if (client) {
                    client.close();
                }                
            }
            _lastStatus = Status.OK;
            return undefined;
        }


        // Return undefined in case updated successfully, otherwise returns error reason.
        this.deleteProduct = async function(name) {
            let client;
            try
            { 
                if (!name)
                {
                    _lastStatus = Status.BAD_REQUEST;
                    return 'Error: product name is required.';
                }

                client = await MongoClient.connect(mongoUrlLocal, mongoClientOptions);
                const db = client.db(databaseName);
                const query = { name: name };
                const { deletedCount } = await db.collection("products").deleteOne(query);
                if (deletedCount === 0) {
                    _lastStatus = Status.NOT_FOUND;
                    return 'Error: product not found.';
                }
            } catch (err) {
                _lastStatus = Status.INTERNAL_SERVER_ERROR;
                console.error("Error occured: ", err);
                if (err instanceof MongoError) {
                    return "MongoDB error: " + err.message;
                } else {
                    return "Unexpected error with server: " + err.message;
                }
            } finally {
                if (client) {
                    client.close();
                }                }
            _lastStatus = Status.OK;
            return undefined;
        }
    }  
}