import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
  CLOSED = 'closed',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export interface IUser extends Document {

  fullName: string;
  email: string;
  dateOfBirth: Date;
  password: string;
  accountNumber: string;
  accountType: 'savings' | 'current' | 'salary';
  balance: number;
  isEmailVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  
  role: UserRole;
  accountStatus: AccountStatus;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
   usedDailyLimit: number;
   usedMonthlyLimit: number;
    
  isAccountLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(value: Date) {
          const age = new Date().getFullYear() - value.getFullYear();
          return age >= 18;
        },
        message: 'User must be at least 18 years old',
      },
    },
    
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: () => crypto.randomBytes(8).toString('hex').toUpperCase(),
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'salary'],
      default: 'savings',
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
      get: (v: number) => v / 100, 
      set: (v: number) => Math.round(v * 100),
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    address: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: 'PK',
      },
    },
    
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    accountStatus: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PENDING_VERIFICATION,
    },
    lastLoginAt: Date,
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockedUntil: Date,
    
    dailyTransactionLimit: {
      type: Number,
      default: 500000, 
      get: (v: number) => v / 100,
      set: (v: number) => v * 100,
    },
    monthlyTransactionLimit: {
      type: Number,
      default: 10000000, // $10,000
      get: (v: number) => v / 100,
      set: (v: number) => v * 100,
    },
    usedDailyLimit: {
      type: Number,
      default: 0,
      get: (v: number) => v / 100,
      set: (v: number) => v * 100,
    },
    usedMonthlyLimit: {
      type: Number,
      default: 0,
      get: (v: number) => v / 100,
      set: (v: number) => v * 100,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true },
    toObject: { getters: true, virtuals: true },
  }
);

UserSchema.index({ email: 1, accountStatus: 1 });
UserSchema.index({ accountNumber: 1 });
UserSchema.index({ phoneNumber: 1 });
UserSchema.index({ 'kycDocuments.documentNumber': 1 });

UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  this.failedLoginAttempts += 1;
  
  if (this.failedLoginAttempts >= 5) {
    this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  
  await this.save();
};

UserSchema.methods.resetLoginAttempts = async function(): Promise<void> {
  this.failedLoginAttempts = 0;
  this.accountLockedUntil = undefined;
  await this.save();
};

UserSchema.methods.isAccountLocked = function(): boolean {
  if (!this.accountLockedUntil) return false;
  return this.accountLockedUntil > new Date();
};

UserSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const User = (mongoose.models.User as Model<IUser>) || 
             mongoose.model<IUser>('User', UserSchema);

export default User;