export class Product {
    constructor(name, description, category, amount) {
        this.name = name || "N/A";
        this.description = description || "N/A";
        this.category = category || "N/A";
        this.amount = amount || 0;
    }
}


// Status numbers:
const status_OK = 200;
const status_Created = 201;
const status_BadRequest = 400;
const status_NotFound = 404;
const status_InternalServerError = 500;

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";

// use when starting application as docker container
// let mongoUrlDocker = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "my-db";



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


        this.getProducts = function() {
            if (_products == []) {
                MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
                    if (err) {
                        _lastStatus = status_InternalServerError;
                        throw err;
                    }

                    let db = client.db(databaseName);


                    db.collection("products").find({}).toArray(function (err, results) {
                        if (err) {
                            _lastStatus = status_InternalServerError;
                            throw err;
                        }
                        response = results;
                        client.close();
                    });
                });

                response.forEach(product => {
                    let { name, description, category, amount } = product;
                    manager.addProduct(name, description, category, amount);
                });
            }

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
                _products.push(new Product(name, description, category, amount));
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
                    _products[productIndex].amount = newAmount;
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
                _products[productIndex] = _products[_amountOfProducts - 1];
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