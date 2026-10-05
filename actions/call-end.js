"use server";

import { db } from "@/lib/prisma";

export const completeBooking = async (callId) => {
  try {
    await db.booking.updateMany({
      where: {
        streamCallId: callId,
        status: "SCHEDULED",
      },
      data: {
        status: "COMPLETED",
      },
    });

    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false };
  }
};