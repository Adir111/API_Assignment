export const Database = {
    productsSchema: {
        title: 'products',
        required: ['name', 'description', 'category'],
        properties: {
            name: { bsonType: 'string' },
            description: { bsonType: 'string' },
            category: { bsonType: 'string' },
            amount: { bsonType: 'number' }
        }
    },
    mongoUrl: "mongodb://admin:password@localhost:27017",
    mongoClientOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    databaseName: "my-db"
}





/*
   use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@localhost:27017";
   use when starting application as docker container
let mongoUrlDocker = "mongodb://admin:password@mongodb";
*/