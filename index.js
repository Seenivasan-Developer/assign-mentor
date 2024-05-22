import express from 'express';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv'
dotenv.config()

const Mongo_url = process.env.MONGO_URL // this for access mongo atlas
//'mongodb://localhost:27017';// this for access local mongo compass


async function createConnection() {
    const client = new MongoClient(Mongo_url);
    await client.connect()
    console.log("Mongodb is connected")
    return client
}

export const client = await createConnection()


const app = express();
const Port = process.env.Port;

// Inbuilt Middleware
app.use(express.json()); // say data is json or converting body to json data

app.get('/', function (req, res) {
    res.send("Home Page");
})

//1. to create Mentor
app.post('/CreateMentor', async function (req, res) {
    const newMentor = req.body;
    console.log(newMentor)
  const result=await client.db("assign-mentor").collection("mentor").insertMany(newMentor);
    res.send(result);

})

//2. to create Student
app.post('/CreateStudent', async function (req, res) {
    const newStudent = req.body;
    console.log(newStudent)
  const result=await client.db("assign-mentor").collection("student").insertMany(newStudent);
    res.send(result);

})


app.get('/studentlist', async function (req, res) {
    const { category, rating } = req.query;
    console.log(category, rating, req.query)
    // let filteredproducts = products;
    // if (category) {
    //     filteredproducts = filteredproducts.filter((pd) => pd.category === category)
    // }
    // if (rating) {
    //     filteredproducts = filteredproducts.filter((pd) => pd.rating == +rating)
    // }
    let query = {};
    if (category) {
        query.category = category;
    }
    if (rating) {
        query.rating = +rating;
    }
    const filteredproducts = await client.db("assign-mentor").collection("student").find(query).toArray();
    if (filteredproducts.length > 0) {
        res.send(filteredproducts);
    }
    else {
        res.send("Product Not Found For the Specified criteria...");
    }
})

app.get('/mentor/:id', async function (req, res) {
    const { id } = req.params;
    console.log(id, req.params)
    //db.products.findOne({id: id})
    //const product = await products.find((pd) => pd.id === id);
    const product = await client.db("assign-mentor").collection("mentor").findOne({ id: id });
    try {
        if (product) {
            res.send(product);
        }
        else {
            res.status(400).send("Product Not Found...");
        }
    } catch (error) {
        res.status(500).send("Internal Server Error...");
    }
})

app.put('/mentor/:id', async function (req, res) {
    const { id } = req.params;
    console.log(id, req.params)
    //db.products.findOne({id: id})
    //const product = await products.find((pd) => pd.id === id);
    const product = await client.db("assign-mentor").collection("student").deleteOne({ id: id });
    res.send(product);
})

app.listen(Port, () => console.log(`Server Started`))