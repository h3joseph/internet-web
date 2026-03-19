const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");

const sql = postgres({ 
  db: "mydb", 
  user: "postgres",     
  password: "password",
  host: "localhost",
  port: 5432,  
});

// Define the service implementation
const service = {
  ProductsService: {
    ProductsPort: {
        CreateProduct: async function ({ name, about, price }, callback) {
            if (!name || !about || !price) {
              throw {
                Fault: {
                  Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:BadArguments" },
                  },
                  Reason: { Text: "Processing Error" },
                  statusCode: 400,
                },
              };
            }
    
            const product = await sql`
              INSERT INTO products (name, about, price)
              VALUES (${name}, ${about}, ${price})
              RETURNING *
              `;
    
            // Will return only one element.
            callback(product[0]);
          },

        PatchProduct: async function (args, callback) {
            const { id, name, about, price } = args?.request ?? args ?? {};
            if (!id) {
              throw {
                Fault: {
                  Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:BadArguments" },
                  },
                  Reason: { Text: "Missing required argument: id" },
                  statusCode: 400,
                },
              };
            }

            const hasAnyField =
              name !== undefined || about !== undefined || price !== undefined;
            if (!hasAnyField) {
              throw {
                Fault: {
                  Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:BadArguments" },
                  },
                  Reason: { Text: "Missing fields to update (name/about/price)" },
                  statusCode: 400,
                },
              };
            }

            const nextName = name === undefined ? null : name;
            const nextAbout = about === undefined ? null : about;
            const nextPrice = price === undefined ? null : price;

            const product = await sql`
              UPDATE products
              SET
                name = COALESCE(${nextName}, name),
                about = COALESCE(${nextAbout}, about),
                price = COALESCE(${nextPrice}, price)
              WHERE id = ${id}
              RETURNING *
            `;

            if (!product[0]) {
              throw {
                Fault: {
                  Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:NotFound" },
                  },
                  Reason: { Text: "Product not found" },
                  statusCode: 404,
                },
              };
            }

            callback(product[0]);
          },

        DeleteProduct: async function (args, callback) {
            const { id } = args?.request ?? args ?? {};
            if (!id) {
              throw {
                Fault: {
                  Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:BadArguments" },
                  },
                  Reason: { Text: "Missing required argument: id" },
                  statusCode: 400,
                },
              };
            }

            const product = await sql`
              DELETE FROM products
              WHERE id = ${id}
              RETURNING *
            `;

            if (!product[0]) {
              throw {
                Fault: {
                  Code: {
                    Value: "soap:Sender",
                    Subcode: { value: "rpc:NotFound" },
                  },
                  Reason: { Text: "Product not found" },
                  statusCode: 404,
                },
              };
            }

            callback({ id: product[0].id.toString() });
          },
          
    },
  },
};

// http server example
const server = http.createServer(function (request, response) {
    response.end("404: Not Found: " + request.url);
  });
  
  server.listen(8000);
  
  // Create the SOAP server
  const xml = fs.readFileSync("productsService.wsdl", "utf8");
  soap.listen(server, "/products", service, xml, function () {
    console.log("SOAP server running at http://localhost:8000/products?wsdl");
  });