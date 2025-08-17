import fs from 'node:fs';
import sqlite3 from 'sqlite3'
const filepath = "./fermazi.db"

function createDbConnection() {
    const db = new sqlite3.Database(filepath, (error) => {
        if (error) {
            return console.error(error.message)
        }
        createTable(db)
    })
    console.log("conexao estabelecida")
    return db
}
 
function createTable(db) {
    db.exec(`
        CREATE TABLE products
        (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            quantity TEXT NOT NULL,
            price REAL NOT NULL,
            type TEXT NOT NULL
        )
    `)
}

const database = createDbConnection()

const name = "LOJISTA.txt"

fs.readFile(name, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    } 
    const lines = data.split('\n')

    const ids = []
    const names = []
    const quantities = []
    const prices = []
    const types = []

    for (let line of lines) {
        let id = line.substring(0, 5)
        let name = line.substring(6, 38)
        let quantity = line.substring(43, 49)
        let price = line.substring(56, 69)
        let type = line.substring(69, 80)

        id = id.trim()
        name = name.trim()
        quantity = quantity.trim()
        price = price.trim()
        type = type.trim()

        names.push(name) 
        ids.push(id)
        quantities.push(quantity)
        prices.push(price)
        types.push(type)

        database.run(
            `INSERT INTO products (id, name, quantity, price, type) VALUES (?, ?, ?, ?, ?)`,
            [id, name, quantity, price, type],
            function (error) {
                if (error) {
                    console.error(error.message)
                }
                console.log(`inserido com sucesso`)
            }

        )
    }

    
})
