import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User, { AccountStatus } from "@/Models/user.Model";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Admin access required" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { email, status } = body;

    if (!email || !status) {
      return NextResponse.json(
        { success: false, message: "Email and status are required" },
        { status: 400 }
      );
    }

    if (!Object.values(AccountStatus).includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid account status provided" },
        { status: 400 }
      );
    }

    await connectDB();

    if (email === session.user.email) {
      return NextResponse.json(
        { success: false, message: "You cannot change your own account status" },
        { status: 403 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { accountStatus: status },
      { new: true }
    ).select("-password -role -otp -otpExpiry -__v");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found with the provided email" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User account status updated to ${status} successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
