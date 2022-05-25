const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const res = require('express/lib/response');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ee3pzih.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        // console.log('database connected');
        const purchaseCollection = client.db('oak_tools').collection('purchases');
        const bookingCollection = client.db('oak_tools').collection('bookings');

        app.get('/purchase', async(req, res) =>{
            const query = {};
            const cursor = purchaseCollection.find(query);
            const purchases = await cursor.toArray();
            res.send(purchases);
        });

        app.post('/booking', async(req, res)=>{
          const booking = req.body;
          const query = {userName: booking.userName}
          const exists = await bookingCollection.findOne(query);
          if(exists){
            return res.send({success: false, booking: exists})
          }
          const result = await bookingCollection.insertOne(booking);
         return res.send({success: true,result});
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