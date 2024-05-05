// Status numbers:
const status_OK = 200;
const status_Created = 201;
const status_BadRequest = 400;
const status_NotFound = 404;

// Imports:
import { Product } from './classes.mjs';

// Product Manager Module:
let ProductsManager = (function() {

    // Private area:
    let _products = [];
    let _amountOfProducts = 0;
    let _lastStatus = status_OK;

    // Finding name index and returns it. Returns -1 if not found.
    function findNameIndex(name) {
        for (let i = 0; i < _amountOfProducts; i++) {
            if (_products[i].name === name) {
                return i;
            }
        }
        return -1;
    }



    // Public area - returned object:
    return {
        // Returns last status
        getLastStatus: function() {
            return _lastStatus;
        },
    
        // Returns products array
        getProducts: function () {
            _lastStatus = status_OK;
            return _amountOfProducts == 0? "No products!" : _products;
        },

        // Returns undefined in case added successfully, otherwise returns error reason.
        addProduct: function (name, description, category, amount) {
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
                // products.push(Object.create(Product).init(name, description, category, amount)); // using object
                _products.push(new Product(name, description, category, amount));
                _lastStatus = status_Created;
                _amountOfProducts++;
            }
            else _lastStatus = status_BadRequest;
            return answer;
        },
    
        // Return undefined in case updated successfully, otherwise returns error reason.
        updateAmount: function (name, newAmount) {
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
        },
    
        // Return undefined in case updated successfully, otherwise returns error reason.
        deleteProduct: function (name) {
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
    };
})();


// Get Data:
ProductsManager.addProduct("Chair", "A chair for your kitchen", "Furniture", 25);
ProductsManager.addProduct("Table", "A nice looking table", "Kitchen", 3);
ProductsManager.addProduct("Sofa", "White big comfy sofa!", "Living room", 2);
ProductsManager.addProduct("Computer", "16GB RAM, OS Windows 10 Proffesional, i7, 1TB SSD", "Electronics", 1);
ProductsManager.addProduct("Keyboard", "Black, mech keyboard", "Electronics", 3);
ProductsManager.addProduct("Mouse", "White simple mouse for pc", "Electroincs", 3);


import express from 'express';
import bodyParser from 'body-parser';
const app = express();

app.use(bodyParser.json());


// Show all products
app.get('/api/products', (req, res) => {
    res.status(ProductsManager.getLastStatus()).json(ProductsManager.getProducts());
});


// Add a new product
app.post('/api/products', (req, res) => {
    const { name, description, category, amount } = req.body;

    let answer = ProductsManager.addProduct(name, description, category, amount) || 
    `Product '${name}' with description '${description}' of category '${category}' has been added successfully with amount of '${amount || 0}'!`;
    res.status(ProductsManager.getLastStatus()).json(answer);
});


// Update product amount
app.put('/api/products/:name', (req, res) => {
    const productName = req.params.name;
    const newAmount = req.body.amount;

    let answer = ProductsManager.updateAmount(productName, newAmount) || `Product: '${productName}' amount has been updated successfully to '${newAmount}!'`;
    res.status(ProductsManager.getLastStatus()).json(answer);
  });

  
// Delete product
app.delete('/api/products/:name', (req, res) => {
    const productName = req.params.name;

    let answer = ProductsManager.deleteProduct(productName) || `Product: '${productName} has been deleted successfully!`;
    res.status(ProductsManager.getLastStatus()).json(answer);
  });


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});