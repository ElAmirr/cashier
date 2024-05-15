const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const publicPath = path.join(__dirname, '../build');
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
        created_at TIMESTAMP DEFAULT (DATETIME('now', 'utc')) ,
        updated_at TIMESTAMP DEFAULT (DATETIME('now', 'utc'))
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

// Create the clients table if it doesn't exist
clientdb.run(`
    CREATE TABLE IF NOT EXISTS clients (
        client_id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT,
        client_number INTEGER,
        balance REAL 
    )
`, (err) => {
    if (err) {
        console.error("Error creating clients table:", err);
    } else {
        console.log("Clients table created successfully.");
        
        // Check if the client data already exists
        clientdb.get("SELECT * FROM clients WHERE client_name = 'passager' AND client_number = '00000000'", (checkErr, row) => {
            if (checkErr) {
                console.error("Error checking client data:", checkErr);
            } else if (!row) {
                // Client data doesn't exist, insert it
                clientdb.run(`
                    INSERT INTO clients (client_name, client_number, balance) VALUES (?, ?, ?)
                `, ['passager', '00000000', 0], (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting client data:", insertErr);
                    } else {
                        console.log("Client data added successfully.");
                    }
                });
            } else {
                console.log("Client data already exists.");
            }
        });
    }
});

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

app.get('/api/clients/:client_id', async (req, res) => {
  const clientId = req.params.client_id;
  clientdb.all('SELECT * FROM clients WHERE client_id = ?', clientId, (err, rows) => {
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
  const balance = 0;
  clientdb.run(
    `
    INSERT INTO clients (client_name, client_number, balance)
    VALUES (?, ?, ?)
  `,
    [newClient.client_name, newClient.client_number, balance],
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
      profit REAL,
      client_id INTEGER,
      payment BOOLLEAN,
      order_date TIMESTAMP DEFAULT (DATETIME('now', 'utc')),
      payment_date TIMESTAMP DEFAULT (DATETIME('now', 'utc'))
    )
`);

app.get('/api/orders/paid', (req, res) => {
  ordersdb.all('SELECT * FROM orders WHERE payment = ? OR payment = ?',[1, 3], (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/orders/credit', (req, res) => {
  ordersdb.all('SELECT * FROM orders WHERE payment = 0', (err, rows) => {
    if (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

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

// Inside your Express server file (app.js or server.js)

app.get('/api/orders/client/:clientId', (req, res) => {
  const clientId = req.params.clientId;

  // Assuming you have a database table named orders and it contains the orders data
  ordersdb.all('SELECT * FROM orders WHERE client_id = ? AND payment = ?', [clientId, 0], (err, rows) => {
    if (err) {
      console.error('Error fetching client orders:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows); // Return orders related to the client with the specified payment status
    }
  });
});

app.put('/api/orders/:orderId/pay-credit', (req, res) => {
  const orderId = req.params.orderId;

  // Update the orders table to set payment to true and payment_date to the provided datetime
  ordersdb.run(
    `
    UPDATE orders
    SET payment = 3, payment_date = CURRENT_TIMESTAMP 
    WHERE order_id = ?
  `,
    [orderId],
    (err) => {
      if (err) {
        console.error('Error updating payment status:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        // Retrieve the total price of the order
        ordersdb.get(
          'SELECT total_price FROM orders WHERE order_id = ?',
          [orderId],
          (err, row) => {
            if (err) {
              console.error('Error fetching total price of order:', err);
              res.status(500).json({ error: 'Internal server error' });
            } else {
              const totalPrice = row.total_price;
              // Retrieve the client ID associated with the order
              ordersdb.get(
                'SELECT client_id FROM orders WHERE order_id = ?',
                [orderId],
                (err, row) => {
                  if (err) {
                    console.error('Error fetching client ID:', err);
                    res.status(500).json({ error: 'Internal server error' });
                  } else {
                    const clientId = row.client_id;
                    // Update the client's balance
                    clientdb.run(
                      'UPDATE clients SET balance = balance - ? WHERE client_id = ?',
                      [totalPrice, clientId],
                      (updateErr) => {
                        if (updateErr) {
                          console.error('Error updating client balance:', updateErr);
                          res.status(500).json({ error: 'Internal server error' });
                        } else {
                          console.log('Payment status and client balance updated successfully');
                          res.status(200).json({ message: 'Payment status and client balance updated successfully' });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

app.delete('/api/orders', async (req, res) => {
  try {
    // Delete orders where payment is 1 or 3
    const result = await ordersdb.run(
      `
      DELETE FROM orders
      WHERE payment = 1 OR payment = 3
    `
    );
    if (result.changes === 0) {
      res.status(404).json({ error: 'No orders found with payment status 1 or 3' });
    } else {
      res.json({ success: true, message: 'Orders deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
    const clientId = orderDetails.clientId;
    const paymentMethod = orderDetails.paymentMethod;
    const products = orderDetails.products;
    const totalPrice = orderDetails.totalPrice;
    const profit = orderDetails.profit; // Extract profit from request body

    // Begin transaction to ensure atomicity of database operations
    ordersdb.serialize(() => {
      ordersdb.run('BEGIN TRANSACTION');

      // Insert the order into the orders table
      ordersdb.run(
        'INSERT INTO orders (total_price, profit, client_id, payment, order_date, payment_date) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [totalPrice, profit, clientId, paymentMethod],
        function (err) {
          if (err) {
            console.error('Error inserting order:', err);
            ordersdb.run('ROLLBACK'); // Rollback transaction if there's an error
            return res.status(500).json({ error: 'Internal server error' });
          }

          // Get the last inserted order_id
          const orderId = this.lastID;

          // Insert order details
          Promise.all(products.map(product => insertOrderDetails({ ...product, order_id: orderId })))
            .then(() => {
              // If payment is false, add total_price to the client's balance
              if (!paymentMethod) {
                clientdb.run(
                  'UPDATE clients SET balance = balance + ? WHERE client_id = ?',
                  [totalPrice, clientId],
                  (err) => {
                    if (err) {
                      console.error('Error updating client balance:', err);
                      ordersdb.run('ROLLBACK'); // Rollback transaction if there's an error
                      return res.status(500).json({ error: 'Internal server error' });
                    }
                  }
                );
              }
              ordersdb.run('COMMIT'); // Commit transaction if all operations succeed
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


app.get('/api/total_product_sum', (req, res) => {
  db.all('SELECT SUM(price_buy) AS total_product_price FROM products', (err, rows) => {
    if (err) {
      console.error('Error fetching total product sum:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (rows.length > 0) {
        res.json(rows[0]); // Send the first row containing the total product price
      } else {
        res.status(404).json({ error: 'No products found' });
      }
    }
  });
});



app.get('/api/reports', async (req, res) => {
  const { startDate, startTime, endDate, endTime } = req.query;

  try {
    // Query to calculate total sales within the specified time period
    const salesQuery = `
    SELECT SUM(total_price) AS total_sales
    FROM orders
    WHERE payment_date BETWEEN ? AND ?
    `;

    // Query to calculate total cash sales within the specified time period
    const cashQuery = `
      SELECT SUM(total_price) AS cash
      FROM orders
      WHERE payment = 1 AND order_date BETWEEN ? AND ?
    `;

    // Query to calculate total credit sales within the specified time period
    const creditQuery = `
      SELECT SUM(total_price) AS credit

      FROM orders
      WHERE payment = 0 AND order_date BETWEEN ? AND ?
    `;
    
    // Query to calculate total profit from cash sales within the specified time period
    const cashProfitQuery = `
      SELECT SUM(profit) AS cash_profit
      FROM orders
      WHERE payment = 1 AND order_date BETWEEN ? AND ?
    `;

    // Query to calculate total credit sales within the specified time period
    const creditPaidQuery = `
      SELECT SUM(total_price) AS credit_paid
      FROM orders
      WHERE payment = 3
    `;

    // Query to calculate total credit sales within the specified time period
    const creditPaidProfitQuery = `
      SELECT SUM(profit) AS credit_paid_profit
      FROM orders
      WHERE payment = 3
    `;

    // Execute all queries simultaneously
    const [salesResult, cashResult, creditResult, cashProfitResult, creditPaidResult, creditPaidProfitResult] = await Promise.all([
      new Promise((resolve, reject) => {
        ordersdb.get(salesQuery, [`${startDate} ${startTime}`, `${endDate} ${endTime}`], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.total_sales : 0);
          }
        });
      }),
      new Promise((resolve, reject) => {
        ordersdb.get(cashQuery, [`${startDate} ${startTime}`, `${endDate} ${endTime}`], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.cash : 0);
          }
        });
      }),
      new Promise((resolve, reject) => {
        ordersdb.get(creditQuery, [`${startDate} ${startTime}`, `${endDate} ${endTime}`], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.credit : 0);
          }
        });
      }),
      new Promise((resolve, reject) => {
        ordersdb.get(cashProfitQuery, [`${startDate} ${startTime}`, `${endDate} ${endTime}`], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.cash_profit : 0);
          }
        });
      }),
      new Promise((resolve, reject) => {
        ordersdb.get(creditPaidQuery, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.credit_paid : 0);
          }
        })
      }),
      new Promise((resolve, reject) => {
        ordersdb.get(creditPaidProfitQuery, (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.credit_paid_profit : 0);
          }
        })
      })
    ]);

    // Response object with corrected field names
    res.json({ 
      total_sales: salesResult, 
      cash: cashResult, 
      credit: creditResult, 
      cash_profit: cashProfitResult, 
      credit_paid: creditPaidResult,
      credit_paid_profit: creditPaidProfitResult
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const reportDatabasePath = path.join(__dirname, 'report.db');
const reportdb = new sqlite3.Database(reportDatabasePath);

reportdb.run(`
    CREATE TABLE IF NOT EXISTS reports (
        report_id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_date TIMESTAMP DEFAULT (DATETIME('now', 'utc')),
        total_sales REAL,
        total_cash REAL,
        total_cash_profit REAL,
        sales_of_the_day REAL,
        credit_of_the_day REAL,
        credit_paid_of_the_day REAL
    )
`);

app.get('/api/dailyreports', (req, res) => {
  reportdb.all('SELECT * FROM reports', (err, rows) => {
    if (err) {
      console.error('Error fetching reports:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json(rows);
    }
  });
});

app.post('/api/reports', (req, res) => {
  const newReport = req.body;
  const { totalSales, totalCash, totalCashProfit, salesOfTheDay, creditOfTheDay, creditPaidOfTheDay } = newReport;
  const currentDate = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format
  
  // Check if a report already exists for the current date
  reportdb.get('SELECT * FROM reports WHERE report_date = ?', [currentDate], (err, row) => {
  if (err) {
    console.error('Error checking existing report:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (row) {
      // If a report already exists for today, return an error
      console.log('Report already exists for today');
      res.status(400).json({ error: 'Report already exists for today' });
    } else {
      // If no report exists for today, insert the new report
    reportdb.run(
      `
      INSERT INTO reports (
        report_date,
        total_sales,
        total_cash,
        total_cash_profit,
        sales_of_the_day,
        credit_of_the_day,
        credit_paid_of_the_day
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [currentDate, totalSales, totalCash, totalCashProfit, salesOfTheDay, creditOfTheDay, creditPaidOfTheDay],
      (err) => {
        if (err) {
          console.error('Error adding new Report:', err);
          res.status(500).json({ error: 'Internal server error' });
        } else {
          console.log('New Report added successfully');
          res.json({ success: true, message: 'New Report added successfully' });
        }
      }
    );
    }
});
})

app.get('/api/app-start-time', (req, res) => {
  // Query the database to get the server's start time from the app_start_time table
  ordersdb.get('SELECT start_time FROM app_start_time ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      console.error('Error fetching server start time:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      if (row) {
        res.json(row); // Return the server's start time
      } else {
        res.status(404).json({ error: 'Server start time not found' });
      }
    }
  });
});



const PORT = process.env.PORT || 5000;

// Save server start time to database
ordersdb.run(
  `
  CREATE TABLE IF NOT EXISTS app_start_time (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time TIMESTAMP DEFAULT (DATETIME('now', 'utc')),
    end_time TIMESTAMP 
  )
`, (err) => {
  if (err) {
    console.error('Error creating app_start_time table:', err);
  } else {
    // Check if there is already a row with the same date as the current date
    ordersdb.get(
      `
      SELECT * FROM app_start_time WHERE DATE(start_time) = DATE(CURRENT_TIMESTAMP)
    `, (err, row) => {
      if (err) {
        console.error('Error checking existing start time:', err);
      } else if (!row) { // If no row exists for today's date, insert the start time
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
      } else {
        console.log('Server start time already exists for today');
      }
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
