export class Product {
    constructor(name, description, category, amount) {
        this.name = name || "N/A";
        this.description = description || "N/A";
        this.category = category || "N/A";
        this.amount = amount || 0;
    }
}

import pkg from 'mongodb';
const { MongoClient } = pkg;

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";
// use when starting application as docker container
// let mongoUrlDocker = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

let databaseName = "my-db";


// Status numbers:
const status_OK = 200;
const status_Created = 201;
const status_BadRequest = 400;
const status_NotFound = 404;
const status_InternalServerError = 500;



// Singleton class used for managing products. Using mongodb docker to save data.
export class ProductsManager {
    static #instance = null;

    constructor() {
        if (ProductsManager.#instance) {
            return ProductsManager.#instance;
        }
        
        let _products = [];
        let _amountOfProducts = 0;
        let _lastStatus = status_OK;
        ProductsManager.#instance = this;

        // Collects data from DB into array
        (async () => {
            try {
                const client = await MongoClient.connect(mongoUrlLocal, mongoClientOptions);
                const db = client.db(databaseName);
                const results = await db.collection("products").find({}, { projection: { _id: 0 } }).toArray();
                _products = results.map(data => new Product(data.name, data.description, data.category, data.amount));
                _amountOfProducts = _products.length;
            } catch (err) {
                _lastStatus = status_InternalServerError;
                if (err instanceof MongoError) {
                    return "MongoDB error: " + err.message;
                } else {
                    return "Unexpected error with server: " + err.message;
                }
            } finally {
                client.close;
            }
        })();

        let findNameIndex = function(name) {
            for (let i = 0; i < _amountOfProducts; i++) {
                if (_products[i].name === name) {
                    return i;
                }
            }
            return -1;
        }


         this.getLastStatus = function() {
            return _lastStatus;
        }



        // Returns all products
        this.getProducts = function() {
            _lastStatus = status_OK;
            return _amountOfProducts == 0? "No products!" : _products;
        }



        // Returns undefined in case added successfully, otherwise returns error reason.
        this.addProduct = function(name, description, category, amount) {
            let answer = (function(name, description, category, amount){
                if (!name || !description || !category)
                    return 'Error: name, description and category are required.';
                if (amount != undefined && amount < 0)
                    return 'Error: amount must be higher or equal to 0';
    
                if (findNameIndex(name) != -1)
                    return 'Error: product with this name already exists.';
    
                return undefined;
            })(name, description, category, amount);
            if (!answer)
            {
                (async () => { // Adding to DB
                    try { 
                        const client = await MongoClient.connect(mongoUrlLocal, mongoClientOptions);
                        const db = client.db(databaseName);
                        await db.collection("products").insertOne(new Product(name, description, category, amount));
                    } catch (err) {
                        _lastStatus = status_InternalServerError;
                        if (err instanceof MongoError) {
                            return "MongoDB error: " + err.message;
                        } else {
                            return "Unexpected error with server: " + err.message;
                        }
                    } finally {
                        client.close;
                    }
                })();

                _products.push(new Product(name, description, category, amount)); // Adding to array
                _lastStatus = status_Created;
                _amountOfProducts++;
            }
            else _lastStatus = status_BadRequest;
            return answer;
        }



        // Return undefined in case updated successfully, otherwise returns error reason.
        this.updateAmount = function(name, newAmount) {
            let answer = (function() {
                if (!name || newAmount == undefined)
                    return 'Error: name, new Amount are required.';
        
                if (newAmount < 0)
                    return 'Error: amount must be higher or equal to 0';

                    return undefined;
            })();
    
            if (!answer) {
                let productIndex = findNameIndex(name);
                if (productIndex != -1) {
                    (async () => { // Updating in DB
                        try { 
                            const client = await MongoClient.connect(mongoUrlLocal, mongoClientOptions);
                            const db = client.db(databaseName);
                            const query = { name: name };
                            const updatedProduct = { $set: { amount: newAmount }};
                            await db.collection("products").updateOne(query, updatedProduct);
                        } catch (err) {
                            _lastStatus = status_InternalServerError;
                            if (err instanceof MongoError) {
                                return "MongoDB error: " + err.message;
                            } else {
                                return "Unexpected error with server: " + err.message;
                            }
                        } finally {
                            client.close;
                        }
                    })();
                    _products[productIndex].amount = newAmount; // Updates array
                    _lastStatus = status_OK;
                }
                else {
                    _lastStatus = status_NotFound;
                    answer = 'Error: product not found.';
                }
            }
            else _lastStatus = status_BadRequest;
            return answer;
        }


        // Return undefined in case updated successfully, otherwise returns error reason.
        this.deleteProduct = function(name) {
            if (!name)
            {
                _lastStatus = status_BadRequest;
                return 'Error: name is required.';
            }

            let productIndex = findNameIndex(name);
            if (productIndex != -1) {
                (async () => { // Deleting from DB
                    try { 
                        const client = await MongoClient.connect(mongoUrlLocal, mongoClientOptions);
                        const db = client.db(databaseName);
                        const query = { name: name };
                        const result = await db.collection("products").deleteOne(query);
                    } catch (err) {
                        _lastStatus = status_InternalServerError;
                        if (err instanceof MongoError) {
                            return "MongoDB error: " + err.message;
                        } else {
                            return "Unexpected error with server: " + err.message;
                        }
                    } finally {
                        client.close;
                    }
                })();
                _products[productIndex] = _products[_amountOfProducts - 1]; // Deleting from array
                _products.pop();
                _lastStatus = status_OK;
                _amountOfProducts--;
                return undefined;
            }
    
            _lastStatus = status_NotFound;
            return 'Error: product not found.';
        }
    }  
}