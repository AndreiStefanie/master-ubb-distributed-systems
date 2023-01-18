CREATE TABLE IF NOT EXISTS transactions(
  id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMP DEFAULT NOW(),
  status TEXT
);