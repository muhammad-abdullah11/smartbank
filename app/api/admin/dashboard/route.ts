import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/Models/user.Model";
import Loan from "@/Models/loan.Model";
import { Transitions } from "@/Models/transaction.Model";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Admin access required" },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: "active" });

    const balanceAggregation = await User.aggregate([
      { $group: { _id: null, totalBalance: { $sum: "$balance" } } }
    ]);
    const totalBalance = balanceAggregation[0]?.totalBalance || 0;

    const totalLoans = await Loan.countDocuments();
    const pendingLoans = await Loan.countDocuments({ status: "PENDING" });

    const totalTransactions = await Transitions.countDocuments();

    const recentLoans = await Loan.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentTransactions = await Transitions.find()
      .populate("fromUser", "fullName")
      .populate("toUser", "fullName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentUsers = await User.find()
      .select("fullName email accountStatus createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalBalance,
        totalLoans,
        pendingLoans,
        totalTransactions
      },
      recentLoans,
      recentTransactions,
      recentUsers
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
