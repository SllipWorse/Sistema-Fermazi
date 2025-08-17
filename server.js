import fs from 'node:fs';
import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';

const app = express();
const port = 3000;
const filepath = "./fermazi.db";

// Middleware para servir arquivos estáticos
app.use(express.static('public'));
app.use(express.json());

// Função para criar a conexão com o banco de dados
function createDbConnection() {
    const db = new sqlite3.Database(filepath, (error) => {
        if (error) {
            return console.error(error.message);
        }
        console.log("Conexão estabelecida");
        createTable(db);
    });
    return db;
}

// Função para criar a tabela
function createTable(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS products
        (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            quantity TEXT NOT NULL,
            price REAL NOT NULL,
            type TEXT NOT NULL
        )
    `, (error) => {
        if (error) {
            console.error(error.message);
        }
    });
}

// Rota para buscar produtos
app.get('/api/products', (req, res) => {
    const db = createDbConnection();
    const query = `SELECT * FROM products`;
    
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });

    db.close();
});

// Ler o arquivo LOJISTA.txt e inserir dados no banco
const name = "LOJISTA.txt";

fs.readFile(name, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    
    const lines = data.split('\n');

    const database = createDbConnection();
    for (let line of lines) {
        let id = line.substring(0, 5).trim();
        let productName = line.substring(6, 38).trim();
        let quantity = line.substring(43, 49).trim();
        let price = parseFloat(line.substring(56, 69).trim());
        let type = line.substring(69, 80).trim();

        database.run(
            `INSERT INTO products (id, name, quantity, price, type) VALUES (?, ?, ?, ?, ?)`,
            [id, productName, quantity, price, type],
            function (error) {
                if (error) {
                    console.error(error.message);
                } else {
                    console.log(`Produto inserido com sucesso: ${productName}`);
                }
            }
        );
    }

    database.close();
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
