import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Loan from "@/Models/loan.Model";

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

    const loans = await Loan.find().populate("user","fullName balance");

    if(!loans){
        return NextResponse.json({message:"Loans not found request from that user"},{status:404})
    }

    return NextResponse.json({
      message:"Loans fetch successfully",  
      success: true,
      loans,
    },{status:200});
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}