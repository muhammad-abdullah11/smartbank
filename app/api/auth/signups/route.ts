import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import User from '@/Models/user.Model';
import { sendVerificationEmail } from '@/lib/nodemailer';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { fullName, email, dateOfBirth, password, accountType, address } = body;

    if (!fullName || !email || !dateOfBirth || !password || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      fullName,
      email,
      dateOfBirth: new Date(dateOfBirth),
      password: hashedPassword,
      accountType: accountType || 'savings',
      address,
      otp,
      otpExpiry,
    });

    await sendVerificationEmail(email, otp);

    const userResponse = user.toObject();
    userResponse.password="";

    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
