const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jy11d.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.jy11d.mongodb.net:27017,cluster0-shard-00-01.jy11d.mongodb.net:27017,cluster0-shard-00-02.jy11d.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-vbci67-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



console.log(uri);

async function run(){
  try{
    await client.connect();
    const database = client.db('travell_blogs');
    const spotCollection = database.collection('spots');
    const blogsCollection = database.collection('blogs');
    const userExperienceCollection = database.collection('userExperience');
    const usersCollection = database.collection('Users');

    
          // get api  
          app.get('/blogs',async(req,res)=>{
            const cursor = blogsCollection.find({});
            const blogs = await cursor.toArray();
            res.send(blogs)
        });

      

     //Get Spots API
     app.get('/spots', async (req, res) => {
      const cursor = spotCollection.find({});
      const spots = await cursor.toArray();
      res.send(spots);
  })

  
        //POST UserExperience API
        app.post('/userExperience', async (req, res) => {
          const userExperience = req.body;
          console.log(userExperience);
          const result = await userExperienceCollection.insertOne(userExperience);
          res.json(result);
          console.log(result);
      })

      //GET Experience API
      app.get('/userExperience', async (req, res) => {
          const cursor = userExperienceCollection.find({});
          const experience = await cursor.toArray();
          res.send(experience);
      })

      ///get  all experience
  app.get("/userExperience", async (req, res) => {
    const result = await userExperienceCollection.find({}).toArray();
    res.send(result);
  });

   // order status update api 
   app.put('/experienceStatusUpdate/:id', async (req, res) => {
    const id = req.params.id;
    const newStatus = req.body;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatePackage = {
        $set: {
            status: newStatus.Status
        }
    }
    const result = await userExperienceCollection.updateOne(filter, updatePackage, options)
    res.json(result)
})
// get  sub catagories experience  api 
app.get('/catagoriesexperience', async (req, res) => {
  const status = req.query.status;
  const query = { status: status };
  let cursor = {}
  if (status) {
      cursor = userExperienceCollection.find(query);
  } else {
      cursor = userExperienceCollection.find({});
  }
  const result = await cursor.toArray();
  res.json(result)
})

 //Delete Order
 app.delete('/experienceDelete/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await userExperienceCollection.deleteOne(query);

  res.json(result)
 });

      // //GET Single experience BY ID
      app.get('/userExperience/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const userExperience = await userExperienceCollection.findOne(query);
          res.json(userExperience);
      })
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
          res.json(result)

      })

           // update product api 
        app.put('/blogs/:id', async (req, res) => {
          const id = req.params.id;
          const updatedBlog = req.body;
          const filter = { _id: ObjectId(id) };
          const options = { upsert: true }
          const updateDoc = {
              $set: {
                  name: updatedBlog.title,
                  img: updatedBlog.img,
                  cost: updatedBlog.cost,
                  description: updatedBlog.description,
                  name: updatedBlog.name,
                  category: updatedBlog.category,
                  location:updatedBlog.location
              }
          }
          const result = await blogsCollection.updateOne(filter, updateDoc, options);
          console.log(result)
         res.json(result)
      });

      
// user post api 
app.post('/users', async (req, res) => {
  const user = req.body;
  const result = await usersCollection.insertOne(user);
  res.json(result);
});
app.put('/users', async (req, res) => {
  const user = req.body;
  const filter = { email: user.email };
  const options = { upsert: true };
  const updateDoc = { $set: user };
  const result = await usersCollection.updateOne(filter, updateDoc, options);
  res.json(result);
});
// // search admin api 
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