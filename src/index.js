import { fastify } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db/db-conn.js";


dotenv.config({
    path : "./.env"
});


connectDB()
    .then(() => {
        fastify.listen({port : process.env.PORT || 3000}, () => {
            console.log(`server is running at ${process.env.PORT} `);  
        })
    })
    .catch((err) => {
        console.log("mongoDB connection failed", err);
        
    })