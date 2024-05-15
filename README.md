# Cashier Inventory App

This is a full-stack web application for managing product orders and inventory. It consists of a frontend built with React and a backend server built with Express.js. The project allows users to search for products, add them to an order, manage the order quantity, and calculate the total price and profit and more features in the future. 

## Features

- Search for products by name
- Add products to the order
- Increment or decrement product quantity in the order
- Calculate total price and profit
- Submit the order and receive payment

## Technologies Used

- **Frontend**: React, Material-UI
- **Backend**: Express.js, SQLite3
- **Other Tools**: Axios for HTTP requests, concurrently for running frontend and backend servers concurrently during development

## How to Run

1. Clone the repository:

- git clone <https://github.com/ElAmirr/cashier.git>


2. Navigate to the project directory:

cd <project-directory>


3. Install dependencies:

npm install


4. Start the frontend and backend servers concurrently:

npm start


5. Open your web browser and navigate to `http://localhost:3000` to view the application.

## Backend API

The backend server provides the following API endpoints:

- `POST /api/products`: Add or update a product.
- `DELETE /api/products/:id`: Delete a product by ID.
- `GET /api/products`: Get all products or search for products by name.

## Folder Structure

project-root/
│
├── client/ # Frontend source code
│ ├── public/ # Public assets
│ └── src/ # React components and logic
│
├── server/ # Backend source code
│ ├── database.db # SQLite database file
│ └── server.js # Express server code
│
└── README.md # Project README file


## Screenshots
![Alt text](/screenshots/scs1.png)
![Alt text](/screenshots/scs2.png)
![Alt text](/screenshots/scs3.png)
![Alt text](/screenshots/scs4.png)
![Alt text](/screenshots/scs5.png)
![Alt text](/screenshots/scs6.png)
![Alt text](/screenshots/scs7.png)
![Alt text](/screenshots/scs8.png)
![Alt text](/screenshots/scs9.png)
![Alt text](/screenshots/scs10.png)
![Alt text](/screenshots/scs11.png)
![Alt text](/screenshots/scs12.png)

## Contribution

Contributions are welcome! If you find any bugs or have suggestions for improvements, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
