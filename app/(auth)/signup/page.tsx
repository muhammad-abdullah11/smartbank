import { Metadata } from 'next'
import Image from 'next/image'
import SignupForm from './SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up - SmartBank',
  description: 'Create your SmartBank account to access secure online banking services. Sign up today for savings, checking, or business accounts with competitive rates.',
  keywords: ['sign up', 'register', 'banking', 'online banking', 'SmartBank', 'savings account', 'checking account'],
  openGraph: {
    title: 'Sign Up - SmartBank',
    description: 'Create your SmartBank account today and experience secure online banking.',
    type: 'website',
  },
}

export default function SignupPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Sign Up - SmartBank',
    description: 'Create your SmartBank account to access secure online banking services.',
    publisher: {
      '@type': 'Organization',
      name: 'SmartBank',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="h-screen flex overflow-hidden">
        <section className="hidden md:block lg:w-1/3 relative">
          <Image
            src="https://plus.unsplash.com/premium_photo-1661301075857-63868ae88c00?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c21hcnQlMjBiYW5rfGVufDB8fDB8fHww"
            alt="Smart banking illustration"
            fill
            className="object-cover"
            priority
          />
        </section>
        <section className="w-full lg:w-2/3 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
          <div className="w-full max-w-lg">
            <SignupForm />
          </div>
        </section>
      </main>
    </>
  )
}
