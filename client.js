const soap = require("soap");

soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
  if (err) {
    console.error("Error creating SOAP client:", err);
    return;
  }
  const logSoapError = (err, label) => {
    const status = err?.response?.status;
    const statusText = err?.response?.statusText;
    const body = err?.body ?? err?.response?.data ?? err;
    console.error(`[${label}]`, status, statusText, body);
  };

  // 1) CreateProduct (existant)
  client.CreateProduct(
    { name: "My product", about: "About my product", price: 42 },
    function (err, result) {
      if (err) return logSoapError(err, "CreateProduct");
      console.log("[CreateProduct] Result:", result);

      const createdId = result?.id;
      if (!createdId) {
        console.error("[CreateProduct] No id returned, cannot run Patch/Delete examples.");
        return;
      }

      // 2) PatchProduct (update part of product)
      client.PatchProduct({ id: createdId, price: "49.99" }, function (err, patched) {
        if (err) return logSoapError(err, "PatchProduct");
        console.log("[PatchProduct] Result:", patched);

        // 3) DeleteProduct (delete by id)
        client.DeleteProduct({ id: createdId }, function (err, deleted) {
          if (err) return logSoapError(err, "DeleteProduct");
          console.log("[DeleteProduct] Result:", deleted);
        });
      });
    }
  );
});
