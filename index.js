const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors')
const dotenv = require('dotenv').config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json());



app.get('/', (req, res) => {
    res.send("customer server is running")
})

const uri = `mongodb+srv://${process.env.DB}:${process.env.PASSWORD}@cluster0.if4agm4.mongodb.net/?retryWrites=true&w=majority`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});




async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const customer_collection = client.db('customerDB').collection('customers')

        app.post('/addcustomer', async (req, res) => {
            const newCustomer = req.body
            const result = await customer_collection.insertOne(newCustomer);
            res.send(result);
        })

        app.get('/customers', async (req, res) => {
            const allCustomers = await customer_collection.find({});
            const result = await allCustomers.toArray()
            res.send(result)
        })

        app.get('/customers/:id', async (req, res) => {
            const id = await req.params.id
            const cursor = await { _id: new ObjectId(id) }
            const result = await customer_collection.findOne(cursor)
            res.send(result)
        })

        app.put('/update/:id', async (req, res) => {
            const id =  req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const customerInfo = req.body;
            const updatedCustomer = {
                $set:{
                    name: customerInfo.name,
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                }
            }
            const result = await customer_collection.updateOne(query,updatedCustomer,options)
            res.send(result)
           
            console.log(id);
        })

        app.delete('/customers/:id', async (req, res) => {
            const id = await req.params.id;
            const cursor = { _id: new ObjectId(id) }
            const result = await customer_collection.deleteOne(cursor)
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log("server is running on the " + port)
})