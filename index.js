// ==== server.js ====
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});


const uri = "mongodb+srv://mdraihan51674:lmSoe4HIDs9yWlXf@cluster0.cgjf3yb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    // console.log("Connected to MongoDB");

    const database = client.db("Rahad-Buy-Sell");
    const mobileCollection = database.collection("Add-Mobile");
    const saleCollection = database.collection("sales-User-Info");
    const receiptCollection = database.collection("User-Receipt");

    // Add Mobile
    app.post('/addMobile', async (req, res) => {
      try {
        const mobile = req.body;
        mobile.dateAdded = new Date();
        if (!mobile.stockStatus) {
          mobile.stockStatus = "In Stock";
        }
        const result = await mobileCollection.insertOne(mobile);
        res.status(201).json({ message: "Mobile added successfully", insertedId: result.insertedId });
      } catch (error) {
        console.error("Error adding mobile:", error);
        res.status(500).json({ message: "Failed to add mobile" });
      }
    });

    // Get All Mobiles
    app.get('/mobiles', async (req, res) => {
      try {
        const mobiles = await mobileCollection.find({}).toArray();
        res.status(200).json(mobiles);
      } catch (error) {
        console.error("Error fetching mobiles:", error);
        res.status(500).json({ message: "Failed to fetch mobiles" });
      }
    });

       // Delete Mobile
    app.delete('/mobiles/:id', async (req, res) => {
      const id = req.params.id;

      try {
        const result = await mobileCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Mobile not found" });
        }

        res.status(200).json({ message: "Mobile deleted successfully" });
      } catch (error) {
        console.error("Error deleting mobile:", error);
        res.status(500).json({ message: "Failed to delete mobile" });
      }
    });
    //get single data
    app.get('/mobiles/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const mobile = await mobileCollection.findOne({ _id: new ObjectId(id) });
        if (!mobile) {
          return res.status(404).json({ message: "Mobile not found" }); 
        }
        res.status(200).json(mobile);
      } catch (error) {
        console.error("Error fetching mobile:", error);
        res.status(500).json({ message: "Failed to fetch mobile" });
      }
    });

    //update all data
  app.put("/mobiles/:id", async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
   if (updatedData._id) {
    delete updatedData._id;
  }


  

  try {
    const result = await mobileCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Mobile not found" });
    }
    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "No changes detected" });
    }

    res.status(200).json({ message: "Mobile updated successfully" });
  } catch (err) {
    console.error("Failed to update:", err);
    res.status(500).json({ error: "Failed to update" });
  }
});








 app.get("/total-purchase", async (req, res) => {
      try {
        const pipeline = [
          {
            $group: {
              _id: null,
              totalPrice: {
                $sum: { $toDouble: "$price" },  // price string to number conversion
              },
            },
          },
        ];

           
        const result = await mobileCollection.aggregate(pipeline).toArray();

        res.json({ totalPrice: result[0]?.totalPrice || 0 });
      } catch (error) {
        console.error("Aggregation error:", error);
        res.status(500).json({ error: "Failed to calculate total price" });
      }
    });



     app.get("/total-sales", async (req, res) => {
      try {
        const pipeline = [
          {
            $group: {
              _id: null,
              totalPrice: {
                $sum: { $toDouble: "$price" },  // price string to number conversion
              },
            },
          },
        ];
            
        const result = await saleCollection.aggregate(pipeline).toArray();

        res.json({ totalPrice: result[0]?.totalPrice || 0 });
      } catch (error) {
        console.error("Aggregation error:", error);
        res.status(500).json({ error: "Failed to calculate total price" });
      }
    });








    // ✅ Fixed: Get Total Quantity of All Mobiles
    app.get('/total-quantity', async (req, res) => {
      try {
        const result = await mobileCollection.aggregate([
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: { $toInt: "$quantity" } }
            }
          }
        ]).toArray();

        res.json({ totalQuantity: result[0]?.totalQuantity || 0 });
      } catch (error) {
        console.error("Error calculating total quantity:", error);
        res.status(500).json({ error: 'Server error' });
      }
    });

    // Get Total Number of Items
    app.get('/total-items', async (req, res) => {
      try {
        const count = await mobileCollection.countDocuments();
        res.json({ totalItems: count });
      } catch (error) {
        console.error("Error counting items:", error);
        res.status(500).json({ error: 'Failed to count items' });
      }
    });

   

 

    // ======= New Monthly Aggregation APIs =======










    //Add Sale API

  app.post('/addSale', async (req, res) => {
  try {
    const sale = req.body;

    // Validate basic fields
    if (!sale.customerName || !sale.phone || !sale.price || !sale.imei) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Convert numeric fields
    sale.price = parseFloat(sale.price);
    sale.quantity = parseInt(sale.quantity || 1);
    sale.partialAmount = parseFloat(sale.partialAmount || sale.price);
    sale.dueAmount = parseFloat(sale.dueAmount || 0);

    // Add created date
    sale.createdAt = new Date();

    const result = await saleCollection.insertOne(sale);
    res.json({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error("❌ Error adding sale:", err);
    res.status(500).json({ error: "Failed to add sale" });
  }
});



//update partial payment API
app.put("/sales/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  console.log("Updating sale with ID:", id, "with data:", updatedData);
  

  try {
    const result = await saleCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          customerName: updatedData.customerName,
          phone: updatedData.phone,
          quantity: Number(updatedData.quantity),
          date: updatedData.date,
          price: Number(updatedData.price),
          imei: updatedData.imei,
          notes: updatedData.notes,
          paymentType: updatedData.paymentType,
          partialAmount: Number(updatedData.partialAmount),
          dueAmount: Number(updatedData.dueAmount),
          // If you want to update createdAt, handle carefully or omit
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json({ message: "Sale updated successfully" });
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all sales
// ====== Get All Sales ======
app.get('/sales', async (req, res) => {
  try {
    const sales = await saleCollection.find().sort({ createdAt: -1 }).toArray();
    res.json(sales);
  } catch (err) {
    console.error("❌ Error fetching sales:", err);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// Get sale by ID
app.get("/sales/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const sale = await saleCollection.findOne({ _id: new ObjectId(id) }); 
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json(sale);
  } catch (err) {
    console.error("❌ Error fetching sale:", err);
    res.status(500).json({ error: "Failed to fetch sale" });
  }
});
// Deleted
app.delete("/sales/:id", async (req, res) => {
  const id = req.params.id;
  const result = await saleCollection.deleteOne({ _id: new ObjectId(id) });
  res.send(result);
});







// Add Receipt API
app.post("/addReceipt", async (req, res) => {
  try {
    const newData = req.body;
    const result = await receiptCollection.insertOne(newData);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "Database insertion failed" });
  }
});

// app.get("/receipts", async (req, res) => {
//   try {
//     const receipts = await receiptCollection.find({}).toArray();
//     res.status(200).json(receipts);
//   } catch (error) {
//     console.error("Error fetching receipts:", error);
//     res.status(500).json({ error: "Failed to fetch receipts" });
//   }
// });

app.get("/receipts", async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      // Case-insensitive search on multiple fields using $or and regex
      const searchRegex = new RegExp(search, "i"); // "i" for case-insensitive
      query = {
        $or: [
          { customerName: { $regex: searchRegex } },
          { phone: { $regex: searchRegex } },
          { supplierName: { $regex: searchRegex } },
          { model: { $regex: searchRegex } },
        ],
      };
    }

    const receipts = await receiptCollection.find(query).toArray();
    res.status(200).json(receipts);
  } catch (error) {
    console.error("Error fetching receipts:", error);
    res.status(500).json({ error: "Failed to fetch receipts" });
  }
});








  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
