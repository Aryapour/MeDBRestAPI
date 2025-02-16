//import { createPool } from "mariadb"
import { createPool } from "mongodb"

const pool = createPool({
    host: "localhost",
    user: "mta",
    port: 27017,
    password: "mta1",
    database: "mehdi",
    insertIdAsNumber: true,
    bigIntAsNumber: true
})

export default Object.freeze({
    pool: pool
})
