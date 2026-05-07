import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";
import { connectDB } from "@/lib/mongodb";
import { Transitions, TransactionType, TransactionStatus, LedgerType } from "@/Models/transaction.Model";
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = await req.json();
  const { toAccountNumber, amount, description } = body;

  if (!toAccountNumber || !amount) {
    return NextResponse.json(
      { success: false, message: "toAccountNumber and amount are required" },
      { status: 400 }
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { success: false, message: "Amount must be a positive number" },
      { status: 400 }
    );
  }

  const idempotencyKey = req.headers.get("x-idempotency-key") || uuid();

  const duplicate = await Transitions.findOne({ idempotencyKey });
  if (duplicate) {
    return NextResponse.json(
      { success: true, message: "Duplicate request", data: duplicate },
      { status: 200 }
    );
  }

  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {

    const sender = await User.findById(session.user.id)
      .select("+balance +accountStatus +accountLockedUntil +failedLoginAttempts +dailyTransactionLimit +monthlyTransactionLimit +usedDailyLimit +usedMonthlyLimit")
      .session(dbSession);

    if (!sender) {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Sender not found" }, { status: 404 });
    }

    if (sender.accountStatus !== "active") {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Your account is not active" }, { status: 403 });
    }

    if (sender.isAccountLocked()) {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Your account is temporarily locked" }, { status: 403 });
    }

    const receiver = await User.findOne({ accountNumber: toAccountNumber })
      .select("+balance +accountStatus")
      .session(dbSession);

    if (!receiver) {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Receiver account not found" }, { status: 404 });
    }

    if (receiver.accountStatus !== "active") {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Receiver account is not active" }, { status: 400 });
    }

    if (sender._id.toString() === receiver._id.toString()) {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Cannot transfer to your own account" }, { status: 400 });
    }

    if (sender.balance < amount) {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 });
    }

    const amountInPaisas = Math.round(amount * 100);

    if (sender.usedDailyLimit + amountInPaisas > sender.dailyTransactionLimit) {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Daily transaction limit exceeded" }, { status: 400 });
    }

    if (sender.usedMonthlyLimit + amountInPaisas > sender.monthlyTransactionLimit) {
      await dbSession.abortTransaction();
      return NextResponse.json({ success: false, message: "Monthly transaction limit exceeded" }, { status: 400 });
    }

    await Transitions.create(
      [
        {
          fromAccount:    sender._id,
          toAccount:      receiver._id,
          fromUser:       sender._id,
          toUser:         receiver._id,
          account:        sender._id,
          amount:         amountInPaisas,
          ledgerType:     LedgerType.DEBIT,
          type:           TransactionType.TRANSFER,
          status:         TransactionStatus.COMPLETED,
          idempotencyKey,
          description:    description || `Transfer to ${receiver.accountNumber}`,
          fee:            { amount: 0, description: "Service fee" },
        },
        {
          fromAccount:    sender._id,
          toAccount:      receiver._id,
          fromUser:       sender._id,
          toUser:         receiver._id,
          account:        receiver._id,
          amount:         amountInPaisas,
          ledgerType:     LedgerType.CREDIT,
          type:           TransactionType.TRANSFER,
          status:         TransactionStatus.COMPLETED,
          idempotencyKey: `${idempotencyKey}_credit`,
          description:    description || `Transfer from ${sender.accountNumber}`,
          fee:            { amount: 0, description: "Service fee" },
        },
      ],
      { session: dbSession }
    );

    sender.balance        -= amount;
    sender.usedDailyLimit  = (sender.usedDailyLimit || 0) + amountInPaisas;
     sender.usedMonthlyLimit = (sender.usedMonthlyLimit || 0) + amountInPaisas;
    await sender.save({ session: dbSession });

    receiver.balance += amount;
    await receiver.save({ session: dbSession });

    await dbSession.commitTransaction();

    return NextResponse.json(
      {
        success: true,
        message: "Transaction completed successfully",
        data: {
          from:   sender.accountNumber,
          to:     receiver.accountNumber,
          amount,
          status: TransactionStatus.COMPLETED,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    await dbSession.abortTransaction();
    const message = err instanceof Error ? err.message : "Transaction failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  } finally {
    dbSession.endSession();
  }
}
