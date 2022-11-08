const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const JWT = require('jsonwebtoken')
const port = process.env.PORT || 5000;

require('dotenv').config()
const app = express()
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8r9nhhc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const playlistCollection = client.db('traveloholic').collection('playlist');

        app.get('/playlist', async (req, res) => {
            const query = {};
            const cursor = playlistCollection.find(query);
            const playlist = await cursor.limit(3).toArray();
            res.send(playlist)
        })
        app.get('/playlists', async (req, res) => {
            const query = {};
            const cursor = playlistCollection.find(query);
            const playlist = await cursor.toArray();
            res.send(playlist)
        })


    }
    finally {

    }
}
run().catch(error => console.log(error))




app.get('/', (req, res) => {
    res.send('Traveloholic Server is Running')
})

app.listen(port, () => {
    console.log(`Server is Running on PORT :  ${port}`)
})