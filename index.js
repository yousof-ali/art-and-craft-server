require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin:[
    'https://art-and-craft-c921b.web.app',
    'https://art-and-craft-c921b.firebaseapp.com'
  ]
}));
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lewcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const productCollection = client.db('craftoraDB').collection('allCraft');
    const favoritesCollection = client.db('craftoraDB').collection('favorites');
  

    app.get('/all-craft',async(req,res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    app.get('/single-product/:id',async(req,res) => {
      const id = req.params.id ;
      const query = {_id : new ObjectId(id)};
      const result = await productCollection.findOne(query)
      res.send(result);
    });

    app.get('/category',async(req,res) => {
      const query = req.query.category
      const target = {subcategory_name : query};
      const result = await productCollection.find(target).toArray();
      res.send(result);
    });

    app.post('/new-craft',async(req,res) => {
      const newData = req.body
      const result = await productCollection.insertOne(newData);
      res.send(result);
    });

    app.get('/my-craft',async(req,res) => {
      const query = req.query.email
      const target = {email:query};
      const result = await productCollection.find(target).toArray()
      res.send(result); 
    });


    app.put('/update/:id',async(req,res) => {
      const id = req.params.id
      const {img,item_name,subcategory_name,short_description,price,rating,customization,stockStatus} = req.body
      const result = await productCollection.findOneAndUpdate(
        {_id:new ObjectId(id)},
        {
          $set: {
            img:img,
            item_name:item_name,
            subcategory_name:subcategory_name,
            short_description:short_description,
            price:price,
            rating:rating,
            customization:customization,
            stockStatus:stockStatus
          }
        },
        {
          new:true,
          upsert:true
        }
      );
      res.send(result);
      
    });

    app.delete('/delete-mycraft/:id',async(req,res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result);
    })

  // favorites
    app.get('/getfav',async(req,res) => {
      // const qu = req.query.email
      // const filter = {email:qu}
      const result = await favoritesCollection.find().toArray()
      res.send(result);
    })

    app.post('/favorites',async(req,res) => {
      const {ids,email,status} = req.body
      const exist = await favoritesCollection.findOne({ids,email})
      if(!exist){
        const result = await favoritesCollection.insertOne({ids,email,status});
        res.send(result)
      }
    });

    app.delete('/unfav/:id',async(req,res) => {
      const query = {ids : req.params.id}
      const result = await favoritesCollection.deleteOne(query);
      res.send(result);
    })

    // booking

    

    

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res) => {
    res.send('craftora server is runnig!')
});


app.listen(port,() => {
    console.log(`Craftora server is running on port ${port} `)
});