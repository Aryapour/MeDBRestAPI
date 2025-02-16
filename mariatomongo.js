// for MariaDB
import { createPool } from "mariadb"
const sourceHost = "maria.xxxx.xxxx.xxxx.com"
const dbMariaUser = "mta"
const dbMariaPassword = "mta1"
const dbMaria = "mehdi"

// for MongoDB
import { MongoClient, ObjectId } from "mongodb"
const destHost = 'localhost:27017'
const dbAdmin = "mongoAdmin"
const dbAdminPassword = "mta1"
const authDb = "admin"
const destConnString = `mongodb://${dbAdmin}:${dbAdminPassword}@${destHost}?authSource=${authDb}`
const dbMongo = "mehdi"
const dbMongoUser = "mta"
const dbMongoPassword = "mta1"
const dataCollection = "data"
const usersCollection = "user"

const copyDataFromMariaToMongo = async () => {
    const pool = createPool({
        host: sourceHost,
        user: dbMariaUser,
        password: dbMariaPassword,
        database: dbMaria
    })

    let conn
    try {
        conn = await pool.getConnection()
        const users = await conn.query("SELECT * FROM users")
        const data = await conn.query("SELECT * FROM data")

        createCollections(users, data)
    } catch (err) {
        throw err
    } finally {
        if(conn) await conn.close()
        await pool.end()
    }
}

const createCollections = async (usersData, dataData) => {
    const dbServer = new MongoClient(destConnString)

    try {
        await dbServer.connect()
        const db = dbServer.db(dbMongo)

        const dbs = await db.admin().listDatabases()
        if(dbs.databases.find(d => d.name === dbMongo))
            await db.dropDatabase()

        const users = db.collection( usersCollection, {
            validator: {
                $jsonSchema: {
                    bsonType: "Object",
                    required: ["username", "password"],
                    properties: {
                        username: {
                            bsonType: "string",
                            description: "must be a string and it is required"
                        },
                        password: {
                            bsonType: "string",
                            decription: "must be a string and it is required"
                        }
                    }
                }
            }
        })
        users.createIndex({"username": 1}, {unique: true})

        let result = await users.insertMany(usersData)
        console.log(`${result.insertedCount} users were inserted`)

        const data = db.collection(dataCollection , {
            validator: { $jsonSchema: {
                bsonType: "object" ,
                required: ["id", "Firstname", "Surname", "userid"],
                properties: {
                    _id: {
                        bsonType: ObjectId,
                        description: "must contain unique hex value"
                    },
                    Surname:{
                        bsonType: "string",
                        decription: "must be a string and is required"

                    },
                    Firstname:{
                        bsonType: "string",
                        decription: "must be a string and is require"

                    },
                    userid:{
                        bsonType: "string",
                        decription: "must be a string and it should be in users collection,too"

                    }
                }
            }}
        })

        const processedData = await dataData.map(doc => {
            return{
            _id: ObjectId.createFromHexString(doc.id.toString(16).padStart(24, '0')),
            Firstname: doc.Firstname,
            Surname: doc.Surname,
            userid: doc.userid

            }
        })

        console.log(processedData)

        result = data.insertMany(processedData)
        console.log(`${result.insertedCount} data records were inserted`)

        const userExist = await db.command({ usersInfo: dbMongoUser });

        if (!userExist.users[0]) {
            result = await db.command({
                createUser: dbMongoUser,
                pwd: dbMongoPassword,
                roles: [{ role: 'readWrite', db: dbMongo }]
            });
            console.log("user created successfully", result);
        } else {
            console.log(
                "user",
                userExist.users[0].user,
                "already exists with role:",
                userExist.users[0].roles
            );
        }
        
        } catch (e) {
            console.log(e);
        } finally {
            await dbServer.close();
        }        

}

copyDataFromMariaToMongo()
