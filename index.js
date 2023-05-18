const express = require("express");
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.TOY_USER}:${process.env.TOY_PASS}@cluster0.l30hzpi.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyParadiseDB = client.db("toyParadiseDB");
    const toys = toyParadiseDB.collection("toys");

    // Add toy to the database
    app.post("/add-toy", async (req, res) => {
      const data = req.body;
    //   console.log(data);
        const result = await toys.insertOne(data)
        // console.log(result)
      res.send(result);
    });

    app.get('/all-toys', async (req, res) => {
        const result = await toys.find().toArray()
        // console.log(result)

        res.send(result)
    })

    // get user toys
    app.get('/user-toys', async (req, res) => {
      const qData = req.query.email
      // console.log(qData)

      const result = await toys.find({"userEmail": qData}).toArray()

      res.send(result)
    })

    // get single toy
    app.get("/single-toy/:id", async (req, res) => {
      const id = req.params.id
      console.log(id)
      const result = await toys.findOne({_id: new ObjectId(id)})

      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server run on port ${port}`);
});
