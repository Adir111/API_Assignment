import { Product } from './Product.mjs';
import { Status } from './Status.mjs';
import { Database } from './Database.mjs'
import pkg from 'mongodb';
const { MongoClient, MongoError } = pkg;


// Singleton class used for managing products. Using mongodb docker to save data.
class ProductsManager {

    constructor() {
        let _lastStatus = Status.OK;

        (async () => {
        const client = new MongoClient(Database.mongoUrl, Database.mongoClientOptions);
        try {
            await client.connect();
            const db = client.db(Database.databaseName);
            await db.createCollection(Database.productsSchema.title, {
                validator: {
                    $jsonSchema: Database.productsSchema
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
                client = await MongoClient.connect(Database.mongoUrl, Database.mongoClientOptions);
                const db = client.db(Database.databaseName);
                _lastStatus = Status.OK;
                const results = await db.collection(Database.productsSchema.title).find({}, { projection: { _id: 0 } }).toArray();
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
                
                client = await MongoClient.connect(Database.mongoUrl, Database.mongoClientOptions);
                const db = client.db(Database.databaseName);
                const collection = db.collection(Database.productsSchema.title);

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

                client = await MongoClient.connect(Database.mongoUrl, Database.mongoClientOptions);
                const db = client.db(Database.databaseName);
                const query = { name: name };
                const updatedProduct = { $set: { amount: newAmount }};

                const { matchedCount } = await db.collection(Database.productsSchema.title).updateOne(query, updatedProduct);
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

                client = await MongoClient.connect(Database.mongoUrl, Database.mongoClientOptions);
                const db = client.db(Database.databaseName);
                const query = { name: name };
                const { deletedCount } = await db.collection(Database.productsSchema.title).deleteOne(query);
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

const manager = new ProductsManager();
//export default whatevername;
export { manager };