import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    duration: { type: Number, required: true },
    reason: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED","RETURNED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Loan || mongoose.model("Loan", loanSchema);