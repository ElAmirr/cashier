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

const ordersDataBasePath = path.join(__dirname, 'ordersdatabase.db');
const ordersdb = new sqlite3.Database(ordersDataBasePath);

ordersdb.run(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_price REAL,
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

const orderDetailsDataBasePath = path.join(__dirname, 'orderdetailsdatabase.db');
const orderdetailsdb = new sqlite3.Database(orderDetailsDataBasePath);

orderdetailsdb.run(`
      CREATE TABLE IF NOT EXISTS orderdetails (
        order_detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER
      )
`);

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
    orderdetailsdb.run(
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
    const products = orderDetails.products;
    const totalPrice = orderDetails.totalPrice;

    // Begin transaction to ensure atomicity of database operations
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Loop through each product and update the stock quantity in the products table
      products.forEach(product => {
        db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [product.quantity, product.id], (err) => {
          if (err) {
            console.error('Error updating stock quantity:', err);
            db.run('ROLLBACK'); // Rollback transaction if there's an error
            return res.status(500).json({ error: 'Internal server error' });
          }
        });
      });

      // Insert the order into the orders table
      ordersdb.run(
        'INSERT INTO orders (total_price, order_date) VALUES (?, CURRENT_TIMESTAMP)',
        [totalPrice],
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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
