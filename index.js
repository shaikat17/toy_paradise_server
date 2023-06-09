const express = require("express");
const cors = require("cors");
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
      const result = await toys.insertOne(data);
      // console.log(result)
      res.send(result);
    });

    app.get("/all-toys", async (req, res) => {
      let page = parseInt(req.query.page) || 0;
      let limit = parseInt(req.query.limit) || 10;

      // Calculate the total number of documents in the collection
      const totalData = await toys.estimatedDocumentCount();
      // console.log(totalData)

      // Calculate the total number of pages
      const totalPages = Math.ceil(totalData / limit);

      // Validate page value
      if (isNaN(page) || page < 0) {
        page = 0;
      } else if (page > totalPages) {
        page = totalPages;
      }

      const skip = page * limit;

      const result = await toys.find().skip(skip).limit(limit).toArray();
      // console.log(result)

      res.send({ result, totalPages });
    });

    // get user toys
    app.get("/user-toys", async (req, res) => {
      const qData = req.query.email;
      const srt = req.query.sort;
      let result = [];

      console.log(srt);
      if (qData && srt) {
        // If both 'email' and 'sort' parameters are provided
        if (srt === "ascending") {
          result = await toys
            .find({ userEmail: qData })
            .sort({ toyPrice: 1 }) //for dynamic multiple option sort({ [srt]: 1}) => srt = Price, Quantity
            .toArray();
        } else {
          result = await toys
            .find({ userEmail: qData })
            .sort({ toyPrice: -1 })
            .toArray();
        }
      } else {
        // If either 'email' or 'sort' parameter is missing or empty
        result = await toys.find({ userEmail: qData }).toArray();
      }
      res.send(result);
    });

    // update route
    app.put("/edit-toy/:id", async (req, res) => {
      const id = req.params.id;
      const { toyPrice, quantity, description } = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          toyPrice,
          quantity,
          description,
        },
      };
      const options = {
        upsert: true,
      };
      // console.log(req.body)
      const result = await toys.updateOne(query, update, options);
      res.send(result);
    });

    // delete toy
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const result = await toys.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // get single toy
    app.get("/single-toy/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toys.findOne({ _id: new ObjectId(id) });

      res.send(result);
    });

    // get categorywise data
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;

      let result = [];
      if (id === "0") {
        result = await toys.find().toArray();
      } else if (id === "1") {
        result = await toys.find({ category: "Baby Doll" }).toArray();
      } else if (id === "2") {
        result = await toys.find({ category: "Fashion Doll" }).toArray();
      } else if (id === "3") {
        result = await toys.find({ category: "Character Doll" }).toArray();
      }
      // console.log(typeof id)
      res.send(result);
    });

    // serach route
    app.get("/toys", async (req, res) => {
      const src = req.query.q;
      const result = await toys
        .find({ toyName: { $regex: src, $options: "i" } })
        .toArray();

      res.send(result);
    });

    // Total data
    app.get("/total-toys", async (req, res) => {
      const result = await toys.estimatedDocumentCount();

      console.log(result);

      res.send({ result });
    });

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
