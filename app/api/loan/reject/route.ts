import { NextRequest, NextResponse } from "next/server";
import Loan from "@/Models/loan.Model";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Admin access required" },
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

    if (loan.status !== "PENDING") {
      throw new Error("Only pending loans can be rejected");
    }
    
    loan.status = "REJECTED";
    await loan.save();

    return NextResponse.json({
      success: true,
      message: "Loan rejected successfully",
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