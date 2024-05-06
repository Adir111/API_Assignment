import { ProductsManager } from './ProductManager.mjs';
import express from 'express';
import bodyParser from 'body-parser';


const app = express();
app.use(bodyParser.json());
const manager = new ProductsManager();


// Show all products
app.get('/api/products', async (req, res) => {
  const products = await manager.getProducts();
  const answer = products.length == 0 ? "No products available" : products;
  res.status(manager.getLastStatus()).json(answer);
  console.log("API get invoked successfully.");
});



// Add a new product
app.post('/api/products', async (req, res) => {
    const { name, description, category, amount } = req.body;

    const answer = await manager.addProduct(name, description, category, amount) || 
    `Product '${name}' with description '${description}' of category '${category}' has been added successfully with amount of '${amount || 0}'!`;
    res.status(manager.getLastStatus()).json(answer);
    console.log("API post invoked successfully.");
});


// Update product amount
app.put('/api/products/:name', async (req, res) => {
    const productName = req.params.name;
    const newAmount = req.body.amount;

    const answer = await manager.updateAmount(productName, newAmount) || `Product: '${productName}' amount has been updated successfully to '${newAmount}!'`;
    res.status(manager.getLastStatus()).json(answer);
    console.log("API put invoked successfully.");
  });

  
// Delete product
app.delete('/api/products/:name', async (req, res) => {
    const productName = req.params.name;

    const answer = await manager.deleteProduct(productName) || `Product: '${productName} has been deleted successfully!`;
    res.status(manager.getLastStatus()).json(answer);
    console.log("API delete invoked successfully.");
  });


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});