// Status numbers:
const status_OK = 200;
const status_Created = 201;
const status_BadRequest = 400;
const status_NotFound = 404;

/*
// Product Object:
let Product = {
    init: function (name, description, category, amount) {
        this.name = name || "N/A";
        this.description = description || "N/A";
        this.category = category || "N/A";
        this.amount = amount || 0;
        return this;
    }
}
*/

// Product class:
class Product {
    constructor(name, description, category, amount) {
        this.name = name || "N/A";
        this.description = description || "N/A";
        this.category = category || "N/A";
        this.amount = amount || 0;
    }
}


// Product Manager Module:
let ProductsManager = (function() {

    // Private area:
    let products = [];
    let amountOfProducts = 0;
    let lastStatus = status_OK;

    // Finding name index and returns it. Returns -1 if not found.
    function findNameIndex(name) {
        for (let i = 0; i < amountOfProducts; i++) {
            if (products[i].name === name) {
                return i;
            }
        }
        return -1;
    }



    // Public area:
    return {
        // Returns last status
        getLastStatus: function() {
            return lastStatus;
        },
    
        // Returns products array
        getProducts: function () {
            lastStatus = status_OK;
            return products;
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
                products.push(new Product(name, description, category, amount));
                lastStatus = status_Created;
                amountOfProducts++;
            }
            else lastStatus = status_BadRequest;
            return answer;
        },
    
        // Return undefined in case updated successfully, otherwise returns error reason.
        updateAmount: function (name, newAmount) {
            if (!name || !newAmount)
            {
                lastStatus = status_BadRequest;
                return 'Error: name, new Amount are required.';
            }
    
            if (newAmount < 0) {
                lastStatus = status_BadRequest;
                return 'Error: amount must be higher or equal to 0';
            }
    
            let productIndex = findNameIndex(name);
            if (productIndex != -1) {
                products[productIndex].amount = newAmount;
                lastStatus = status_OK;
                return undefined;
            }

            lastStatus = status_NotFound;
            return 'Error: product not found.';
        },
    
        // Return undefined in case updated successfully, otherwise returns error reason.
        deleteProduct: function (name) {
            if (!name)
            {
                lastStatus = status_BadRequest;
                return 'Error: name is required.';
            }
    
            let productIndex = findNameIndex(name);
            if (productIndex != -1) {
                products[productIndex] = products[amountOfProducts - 1];
                products.pop;
                lastStatus = status_OK;
                amountOfProducts--;
                return undefined;
            }
    
            lastStatus = status_NotFound;
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





const express = require('express');
const bodyParser = require('body-parser');
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


