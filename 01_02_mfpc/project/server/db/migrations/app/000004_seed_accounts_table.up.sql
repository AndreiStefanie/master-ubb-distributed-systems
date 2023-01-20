INSERT INTO
  accounts(
    tx_min,
    tx_min_committed,
    tx_max_rolled_back,
    user_id,
    balance
  )
VALUES
  (1, TRUE, TRUE, 1, 100),
  (1, TRUE, TRUE, 1, 0),
  (1, TRUE, TRUE, 2, 1000);