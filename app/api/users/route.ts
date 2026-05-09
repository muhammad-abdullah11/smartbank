import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/Models/user.Model";

export async function GET(req: NextRequest) {

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        await connectDB();

        const users = await User.find()
            .select("-password -role -otp -otpExpiry -__v")
            .lean();

        if (!users) {
            return NextResponse.json(
                { success: false, message: "Users not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "User fetch successfully",
            users
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}