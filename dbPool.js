import { createPool } from "mariadb"

const pool = createPool({
    host: "localhost",
    user: "mta",
    port: 3306,
    password: "mta1",
    database: "mehdi",
    insertIdAsNumber: true,
    bigIntAsNumber: true
})

export default Object.freeze({
    pool: pool
})
