const express = require('express');
const cors = require('cors');

require('dotenv').config()


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fguqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const craftCollection = client.db('craftDB').collection('craft');
        const userCollection = client.db('craftDB').collection('user');

        // Data create for craftItems

        app.post('/crafts', async (req, res) => {
            const newCraftItem = req.body;
            console.log(newCraftItem);

            // Insert the defined document into the "craftCollection"
            const result = await craftCollection.insertOne(newCraftItem);
            // sending the result as a response to the server/crafts route
            res.send(result)
        })

        // Data create for users

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);

            // Insert the defined document into the "craftCollection"
            const result = await userCollection.insertOne(user);
            // sending the result as a response to the server/crafts route
            res.send(result)
        })

        // Data read in the backend server 

        // crafts data read in backend server

        app.get('/crafts', async (req, res) => {

            const subCategory = req.query.subCategory;
            let query = {};
            if (subCategory) {
                query = { subcategoryName: subCategory };
            }
            try {
                const cursor = craftCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            catch(error){
                console.error('Error fetching craft :',error );
            }
        })

        // user data read in backend server

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // individual craft data get in the backend Server against id

        app.get('/crafts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await craftCollection.findOne(query);
            res.send(result);

        })

        // craft data get in the backend Server against email

        app.get('/craftsbyEmail/:email', async (req, res) => {
            const email = req.params.email;
            // console.log('Email received :',email);
            const query = { userEmail: email };
            // console.log('Query:', query);
            const result = await craftCollection.find(query).toArray();
            res.send(result);
            // console.log(result);
        })

        // Update Craft data

        app.put('/crafts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCraft = req.body;
            const craft = {
                $set: {
                    name: updatedCraft.name,
                    image: updatedCraft.image,
                    itemName: updatedCraft.itemName,
                    subcategoryName: updatedCraft.subcategoryName,
                    shortDescription: updatedCraft.shortDescription,
                    price: updatedCraft.price,
                    rating: updatedCraft.rating,
                    customization: updatedCraft.customization,
                    processingTime: updatedCraft.processingTime,
                    stockStatus: updatedCraft.stockStatus,
                    userName: updatedCraft.userName,
                    userEmail: updatedCraft.userEmail,

                }
            }
            const result = await craftCollection.updateOne(filter, craft, options,);
            res.send(result);
        })

        // Craft Item Delete
        app.delete('/crafts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await craftCollection.deleteOne(query);
            res.send(result);
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

app.get('/', async (req, res) => {
    res.send('Ribbonaut server is running')
})

app.listen(port, () => {
    console.log(`Ribbonaut server is running on port : ${port}`)
})
