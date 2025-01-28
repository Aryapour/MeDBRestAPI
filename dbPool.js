import { createPool } from "mariadb"

const pool = createPool({
    host: "localhost",
    user: "mta",
    port: 3306,
    password: "mta1",
    database: "mehdi",
})

export default Object.freeze({
    pool: pool
})
