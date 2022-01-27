const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jy11d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
  try{
    await client.connect();
    const database = client.db('travell_blogs');
    const blogsCollection = database.collection('blogs');
    const reviewsCollection = database.collection('Reviews');
    const usersCollection = database.collection('Users');

      // get api  
      app.get('/blogs',async(req,res)=>{
        const cursor = blogsCollection.find({});
        const blogs = await cursor.toArray();
       
        res.send(blogs)
    });
     // delete product  api 
  app.delete('/blogDelete/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await blogsCollection.deleteOne(query);
    res.json(result)
})
    
          //  get single product api 
          app.get('/blogs/:id',async(req,res)=>{
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const blog = await blogsCollection.findOne(query);
           
            res.json(blog);
  
            });
            
    
             // post api 
             app.post('/blogs',async(req,res)=>{
              const blog = req.body;
              const result =await blogsCollection.insertOne(blog);
              res.json(result)
          });


           // get single product  api 
        app.get('/singleBlog/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await blogsCollection.findOne(query);
          // console.log(result);
          res.json(result)

      })

           // update product api 
        app.put('/blog/:id', async (req, res) => {
          const id = req.params.id;
          const updatedBlog = req.body;
          const filter = { _id: ObjectId(id) };
          const options = { upsert: true }
          const updateDoc = {
              $set: {
                  name: updatedBlog.title,
                  img: updatedBlog.img,
                  price: updatedBlog.cost,
                  description: updatedBlog.description,
                  name: updatedBlog.name,
                  category: updatedBlog.category,
                  location:updatedBlog.location
              }
          }
          const result = await blogsCollection.updateOne(filter, updateDoc, options)
          // console.log(result)
          res.json(result)
      });

      
// user post api 
app.post('/users', async (req, res) => {
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  console.log(result);
  res.json(result);
});
app.put('/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  console.log(result);
  res.json(result);
});
// search admin api 
app.get('/users/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await usersCollection.findOne(query);
  let isAdmin = false;
  if (user?.role === 'admin') {
      isAdmin = true;
  }
  res.json({ admin: isAdmin });
})

 /// make admin 
 app.put('/users/admin', async(req,res)=>{
  const user = req.body;
  const filter = {email: user.email};
  const updateDoc = { $set: { role: 'admin'}};
  const result = await usersCollection.updateOne(filter,updateDoc);
  
  res.json(result)
})


    // reviews post api 
    app.post('/reviews', async (req, res) => {
      const data = req.body;
      const result = await reviewsCollection.insertOne(data);
      res.json(result);
  })
   // reviews get api 
   app.get('/reviews', async (req, res) => {
    const cursor = reviewsCollection.find({});
    const result = await cursor.toArray();
    res.json(result)
});

      


    
  
  }
  finally {
    // await client.close();
  }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('travel agency is running!')
})

app.listen(port, () => {
  console.log(`Listening at ${port}`)
})



// https://lit-coast-44901.herokuapp.com/