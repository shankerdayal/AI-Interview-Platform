INSERT INTO "CreditTransaction" (
  "id",
  "amount",
  "bookingId",
  "createdAt",
  "type",
  "userId"
) VALUES (
  'txn1',
  -1,
  'book1',
  NOW(),
  'BOOKING_DEDUCTION',
  '4f4948bb-d7c4-4865-ab2f-0c16b013ffb8'
);
