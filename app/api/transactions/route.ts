import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";
import { connectDB } from "@/lib/mongodb";
import {
  Transitions,
  TransactionType,
  TransactionStatus,
  LedgerType,
} from "@/Models/transaction.Model";
import User from "@/Models/user.Model";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  await connectDB();

  const body = await req.json();
  const { toAccountNumber, amount, description } = body;

  if (!toAccountNumber || !amount) {
    return NextResponse.json(
      { success: false, message: "toAccountNumber and amount are required" },
      { status: 400 },
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { success: false, message: "Amount must be a positive number" },
      { status: 400 },
    );
  }

  const isEmail = toAccountNumber.includes("@");
  const idempotencyKey = req.headers.get("x-idempotency-key") || uuid();

  const duplicate = await Transitions.findOne({ idempotencyKey });
  if (duplicate) {
    return NextResponse.json(
      { success: true, message: "Duplicate request", data: duplicate },
      { status: 200 },
    );
  }

  const isReplicaSet = process.env.MONGODB_REPLICA_SET === "true";

  let dbSession: any = null;
  if (isReplicaSet) {
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();
  }

  try {
    const senderSelect =
      "balance accountStatus accountLockedUntil failedLoginAttempts dailyTransactionLimit monthlyTransactionLimit usedDailyLimit usedMonthlyLimit";

    let sender;
    if (isReplicaSet && dbSession) {
      sender = await User.findById(session.user.id)
        .select(senderSelect)
        .session(dbSession);
    } else {
      sender = await User.findById(session.user.id).select(senderSelect);
    }

    if (!sender) {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Sender not found" },
        { status: 404 },
      );
    }

    if (sender.accountStatus !== "active") {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Your account is not active" },
        { status: 403 },
      );
    }

    if (sender.isAccountLocked()) {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Your account is temporarily locked" },
        { status: 403 },
      );
    }

    const receiverQuery = isEmail
      ? { email: toAccountNumber }
      : { accountNumber: toAccountNumber };

    let receiver;
    if (isReplicaSet && dbSession) {
      receiver = await User.findOne(receiverQuery)
        .select("balance accountStatus")
        .session(dbSession);
    } else {
      receiver = await User.findOne(receiverQuery).select(
        "balance accountStatus",
      );
    }

    if (!receiver) {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Receiver account not found" },
        { status: 404 },
      );
    }

    if (receiver.accountStatus !== "active") {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Receiver account is not active" },
        { status: 400 },
      );
    }

    if (sender._id.toString() === receiver._id.toString()) {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Cannot transfer to your own account" },
        { status: 400 },
      );
    }

    if (sender.balance < amount) {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Insufficient balance" },
        { status: 400 },
      );
    }

    const amountInCents = Math.round(amount * 100);

    if ((sender.usedDailyLimit || 0) + amount > sender.dailyTransactionLimit) {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Daily transaction limit exceeded" },
        { status: 400 },
      );
    }

    if (
      (sender.usedMonthlyLimit || 0) + amount >
      sender.monthlyTransactionLimit
    ) {
      if (isReplicaSet && dbSession) await dbSession.abortTransaction();
      return NextResponse.json(
        { success: false, message: "Monthly transaction limit exceeded" },
        { status: 400 },
      );
    }

    const transactionData = [
      {
        fromAccount: sender._id,
        toAccount: receiver._id,
        fromUser: sender._id,
        toUser: receiver._id,
        account: sender._id,
        amount: amount,
        ledgerType: LedgerType.DEBIT,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        idempotencyKey,
        description: description || `Transfer to ${receiver.accountNumber}`,
        fee: { amount: 0, description: "Service fee" },
      },
      {
        fromAccount: sender._id,
        toAccount: receiver._id,
        fromUser: sender._id,
        toUser: receiver._id,
        account: receiver._id,
        amount: amount,
        ledgerType: LedgerType.CREDIT,
        type: TransactionType.TRANSFER,
        status: TransactionStatus.COMPLETED,
        idempotencyKey: `${idempotencyKey}_credit`,
        description: description || `Transfer from ${sender.accountNumber}`,
        fee: { amount: 0, description: "Service fee" },
      },
    ];

    if (isReplicaSet && dbSession) {
      await Transitions.create(transactionData, { session: dbSession });
    } else {
      await Transitions.create(transactionData);
    }

    sender.balance -= amount;
    sender.usedDailyLimit = (sender.usedDailyLimit || 0) + amount;
    sender.usedMonthlyLimit = (sender.usedMonthlyLimit || 0) + amount;

    if (isReplicaSet && dbSession) {
      await sender.save({ session: dbSession });
    } else {
      await sender.save();
    }

    receiver.balance += amount;
    if (isReplicaSet && dbSession) {
      await receiver.save({ session: dbSession });
    } else {
      await receiver.save();
    }

    if (isReplicaSet && dbSession) {
      await dbSession.commitTransaction();
      dbSession.endSession();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Transaction completed successfully",
        data: {
          from: sender.accountNumber,
          to: receiver.accountNumber,
          amount,
          status: TransactionStatus.COMPLETED,
        },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (isReplicaSet && dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    const message = err instanceof Error ? err.message : "Transaction failed";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}


export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const transactions = await Transitions.find({
      $or: [
        { toAccount: session.user.id },
        { fromAccount: session.user.id }
      ]
    })
      .sort({ createdAt: -1 })
      .populate("toAccount", "fullName accountNumber")
      .populate("fromAccount", "fullName accountNumber")
      .lean();

    return NextResponse.json({
      success: true,
      transactions
    });
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}