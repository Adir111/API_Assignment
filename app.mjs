import { Product, ProductsManager } from './classes.mjs';
import express from 'express';
import bodyParser from 'body-parser';


const app = express();
app.use(bodyParser.json());
let manager = new ProductsManager();


// Show all products
app.get('/api/products', (req, res) => {

    res.status(manager.getLastStatus()).json(manager.getProducts());
});


// Add a new product
app.post('/api/products', (req, res) => {
    const { name, description, category, amount } = req.body;

    let answer = manager.addProduct(name, description, category, amount) || 
    `Product '${name}' with description '${description}' of category '${category}' has been added successfully with amount of '${amount || 0}'!`;
    res.status(manager.getLastStatus()).json(answer);
});


// Update product amount
app.put('/api/products/:name', (req, res) => {
    const productName = req.params.name;
    const newAmount = req.body.amount;

    let answer = manager.updateAmount(productName, newAmount) || `Product: '${productName}' amount has been updated successfully to '${newAmount}!'`;
    res.status(manager.getLastStatus()).json(answer);
  });

  
// Delete product
app.delete('/api/products/:name', (req, res) => {
    const productName = req.params.name;

    let answer = manager.deleteProduct(productName) || `Product: '${productName} has been deleted successfully!`;
    res.status(manager.getLastStatus()).json(answer);
  });


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});