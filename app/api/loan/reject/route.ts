import { NextRequest, NextResponse } from "next/server";
import Loan from "@/Models/loan.Model";
import { connectDB } from "@/lib/mongodb";

export async function PATCH(req: NextRequest) {
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