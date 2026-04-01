const mongoose = require("mongoose")
const express = require("express")
const cors = require("cors")  //  Cross-Origin Resource Sharing 

const stockRoutes = require("./routes/stocks")

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/stocks", stockRoutes)

app.get("/",(req,res)=>{
res.send("Portiq API Running")
})

app.listen(5000,()=>{
console.log("Server running on port 5000")
})

mongoose.connect("mongodb://127.0.0.1:27017/portiq")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))