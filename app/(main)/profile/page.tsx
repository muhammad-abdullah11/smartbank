"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

type User = {
  _id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  accountType: string;
  balance: number;
  isEmailVerified: boolean;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  accountStatus: string;
  failedLoginAttempts: number;
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
  usedDailyLimit: number;
  usedMonthlyLimit: number;
  accountNumber: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/users/me");
        setUser(res.data.user);
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="max-w-md m-12 p-6 bg-white rounded-2xl shadow-lg space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-300 rounded"></div>
        <div className="h-4 w-60 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="text-center mt-10 text-gray-500">No user found</div>;
  }

  return (
    <div className="max-w-md m-12 bg-white shadow-lg rounded-2xl p-6 space-y-5">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
          {user.fullName.charAt(0)}
        </div>
        <h2 className="mt-2 text-lg font-semibold">{user.fullName}</h2>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Account Number</span>
          <span className="font-medium">{user.accountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Account Type</span>
          <span className="font-medium capitalize">{user.accountType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Balance</span>
          <span className="font-semibold text-green-600">
            Rs {user.balance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Status</span>
          <span className="font-medium capitalize">{user.accountStatus}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Email Verified</span>
          <span
            className={`font-medium ${
              user.isEmailVerified ? "text-green-600" : "text-red-600"
            }`}
          >
            {user.isEmailVerified ? "Yes" : "No"}
          </span>
        </div>
      </div>

    

      <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
        <h3 className="font-semibold text-gray-700">Limits</h3>
        <div className="flex justify-between">
          <span className="text-gray-500">Daily Limit</span>
          <span>{user.dailyTransactionLimit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Used Daily</span>
          <span>{user.usedDailyLimit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Monthly Limit</span>
          <span>{user.monthlyTransactionLimit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Used Monthly</span>
          <span>{user.usedMonthlyLimit}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl space-y-1 text-sm">
        <h3 className="font-semibold text-gray-700">Address</h3>
        <p>{user.address.street}</p>
        <p>
          {user.address.city}, {user.address.state}
        </p>
        <p>
          {user.address.postalCode}, {user.address.country}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
        <h3 className="font-semibold text-gray-700">Dates</h3>
        <div className="flex justify-between">
          <span className="text-gray-500">DOB</span>
          <span>{new Date(user.dateOfBirth).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Created</span>
          <span>{new Date(user.createdAt).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Last Login</span>
          <span>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default Profile;