INSERT INTO
  users(
    tx_min,
    tx_min_committed,
    tx_max_rolled_back,
    username
  )
VALUES
  (1, TRUE, TRUE, 'john'),
  (1, TRUE, TRUE, 'jane');