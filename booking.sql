DELETE FROM "CreditTransaction" WHERE "bookingId"='book1';
DELETE FROM "Booking" WHERE "id"='book1';

INSERT INTO "Booking" (
  "id",
  "intervieweeId",
  "interviewerId",
  "startTime",
  "endTime",
  "status",
  "creditsCharged",
  "streamCallId",
  "recordingUrl",
  "createdAt",
  "updatedAt"
) VALUES (
  'book1',
  '4f4948bb-d7c4-4865-ab2f-0c16b013ffb8',
  'int2',
  '2026-04-26T12:00:00.000Z',
  '2026-04-26T12:45:00.000Z',
  'SCHEDULED',
  1,
  'mock_7777132342798_hx1u3',
  NULL,
  NOW(),
  NOW()
);

INSERT INTO "CreditTransaction" (
  "id",
  "userId",
  "bookingId",
  "amount",
  "type",
  "createdAt"
) VALUES (
  'txn_book1',
  '4f4948bb-d7c4-4865-ab2f-0c16b013ffb8',
  'book1',
  -1,
  'BOOKING_DEDUCTION',
  NOW()
);