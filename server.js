const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");

// Connexion à PostgreSQL
const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "mydb",
  username: "postgres",
  password: "password",
});

const service = {
  ProductsService: {
    ProductsPort: {
      CreateProduct: async function (args, callback) {
        try {
          const { name, about, price } = args;
          
          // Validation
          if (!name || !about || !price) {
            const fault = {
              Fault: {
                Code: {
                  Value: "soap:Sender",
                  Subcode: { value: "rpc:BadArguments" },
                },
                Reason: { Text: "Missing required fields" },
                statusCode: 500,
              },
            };
            callback(fault);
            return;
          }
          
          // Insertion en base de données
          const [product] = await sql`
            INSERT INTO products (name, about, price)
            VALUES (${name}, ${about}, ${price})
            RETURNING id, name, about, price
          `;
          
          // Réponse avec l'ID généré
          callback({
            CreateProductResponse: {
              id: product.id.toString(),
              name: product.name,
              about: product.about,
              price: product.price
            }
          });
          
        } catch (error) {
          console.error("Database error:", error);
          callback({
            Fault: {
              Code: { Value: "soap:Server" },
              Reason: { Text: "Database error" },
              statusCode: 500,
            },
          });
        }
      },
    },
  },
};

// Serveur HTTP
const server = http.createServer((req, res) => {
  res.end("404: Not Found: " + req.url);
});

server.listen(8000, () => {
  console.log("Serveur HTTP sur port 8000");
});

// Serveur SOAP
const xml = fs.readFileSync("productsService.wsdl", "utf8");
soap.listen(server, "/products", service, xml, () => {
  console.log("Serveur SOAP sur http://localhost:8000/products?wsdl");
});