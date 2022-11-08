const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken')
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
        const commentCollection = client.db('traveloholic').collection('comments')

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ token })
        })

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

        app.post('/comments', async (req, res) => {
            const comments = req.body;
            const result = await commentCollection.insertOne(comments)
            res.send(result)
        })

        app.get('/comments', async (req, res) => {
            const query = {};
            const cursor = commentCollection.find(query);
            const comments = await cursor.toArray();
            res.send(comments)
        })

        app.get('/playlists/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const content = await playlistCollection.findOne(query)
            res.send(content)
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