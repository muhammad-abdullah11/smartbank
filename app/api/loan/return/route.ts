import { NextRequest, NextResponse } from "next/server";
import Loan from "@/Models/loan.Model";
import User from "@/Models/user.Model";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  await connectDB();

  try {
    const body = await req.json();
    const { loanId } = body;

    if (!loanId) {
      return NextResponse.json(
        { success: false, message: "Loan ID is required" },
        { status: 400 }
      );
    }

    const loan = await Loan.findById(loanId);

    if (!loan) {
      throw new Error("Loan not found");
    }

    if (loan.status !== "APPROVED") {
      throw new Error("Only approved loans can be returned");
    }

    const user = await User.findById(loan.user);

    if (!user) {
      throw new Error("User not found");
    }

    if (user._id.toString() !== session.user.id) {
      throw new Error("You can only return your own loans");
    }

    if (user.balance < loan.amount) {
      throw new Error("Insufficient balance to return loan");
    }

    await User.findByIdAndUpdate(
      user._id,
      { $inc: { balance: -loan.amount } },
      { new: true }
    );

    loan.status = "RETURNED";
    await loan.save();

    return NextResponse.json({
      success: true,
      message: "Loan returned successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
}