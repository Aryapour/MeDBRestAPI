import { createPool } from "mariadb"

const pool = createPool({
    host: "maria.northeurope.cloudapp.azure.com",
    user: "testi",
    port: 3306,
    password: "mariadb1",
    database: "adbms",
})

export default Object.freeze({
    pool: pool
})