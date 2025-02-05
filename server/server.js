const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const publicPath = path.join(__dirname, '../build');
app.use(express.static(publicPath));

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}).promise();


// Create tables if they don't exist
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id BIGINT UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id BIGINT NOT NULL,
                name VARCHAR(255),
                price_buy DECIMAL(10,2),
                price_sell DECIMAL(10,2),
                stock INT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS clients (
                client_id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id BIGINT NOT NULL,
                client_name VARCHAR(255),
                client_number VARCHAR(20),
                balance DECIMAL(10,2)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id BIGINT NOT NULL,
                total_price DECIMAL(10,2),
                profit DECIMAL(10,2),
                client_id INT,
                payment BOOLEAN,
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payment_date TIMESTAMP NULL,
                FOREIGN KEY (client_id) REFERENCES clients(client_id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS orderdetails (
                order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS reports (
                report_id INT AUTO_INCREMENT PRIMARY KEY,
                tenant_id BIGINT NOT NULL,
                report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_sales DECIMAL(10,2),
                total_cash DECIMAL(10,2),
                total_cash_profit DECIMAL(10,2),
                sales_of_the_day DECIMAL(10,2),
                credit_of_the_day DECIMAL(10,2),
                credit_paid_of_the_day DECIMAL(10,2)
            )
        `);

        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

// Initialize the database
initializeDatabase();

// Public routes (no authentication required)
app.post('/api/signup', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const tenantId = Date.now(); // Generate tenant_id

    try {
        await pool.query(
            'INSERT INTO users (tenant_id, username, password, email) VALUES (?, ?, ?, ?)',
            [tenantId, username, hashedPassword, email]
        );
        res.json({ success: true, message: 'User registered successfully', tenant_id: tenantId });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate a JWT token with tenant_id
        const token = jwt.sign({ tenant_id: user.tenant_id }, process.env.JWT_SECRET || 'your_secret_key', {
            expiresIn: '1h'
        });

        res.json({ success: true, message: 'Login successful', token, tenant_id: user.tenant_id });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// JWT authentication middleware (for protected routes only)
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.tenant_id = user.tenant_id; // Assuming the JWT includes tenant_id
      next();
    });
  };
  

// Protected routes (require authentication)
app.use(authenticateToken);

// Protected route: Get all clients for a tenant
app.get('/api/clients', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM clients WHERE tenant_id = ?', [req.tenant_id]);
      res.json(rows);
    } catch (err) {
      console.error('Error fetching clients:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  


// Protected route: Add a new client
app.post('/api/clients', async (req, res) => {
    const { client_name, client_number } = req.body;
    const balance = 0; // Default balance for new clients
  
    try {
      const [result] = await pool.query(
        'INSERT INTO clients (client_name, client_number, balance) VALUES (?, ?, ?)',
        [client_name, client_number, balance]
      );
  
      res.json({ success: true, message: 'Client added successfully', client_id: result.insertId });
    } catch (err) {
      console.error('Error adding new client:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Fetch unpaid orders for a client
app.get('/api/orders/client/:clientId', async (req, res) => {
    const { clientId } = req.params;
    const { payment } = req.query;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM orders WHERE client_id = ? AND payment = ?',
            [clientId, payment]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching client orders:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a client:
app.delete('/api/clients/:clientId', async (req, res) => {
    const { clientId } = req.params;

    try {
        await pool.query('DELETE FROM clients WHERE client_id = ?', [clientId]);
        res.json({ success: true, message: 'Client deleted successfully' });
    } catch (err) {
        console.error('Error deleting client:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Protected route: Get all products for a tenant
// server.js - Update the GET /api/products endpoint
app.get('/api/products', async (req, res) => {
  try {
    const { name } = req.query;
    const tenant_id = req.tenant_id;

    let query = 'SELECT * FROM products WHERE tenant_id = ?';
    const params = [tenant_id];

    if (name) {
      query += ' AND name LIKE ?'; // Add name filter
      params.push(`%${name}%`); // Use wildcards for partial matching
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/api/products', async (req, res) => {
  const { name, price_buy, price_sell, stock, description } = req.body;
  const tenant_id = req.tenant_id; // Extract tenant_id from the authenticated request

  if (!tenant_id) {
      return res.status(400).json({ error: 'Tenant ID is missing' });
  }

  try {
      await pool.query(
          'INSERT INTO products (tenant_id, name, price_buy, price_sell, stock, description) VALUES (?, ?, ?, ?, ?, ?)',
          [tenant_id, name, price_buy, price_sell, stock, description]
      );
      res.json({ success: true, message: 'New product added successfully' });
  } catch (err) {
      console.error('Error adding new product:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route example: Get all products for a tenant
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE tenant_id = ?', [req.tenant_id]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching products:', err.message, err.stack);
        res.status(500).json({ error: 'An error occurred while fetching products' });
    }
});


// Protected route: Get all orders for a tenant
app.get('/api/orders', (req, res) => {
  const tenant_id = req.headers['tenant-id']; // Get tenant_id from headers

  pool.query('SELECT * FROM orders WHERE tenant_id = ?', [tenant_id], (err, rows) => {
    if (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

// Protected route: Get all orders for a tenant
app.get('/api/orders/paid', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE tenant_id = ? AND payment = 1', [req.user.tenant_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching paid orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/orders/credit', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE tenant_id = ? AND payment = 0', [req.user.tenant_id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching credit orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  app.get('/api/orders/:orderId/details', authenticateToken, async (req, res) => {
    const orderId = req.params.orderId;
  
    try {
      // Fetch order details
      const [orderDetails] = await pool.query(
        `SELECT od.*, p.name, p.price_sell 
         FROM orderdetails od
         JOIN products p ON od.product_id = p.id
         WHERE od.order_id = ?`,
        [orderId]
      );
  
      res.json(orderDetails);
    } catch (err) {
      console.error('Error fetching order details:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Protected route: Add a new order
// Protected route: Create order with details
app.post('/api/orders', async (req, res) => {
    const { tenant_id, client_id, total_price, profit, payment, products } = req.body;
    
    try {
      const connection = await pool.getConnection();
      await connection.beginTransaction();
  
      try {
        // Create order
        const [orderResult] = await connection.query(
          'INSERT INTO orders (tenant_id, total_price, profit, client_id, payment) VALUES (?, ?, ?, ?, ?)',
          [tenant_id, total_price, profit, client_id, payment]
        );
        
        // Create order details
        for (const product of products) {
          await connection.query(
            'INSERT INTO orderdetails (order_id, product_id, quantity) VALUES (?, ?, ?)',
            [orderResult.insertId, product.product_id, product.quantity]
          );
        }
  
        await connection.commit();
        res.json({ success: true, orderId: orderResult.insertId });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('Order creation error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
app.post('/api/orders', async (req, res) => {
  const { tenant_id, client_id, total_price, profit, payment, products } = req.body;
  
  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (tenant_id, total_price, profit, client_id, payment) VALUES (?, ?, ?, ?, ?)',
        [tenant_id, total_price, profit, client_id, payment]
      );
      
      // Create order details
      for (const product of products) {
        await connection.query(
          'INSERT INTO orderdetails (order_id, product_id, quantity) VALUES (?, ?, ?)',
          [orderResult.insertId, product.product_id, product.quantity]
        );
      }

      await connection.commit();
      res.json({ success: true, orderId: orderResult.insertId });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});  
// Protected route: Update product stock
app.put('/api/products/:id/stock', async (req, res) => {
  const productId = req.params.id;
  const { stock, tenant_id } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE products SET stock = ? WHERE id = ? AND tenant_id = ?',
      [stock, productId, tenant_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Stock update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route: Get order details
app.get('/api/orders/:id/details', async (req, res) => {
  const orderId = req.params.id;
  
  try {
    const [rows] = await pool.query(
      `SELECT od.*, p.name, p.price_sell 
       FROM orderdetails od
       JOIN products p ON od.product_id = p.id
       WHERE od.order_id = ?`,
      [orderId]
    );
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route: Get reports for a tenant
app.get('/api/reports', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM reports WHERE tenant_id = ?', [req.tenant_id]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Protected route: Add a new report
app.post('/api/reports', async (req, res) => {
    const { total_sales, total_cash, total_cash_profit, sales_of_the_day, credit_of_the_day, credit_paid_of_the_day } = req.body;
    try {
        await pool.query(
            'INSERT INTO reports (tenant_id, total_sales, total_cash, total_cash_profit, sales_of_the_day, credit_of_the_day, credit_paid_of_the_day) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.tenant_id, total_sales, total_cash, total_cash_profit, sales_of_the_day, credit_of_the_day, credit_paid_of_the_day]
        );
        res.json({ success: true, message: 'New report added successfully' });
    } catch (err) {
        console.error('Error adding new report:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/app-start-time', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM app_start_time WHERE tenant_id = ?', [req.user.tenant_id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ error: 'No start time found' });
    }
  } catch (err) {
    console.error('Error fetching app start time:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const serverless = require('serverless-http');

module.exports = app;
module.exports.handler = serverless(app);
