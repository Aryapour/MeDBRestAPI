import { MongoClient, ObjectId } from 'mongodb'
const dbHost = "localhost:27017"
const dbUser = "mta"
const dbPassword = "mta1"
const dbName = "mehdi"
const dataCollection = "data"
const usersCollection = "users"
const destConnString = `mongodb://${dbUser}:${dbPassword}@${dbHost}?authSource=${dbName}`
const dbServer = new MongoClient(destConnString)

let logonUsers = new Map();

// Method for connecting to the database
const openDbConn = async () => {
    try {
        await dbServer.connect();
        return dbServer.db(dbName)
    } catch (error) {
        console.error("Failed to conencto to the database", error)
        throw error;
    }
}

// Method for using a certain collection
const connDbCollection = async (collection) => {
    return db.collection(collection)
}

const sendQuery = async (query, toArray = false) => {
    try {
        const result = await query
        if(toArray)
            return await result.toArray()
        else 
            console.log("should do something")
    } catch (err) {
        console.error("Query execution failed", err)
        throw err
    }
}

const findOneUser = async (username) => {
    const usersCol = await connDbCollection(usersCollection);
    return sendQuery(usersCol.aggregate([
        { $match: { username } },
        { $project: { 
            user: "$username", 
            pass: "$password",  
            _id: 0 
        }}
    ]), true);
};

const getUsersRecords= async () => {
    const db = await openDbConn(); 
    const usersCol = db.collection(usersCollection);
    return usersCol.aggregate([
        {
            $lookup: {
                from: dataCollection, 
                localField: "username", 
                foreignField: "userid", 
                as: "userRecords" 
            }
        },
        {
            $group: {
                _id: "$username",
                usersRecordsCount: { $sum: { $size: "$userRecords" } } 
            }
        },
        {
            $project: {
                _id: 0,
                username: 1,
                "Users records": { $size: "$userRecords" } 
            }
        }
    ]).toArray();
};


/* some code here */

// Connect to database when the application starts
const db = await openDbConn()

const closeDbConnection = async () => {
    try {
        await dbServer.close()
        console.log("Database conenction closed")
    } catch (error) {
        console.error("Failed to close the database connection", error)
    }
}

process.on("SIGINT", closeDbConnection)
process.on("SIGNTERM", closeDbConnection)

export {
    findOneUser,
    getUsersRecords
}
