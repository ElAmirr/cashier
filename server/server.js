const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

const databasePath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(databasePath);

db.run(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price_buy REAL,
        price_sell REAL,
        stock INTEGER,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

// Create a trigger to automatically update the `updated_at` timestamp whenever a record is updated
db.run(`
    CREATE TRIGGER IF NOT EXISTS update_product_timestamp
    AFTER UPDATE ON products
    FOR EACH ROW
    BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END;
`);

const clientDatabasePath = path.join(__dirname, 'clientdatabase.db');
const clientdb = new sqlite3.Database(clientDatabasePath);

clientdb.run(`
    CREATE TABLE IF NOT EXISTS clients (
        client_id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT,
        client_number INTEGER,
        balance REAL 
    )
`);

app.get('/api/clients', (req, res) => {
  clientdb.all('SELECT * FROM clients', (err, rows) => {
    if (err) {
      console.error('Error fetching clients:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows); // Return clients data
    }
  });
});

app.get('/api/clients/:client_name', (req, res) => {
  const clientName = req.params.client_name;
  clientdb.all('SELECT * FROM clients WHERE client_name = ?', clientName, (err, rows) => {
    if (err) {
      console.error('Error fetching client details:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows); // Return client details
    }
  });
});


app.post('/api/clients', (req, res) => {
  const newClient = req.body;

  clientdb.run(
    `
    INSERT INTO clients (client_name, client_number)
    VALUES (?, ?)
  `,
    [newClient.client_name, newClient.client_number],
    (err) => {
      if (err) {
        console.error('Error adding new client:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('New client added successfully');
        res.json({ success: true, message: 'New client added successfully' });
      }
    }
  );
});

app.delete('/api/clients/:client_id', async(req, res) => {
  try {
    const clientId = req.params.client_id;
    const result = await clientdb.run(
      `
        DELETE FROM clients WHERE client_id = ?
      `, [clientId]
    );
    if (result.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

const ordersDataBasePath = path.join(__dirname, 'ordersdatabase.db');
const ordersdb = new sqlite3.Database(ordersDataBasePath);

ordersdb.run(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_price REAL,
      client_id INTEGER,
      payment BOOLLEAN,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`);

app.get('/api/orders', (req, res) => {
  ordersdb.all('SELECT * FROM orders', (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
})

ordersdb.run(`
      CREATE TABLE IF NOT EXISTS orderdetails (
        order_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER
      )
`);

app.get('/api/orders/:orderId/details', (req, res) => {
  const orderId = req.params.orderId;
  ordersdb.all('SELECT * FROM orderdetails WHERE order_id = ?', [orderId], (err, rows) => {
    if (err) {
      console.error('Error fetching order details:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/products/:productId', (req, res) => {
  const productId = req.params.productId;
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
    if (err) {
      console.error('Error fetching product details:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (row) {
        res.json(row);
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    }
  });
});


function insertProduct(entry, res) {
  db.run(
    `
    INSERT INTO products (name, price_buy, price_sell, stock, description)
    VALUES (?, ?, ?, ?, ?)
  `,
    [entry.name, entry.price_buy, entry.price_sell, entry.stock, entry.description],
    (err) => {
      if (err) {
        console.error('Error inserting product:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Product added successfully');
        res.json({ success: true, message: 'Product added successfully' });
      }
    }
  );
}

function insertOrderDetails(entry) {
  return new Promise((resolve, reject) => {
    ordersdb.run(
      `
      INSERT INTO orderdetails (order_id, product_id, quantity)
      VALUES (?, ?, ?)
    `,
      [entry.order_id, entry.product_id, entry.quantity, ],
      (err) => {
        if (err) {
          console.error('Error inserting order details:', err);
          reject(err);
        } else {
          console.log('Order details added successfully');
          resolve();
        }
      }
    );
  });
}

app.post('/api/products', (req, res) => {
  const entry = req.body;

  if (entry.id) {
    updateProduct(entry, res);
  } else {
    insertProduct(entry, res);
  }
});

app.post('/api/get-paid', async (req, res) => {
  try {
    const orderDetails = req.body;
    const clientId = orderDetails.clientId || 1;
    const paymentMethod = orderDetails.paymentMethod || 1; // Retrieve payment method
    const products = orderDetails.products;
    const totalPrice = orderDetails.totalPrice;

    // Begin transaction to ensure atomicity of database operations
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Loop through each product and update the stock quantity in the products table
      products.forEach(product => {
        db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [product.quantity, product.product_id], (err) => {
          if (err) {
            console.error('Error updating stock quantity:', err);
            db.run('ROLLBACK'); // Rollback transaction if there's an error
            return res.status(500).json({ error: 'Internal server error' });
          }
        });
      });

      // Insert the order into the orders table
      ordersdb.run(
        'INSERT INTO orders (total_price, client_id, payment, order_date) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
        [totalPrice, clientId, paymentMethod],
        function (err) {
          if (err) {
            console.error('Error inserting order:', err);
            db.run('ROLLBACK'); // Rollback transaction if there's an error
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Get the last inserted order_id
          const orderId = this.lastID;

          // Insert order details
          Promise.all(products.map(product => insertOrderDetails({ ...product, order_id: orderId })))
            .then(() => {
              db.run('COMMIT'); // Commit transaction if all operations succeed
              return res.status(200).json({ message: 'Order placed successfully' });
            })
            .catch(error => {
              console.error('Error inserting order details:', error);
              return res.status(500).json({ error: 'Internal server error' });
            });
        }
      );
    });
  } catch (error) {
    console.error('Error processing order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


function updateProduct(entry, res) {
  db.run(
    `
    UPDATE products
    SET name = ?, price_buy = ?, price_sell = ?, stock = ?, description = ?
    WHERE id = ?
  `,
    [entry.name, entry.price_buy, entry.price_sell, entry.stock, entry.description, entry.id],
    (err) => {
      if (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Product updated successfully');
        res.json({ success: true, message: 'Product updated successfully' });
      }
    }
  );
}

app.put('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const updatedProduct = req.body;

  db.run(
    `
    UPDATE products
    SET name = ?, price_buy = ?, price_sell = ?, stock = ?, description = ?
    WHERE id = ?
  `,
    [
      updatedProduct.name,
      updatedProduct.price_buy,
      updatedProduct.price_sell,
      updatedProduct.stock,
      updatedProduct.description,
      productId
    ],
    (err) => {
      if (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Product updated successfully');
        res.json({ success: true, message: 'Product updated successfully' });
      }
    }
  );
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await db.run(
      `
      DELETE FROM products
      WHERE id = ?
    `,
      [productId]
    );
    if (result.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
    } else {
      res.json({ success: true, message: 'Product deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products', (req, res) => {
  const productName = req.query.name;

  if (productName) {
    const sql = `SELECT * FROM products WHERE name LIKE '%${productName}%'`;
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('Error searching products:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(rows);
      }
    });
  } else {
    db.all('SELECT * FROM products', (err, rows) => {
      if (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(rows);
      }
    });
  }
});

const PORT = process.env.PORT || 5000;

// Save server start time to database
ordersdb.run(
  `
  CREATE TABLE IF NOT EXISTS app_start_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating app_start_time table:', err);
  } else {
    // Insert app start time
    ordersdb.run(
      `
      INSERT INTO app_start_time (start_time) VALUES (CURRENT_TIMESTAMP)
    `, (err) => {
      if (err) {
        console.error('Error inserting app start time:', err);
      } else {
        console.log('Server start time inserted successfully');
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
