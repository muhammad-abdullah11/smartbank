import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text }: { to: string; subject: string; text: string }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
        },
    });
    await transporter.sendMail({
        from: process.env.USER_EMAIL,
        to,
        subject,
        text,
    });
};

export const sendVerificationEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

 const html = `
<div style="font-family: Arial, sans-serif; background:#0f172a; padding:20px; color:#fff;">
  <div style="max-width:500px; margin:auto; background:#020617; padding:24px; border-radius:12px;">
    <h1 style="text-align:center; margin-bottom:10px; font-size:20px; font-weight:bold;">SmartBank</h1>
    <h2 style="text-align:center; margin-bottom:20px;">Verify Your Account</h2>
    <p style="font-size:14px; color:#cbd5f5; text-align:center;">Use the OTP below to complete your verification. This code will expire shortly.</p>
    <div style="text-align:center; margin:30px 0;">
      <span style="font-size:28px; letter-spacing:6px; font-weight:bold; background:#18181b; padding:12px 20px; border-radius:8px;">${otp}</span>
    </div>
    <p style="font-size:12px; color:#94a3b8; text-align:center;">If you didn’t request this, you can safely ignore this email.</p>
    <p style="font-size:11px; color:#64748b; text-align:center; margin-top:20px;">© ${new Date().getFullYear()} SmartBank. All rights reserved.</p>
  </div>
</div>
`;
  await transporter.sendMail({
    from: `"App Support" <${process.env.USER_EMAIL}>`,
    to,
    subject: "Verify your account",
    html,
  });
};

export const sendPasswordResetEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

  const html = `
<div style="font-family: Arial, sans-serif; background:#0f172a; padding:20px; color:#fff;">
  <div style="max-width:500px; margin:auto; background:#020617; padding:24px; border-radius:12px;">
    <h1 style="text-align:center; margin-bottom:10px; font-size:20px; font-weight:bold;">SmartBank</h1>
    <h2 style="text-align:center; margin-bottom:20px;">Reset Your Password</h2>
    <p style="font-size:14px; color:#cbd5f5; text-align:center;">Use the OTP below to reset your password. This code will expire shortly.</p>
    <div style="text-align:center; margin:30px 0;">
      <span style="font-size:28px; letter-spacing:6px; font-weight:bold; background:#18181b; padding:12px 20px; border-radius:8px;">${otp}</span>
    </div>
    <p style="font-size:12px; color:#94a3b8; text-align:center;">If you didn't request this, you can safely ignore this email.</p>
    <p style="font-size:11px; color:#64748b; text-align:center; margin-top:20px;">© ${new Date().getFullYear()} SmartBank. All rights reserved.</p>
  </div>
</div>
`;
  await transporter.sendMail({
    from: `"App Support" <${process.env.USER_EMAIL}>`,
    to,
    subject: "Reset your password",
    html,
  });
};

export const sendTransferEmail = async ({
  to,
  userName,
  amount,
  type,
  accountNumber,
  otherPartyName,
  balance,
}: {
  to: string;
  userName: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  accountNumber: string;
  otherPartyName: string;
  balance: number;
}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });

  const isDebit = type === "DEBIT";
  const subject = isDebit ? `Transfer Sent: RS ${amount}` : `Money Received: RS ${amount}`;

  const html = `
<div style="font-family: Arial, sans-serif; background:#f8fafc; padding:20px;">
  <div style="max-width:500px; margin:auto; background:#ffffff; padding:24px; border-radius:12px; border: 1px solid #e2e8f0;">
    <h1 style="color:#2563eb; text-align:center; font-size:24px;">SmartBank</h1>
    <p style="font-size:16px; color:#1e293b;">Hello <strong>${userName}</strong>,</p>
    <p style="font-size:14px; color:#475569;">${isDebit ? `You have sent RS <strong>${amount.toLocaleString()}</strong> to <strong>${otherPartyName}</strong>.` : `You have received RS <strong>${amount.toLocaleString()}</strong> from <strong>${otherPartyName}</strong>.`}</p>
    <div style="background:#f1f5f9; padding:16px; border-radius:8px; margin:24px 0;">
        <div style="font-size:13px; color:#64748b; margin-bottom:8px;">Account: <span style="font-weight:bold; color:#1e293b; float:right;">${accountNumber}</span></div>
        <div style="font-size:13px; color:#64748b; margin-bottom:8px;">Amount: <span style="font-weight:bold; color:${isDebit ? '#e11d48' : '#10b981'}; float:right;">${isDebit ? '-' : '+'} RS ${amount.toLocaleString()}</span></div>
        <div style="font-size:13px; color:#64748b;">Balance: <span style="font-weight:bold; color:#1e293b; float:right;">RS ${balance.toLocaleString()}</span></div>
    </div>
    <p style="font-size:11px; color:#cbd5e1; text-align:center; margin-top:24px;">© ${new Date().getFullYear()} SmartBank.</p>
  </div>
</div>
`;
  await transporter.sendMail({ from: `"SmartBank Alerts" <${process.env.USER_EMAIL}>`, to, subject, html });
};

export const sendLoanEmail = async ({ to, userName, amount, status, balance }: { to: string; userName: string; amount: number; status: 'REQUESTED' | 'APPROVED' | 'REJECTED'; balance?: number; }) => {
    const transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 587, secure: false, auth: { user: process.env.USER_EMAIL, pass: process.env.USER_PASS } });
    let subject = `Loan Request: ${status}`;
    let statusColor = '#f59e0b';
    let message = `Your loan request for RS ${amount.toLocaleString()} is pending.`;
    if (status === 'APPROVED') { subject = `Loan Approved: RS ${amount.toLocaleString()}`; statusColor = '#10b981'; message = `Your loan for RS ${amount.toLocaleString()} has been approved.`; }
    else if (status === 'REJECTED') { subject = `Loan Rejected`; statusColor = '#ef4444'; message = `Your loan for RS ${amount.toLocaleString()} was rejected.`; }
    const html = `<div style="font-family:Arial; background:#f8fafc; padding:20px;"><div style="max-width:500px; margin:auto; background:#fff; padding:24px; border-radius:12px; border:1px solid #e2e8f0;"><h1 style="color:#2563eb; text-align:center;">SmartBank Loans</h1><p>Hello <strong>${userName}</strong>,</p><p>${message}</p><div style="background:#f1f5f9; padding:16px; border-radius:8px;"><div style="margin-bottom:8px;">Status: <span style="font-weight:bold; color:${statusColor}; float:right;">${status}</span></div><div>Amount: <span style="font-weight:bold; float:right;">RS ${amount.toLocaleString()}</span></div>${balance !== undefined ? `<div style="margin-top:8px;">Balance: <span style="font-weight:bold; float:right;">RS ${balance.toLocaleString()}</span></div>` : ''}</div></div></div>`;
    await transporter.sendMail({ from: `"SmartBank Loans" <${process.env.USER_EMAIL}>`, to, subject, html });
};

export const sendLoginAlertEmail = async ({ to, userName, deviceInfo, ip }: { to: string; userName: string; deviceInfo: string; ip: string; }) => {
    const transporter = nodemailer.createTransport({ host: "smtp.gmail.com", port: 587, secure: false, auth: { user: process.env.USER_EMAIL, pass: process.env.USER_PASS } });
    const html = `<div style="font-family:Arial; background:#f8fafc; padding:20px;"><div style="max-width:500px; margin:auto; background:#fff; padding:24px; border-radius:12px; border:1px solid #e2e8f0;"><h1 style="color:#2563eb; text-align:center;">Security Alert</h1><p>Hello <strong>${userName}</strong>,</p><p>New login detected:</p><div style="background:#fff7ed; padding:16px; border-radius:8px;"><div>Device: <strong>${deviceInfo}</strong></div><div>IP: <strong>${ip}</strong></div><div>Time: <strong>${new Date().toLocaleString()}</strong></div></div></div></div>`;
    await transporter.sendMail({ from: `"SmartBank Security" <${process.env.USER_EMAIL}>`, to, subject: "New Login Detected", html });
};