const soap = require("soap");

soap.createClient("http://localhost:8000/products?wsdl", {}, (err, client) => {
  if (err) {
    console.error("Erreur client:", err);
    return;
  }
  
  console.log("Client SOAP créé");
  
  // Test avec données valides
  const newProduct = {
    name: "Mon super jeu",
    about: "Un jeu vidéo extraordinaire",
    price: 49.99
  };
  
  client.CreateProduct(newProduct, (err, result) => {
    if (err) {
      console.error("Erreur:", err);
    } else {
      console.log("Produit créé:", result);
    }
  });
});