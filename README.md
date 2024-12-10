# Warung API

## Description
Warung-API is a backend system designed to manage and synchronize product data for an online convenience store. It handles the entire product lifecycle, including creation, management, and checkout, along with features like file uploading and auditing changes in the database.

**Key Features:**
* **Product Management:** Add, update, and delete products.
* **Product Search:** Search products by name, category.
* **Product Details:** View detailed information about products.
* **File Uploading:** Support for uploading products with Excel files (sample file available in the directory with file name : `ProductsData_100_Categories.xlsx`).
* **Audit Logs:** Record update and delete operations in the database.
* **Checkout:** Handle the purchase of products, including adding to the cart, checking out, and processing the payment.
* **REST API:** Provides a RESTful API for interacting with the system.


This update includes the **Checkout** functionality, which typically involves adding products to a cart, checking out, and possibly processing payment. Let me know if you need further changes or clarifications!

**System Components:**
* **Nest.js Framework** for backend development.
* **TypeORM** for database interaction with PostgreSQL.
* **PostgreSQL** for storing product data and audit logs.
* **Docker** for containerization and deployment.

## Database Structure

### Master Tables

- `products` (stores product details)


### Audit Log Table

- `audit_logs` (stores records of updates and deletions)

### Checkout Table

- `checkouts` (stores checkout details)


## System Requirements

| Requirement      | Version  |
|------------------|----------|
| NodeJS           | >= 20.15 |
| PostgreSQL       | >= 15    |

---

## Setup Installation

1. Clone Repository
    ```bash
    $ git clone https://github.com/programmerShinobi/warung-api
    ```

2. Go to Project Folder
    ```bash
    $ cd warung-api
    ```

3. Create a `.env` file, then copy the contents from the `.env.example` file to the new `.env` file.

5.  Create Uploads Directory
    ```bash
    $ mkdir uploads

6. Install Dependencies
    ```bash
    $ yarn install
    ```

7. Set up PostgreSQL Database and Run Migrations
    ```bash
    $ yarn run migration:run
    ```

8. Run the Web Server:
    - For Development:
      ```bash
      $ yarn start
      ```

    - Watch Mode:
      ```bash
      $ yarn start:dev
      ```

    - For Production Mode:
      ```bash
      $ yarn build
      $ yarn start:prod
      ```

---

## REST API Documentation

You can explore the API documentation using Swagger at:
- URL: `http://127.0.0.1:3000/api`

Or you can access in the directory with filename : `warung-api.postman_collection.json`

### Product Endpoints:
1. **GET /v1/product** - List all products with search and pagination.
2. **GET /v1/product/:id** - Get details of a specific product.
3. **POST /v1/product** - Create a new product.
4. **PATCH /v1/product/:id** - Update an existing product.
5. **DELETE /v1/product/:id** - Delete a product.

### File Uploading:
1. **POST /v1/product/upload** - Upload product with excel file.

### Checkout Endpoints:
1. **POST /v1/checkout** - Create checkout products.
2. **PATCH /v1/checkout/:id/confirm** - Confirm checkout products.
5. **GET /v1/checkout/:userId** - Get checkouts by user ID.

---

## Docker Setup

To run the application using Docker:

1. Build the Docker image:
    ```bash
    $ sh build.sh
    ```

2. Access the application via `http://localhost:3000`.

---

## Contributors

- Faqih Pratama Muhti

---

This version focuses on managing a product catalog, including search, upload, and logging features. Let me know if you need further modifications or additional features!