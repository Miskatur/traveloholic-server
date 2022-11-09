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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {
        const playlistCollection = client.db('traveloholic').collection('playlist');
        const commentCollection = client.db('traveloholic').collection('comments')

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
            res.send({ token })
        })


        //Limited playlist

        app.get('/playlist', async (req, res) => {
            const query = {};
            const cursor = playlistCollection.find(query);
            const playlist = await cursor.limit(3).toArray();
            res.send(playlist)
        })


        //Full Playlist
        app.get('/playlists', async (req, res) => {
            const query = {};
            const cursor = playlistCollection.find(query);
            const playlist = await cursor.toArray();
            res.send(playlist)
        })

        //Posting content to the playlist
        app.post('/playlists', async (req, res) => {
            const content = req.body;
            const result = await playlistCollection.insertOne(content)
            res.send(result)
        })

        //posting comments
        app.post('/comments', verifyJWT, async (req, res) => {
            const comments = req.body;
            const result = await commentCollection.insertOne(comments)
            res.send(result)
        })


        //getting comments using service id

        app.get('/comments', async (req, res) => {
            let query = {};
            if (req.query.comment_id) {
                query = {
                    comment_id: req.query.comment_id
                }
            }
            const cursor = commentCollection.find(query);
            const comments = await cursor.toArray();
            res.send(comments)
        })

        //getting comment using email
        app.get('/comment', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'Forbidden Access' })
            }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = commentCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })


        //individual playlist using id
        app.get('/playlists/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const content = await playlistCollection.findOne(query)
            res.send(content)
        })

        app.get('/comments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const comment = await commentCollection.findOne(query)
            res.send(comment)
        })

        app.patch('/comments/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const comment = req.body.comments;
            const updateUser = {
                $set: {
                    comment: comment
                }
            };
            const result = await commentCollection.updateOne(filter, updateUser);
            res.send(result)
        })

        app.delete('/comment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await commentCollection.deleteOne(query)
            res.send(result)
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