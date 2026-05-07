import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum TransactionStatus {
  PENDING    = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED  = "COMPLETED",
  FAILED     = "FAILED",
  REVERSED   = "REVERSED",
  EXPIRED    = "EXPIRED",
}

export enum TransactionType {
  TRANSFER    = "TRANSFER",
  DEPOSIT     = "DEPOSIT",
  WITHDRAWAL  = "WITHDRAWAL",
  BILL_PAY    = "BILL_PAY",
  LOAN_REPAY  = "LOAN_REPAY",
  FEE         = "FEE",
  REVERSAL    = "REVERSAL",
}

export enum LedgerType {
  CREDIT = "CREDIT",
  DEBIT  = "DEBIT",
}

interface IFee {
  amount: number;
  description: string;
}

export interface ITransitions extends Document {
  fromAccount: Types.ObjectId;
  toAccount: Types.ObjectId;
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  amount: number;
  fee: IFee;
  type: TransactionType;
  status: TransactionStatus;
  idempotencyKey: string;
  account: Types.ObjectId;
  ledgerType: LedgerType;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}



const FeeSchema = new Schema<IFee>(
  {
    amount:      { type: Number, default: 0, min: 0 },
    description: { type: String, default: "Service fee" },
  },
  { _id: false }
);

const TransitionsSchema = new Schema<ITransitions>(
  {
    fromAccount: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    toAccount: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    fromUser: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    toUser: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    amount: {
      type:     Number,
      required: true,
      min:      1,
      get:      (v: number) => v / 100,
      set:      (v: number) => Math.round(v * 100),
    },
    fee: { 
      type: FeeSchema, 
      default: () => ({ amount: 0, description: "Service fee" }) 
    },
    type: {
      type:     String,
      enum:     Object.values(TransactionType),
      required: true,
      default:  TransactionType.TRANSFER,
    },
    status: {
      type:    String,
      enum:    Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
      index:   true,
    },
    idempotencyKey: {
      type:     String,
      required: true,
      unique:   true,
      index:    true,
    },
    account: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    ledgerType: {
      type:     String,
      enum:     Object.values(LedgerType),
      required: true,
    },
    description: { 
      type: String, 
      trim: true, 
    },
  },
  {
    timestamps: true,
  }
);

TransitionsSchema.index({ fromAccount: 1, createdAt: -1 });
TransitionsSchema.index({ toAccount: 1, createdAt: -1 });
TransitionsSchema.index({ fromUser: 1, status: 1 });
TransitionsSchema.index({ account: 1, createdAt: -1 });
TransitionsSchema.index({ idempotencyKey: 1 });
TransitionsSchema.index({ status: 1, createdAt: -1 });

function preventDelete(next: (err?: Error) => void) {
  next(new Error("Transitions cannot be deleted"));
}

TransitionsSchema.pre("deleteOne", preventDelete);
TransitionsSchema.pre("deleteMany", preventDelete);
TransitionsSchema.pre("findOneAndDelete", preventDelete);

export const Transitions =
  (mongoose.models.Transitions ) ||
  mongoose.model<ITransitions>("Transitions", TransitionsSchema);