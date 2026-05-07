import { Metadata } from 'next'
import VerificationForm from './VerificationForm'

export const metadata: Metadata = {
  title: 'Verify Email - SmartBank',
  description: 'Verify your email address to complete your SmartBank registration.',
}

export default function VerifyEmailPage() {
  return <VerificationForm />
}
