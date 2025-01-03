/* HOW NEXT JS is DIFFERENT? 

when db is connected in backend in express and mongoDB, once the connection is established, it remains open until the server is closed.

but in next js , being an edge time framework , we dnt know whether the server is running for the first time or not. therefore we need to check if the model is already built or not. 
and therefore each time we will need to check if connection already exists or not.

*/
import mongoose from "mongoose";

type connectionObject={
    isConnected?:number;
}

const connection:connectionObject={}

async function dbConnect():Promise<void>{

    // pehle check whether the connection already exists
    if(connection.isConnected){
        console.log("Using existing connection");
        return;
    }

    try {
        const db= await mongoose.connect(process.env.MONGODB_URI || '',{})

        connection.isConnected=db.connections[0].readyState;

        console.log(db);
        console.log(connection);
        
        console.log("DB Connected");
        
    } catch (error) {
        console.log("DB Connection Failed",error);
        process.exit(1)
    }
}

export default dbConnect;