// Status numbers:
const status_OK = 200;
const status_Created = 201;
const status_BadRequest = 400;
const status_NotFound = 404;


// Product Module:
let Product = {
    init: function (name, description, category, amount) {
        this.name = name || "N/A";
        this.description = description || "N/A";
        this.category = category || "N/A";
        this.amount = amount || 0;
        return this;
    }
}


// Product Manager Module:
let ProductsManager = {
    products: [],
    amount: 0,
    lastStatus: status_OK,

    // Returns undefined in case added successfully, otherwise returns error reason.
    addProduct: function (name, description, category, amount) {
        let answer = (function(products, name, description, category, amount){
            if (!name || !description || !category)
                return 'Error: name, description and category are required.';
            if (amount != undefined && amount < 0)
                return 'Error: amount must be higher or equal to 0';

            if ((function(products, name){
                for (const product of products) {
                    if (product.name === name)
                        return true;
                }
                return false;
            })(products, name))
                return 'Error: product with this name already exists.';

            return undefined;
        }
        )(this.products, name, description, category, amount);
        if (!answer)
        {
            this.products.push(Object.create(Product).init(name, description, category, amount));
            this.lastStatus = status_Created;
            this.amount++;
        }
        else this.lastStatus = status_BadRequest;
        return answer;
    },

    // Return undefined in case updated successfully, otherwise returns error reason.
    updateAmount: function (name, newAmount) {
        if (!name || !newAmount)
        {
            this.lastStatus = status_BadRequest;
            return 'Error: name, new Amount are required.';
        }

        if (newAmount < 0){
            this.lastStatus = status_BadRequest;
            return 'Error: amount must be higher or equal to 0';
        }

        for (const product of this.products) {
            if (product.name === name)
            {
                product.amount = newAmount;
                this.lastStatus = status_OK;
                return undefined;
            }
        }
        this.lastStatus = status_NotFound;
        return 'Error: product not found.';
    }
}


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
    res.status(status_OK).json(ProductsManager.products);
});



// Add a new product
app.post('/api/products', (req, res) => {
    const { name, description, category, amount } = req.body;

    let answer = ProductsManager.addProduct(name, description, category, amount) || 
    `Product '${name}' with description '${description}' of category '${category}' has been added successfully with amount of '${amount || 0}'!`;

    res.status(ProductsManager.lastStatus).json(answer);
});



// Update product amount
app.put('/api/products/:name', (req, res) => {
    const productName = req.params.name;
    const newAmount = req.body.amount;

    let answer = ProductsManager.updateAmount(productName, newAmount) || `Product: '${productName}' amount has been updated successfully to '${newAmount}!'`;
    res.status(ProductsManager.lastStatus).json(answer);
  });


// STOPPED HERE
  

  // DELETE endpoint to delete a specific to-do item
app.delete('/api/products/:id', (req, res) => {
    const todoId = req.params.id;
    
    // Find the index of the to-do item with the given ID
    const index = todos.findIndex(todo => todo.id === todoId);
    
    // If the to-do item is found, delete it; otherwise, return a 404 Not Found
    if (index !== -1) {
      const deletedTodo = todos.splice(index, 1)[0];
      res.json(deletedTodo);
    } else {
      res.status(404).json({ error: 'To-do item not found' });
    }
  });


  
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


