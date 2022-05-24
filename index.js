const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello From oak tools Mama!')
})

app.listen(port, () => {
  console.log(`oak tools app listening on port ${port}`)
})