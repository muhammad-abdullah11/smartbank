import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/Models/user.Model';
import { AccountStatus } from '@/Models/user.Model';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    if (user.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 401 }
      );
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      );
    }

    user.isEmailVerified = true;
    user.accountStatus = AccountStatus.ACTIVE;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    return NextResponse.json(
      { message: 'Email verified successfully', user: { fullName: user.fullName, email: user.email, accountNumber: user.accountNumber } },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
