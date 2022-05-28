const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ee3pzih.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const purchaseCollection = client.db('oak_tools').collection('purchases');
        const bookingCollection = client.db('oak_tools').collection('bookings');
        const usersCollection = client.db('oak_tools').collection('users');
        const productsCollection = client.db('oak_tools').collection('products');

        app.get('/purchase', async(req, res) =>{
            const query = {};
            const cursor = purchaseCollection.find(query);  //.project({name: 1})
            const purchases = await cursor.toArray();
            res.send(purchases);
        });

        app.get('/user', async(req, res) =>{
          const users = await usersCollection.find().toArray();
          res.send(users);
        });

        app.put('/user/:email', async(req, res)=>{
          const email = req.params.email;
          const user = req.body;
          const filter = {email: email}
          const options = { upsert: true };
          const updateDoc = {
            $set: user,
          };
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
          res.send({result, token});
        });


        app.put('/user/:admin/:email', async(req, res)=>{
          const email = req.params.email;
          const filter = {email: email}
          const updateDoc = {
            $set: {role:'admin'},
          };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.send(result);
        })


        app.get('/booking', async(req, res) =>{
          const userEmail = req.query.userEmail;
          const query = {userEmail: userEmail};
          const bookings= await bookingCollection.find(query).toArray();
          res.send(bookings);
        })

        app.get('/booking/:id', async(req, res) =>{
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const booking = await bookingCollection.findOne(query);
          res.send(booking);
        })

        app.post('/booking', async(req, res)=>{
          const booking = req.body;
          const query = {userName: booking.userName, date: booking.date, purchase: booking.purchase}
          const exists = await bookingCollection.findOne(query);
          if(exists){
                 return res.send({success: false, booking: exists})
               }
          const result = await bookingCollection.insertOne(booking);
          return res.send({success: true,result});
        });



        app.get('/product', async(req, res)=>{
          const product = await productsCollection.find().toArray();
          res.send(product);
        })

        app.post('/product', async(req, res)=>{
          const product = req.body;
          const result = await productsCollection.insertOne(product);
          res.send(result);
        });

        app.delete('/product/:email', async(req, res)=>{
          const email = req.params.email;
          const filter = {email: email}
          const result = await productsCollection.deleteOne(filter);
          res.send(result);
        })

    }
    finally{}
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello From oak tools Mama!')
})

app.listen(port, () => {
  console.log(`oak tools app listening on port ${port}`)
})