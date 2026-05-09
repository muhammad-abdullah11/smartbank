import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Loan from "@/Models/loan.Model";
import User from "@/Models/user.Model";
import { sendLoanEmail } from "@/lib/nodemailer";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const { amount, duration, reason } = await req.json();

    if (!amount || !duration) {
      return NextResponse.json(
        { success: false, message: "Amount and duration required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id).select("fullName email");
    const loan = await Loan.create({
      user: session.user.id,
      amount,
      duration,
      reason,
    });

    if (user) {
      sendLoanEmail({
        to: user.email,
        userName: user.fullName,
        amount,
        status: 'REQUESTED'
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      loan,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}