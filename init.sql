CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  about VARCHAR(500),
  price FLOAT NOT NULL
);

-- Donnée de test
INSERT INTO products (name, about, price) VALUES
  ('My first game', 'This is an awesome game', 60.0);