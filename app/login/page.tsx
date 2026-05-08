import { Metadata } from 'next'
import Image from 'next/image'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign In - SmartBank',
  description: 'Sign in to your SmartBank account to access secure online banking services, view balances, and manage transactions.',
  keywords: ['sign in', 'login', 'banking', 'online banking', 'SmartBank', 'account login'],
  openGraph: {
    title: 'Sign In - SmartBank',
    description: 'Sign in to your SmartBank account and manage your finances securely.',
    type: 'website',
  },
}

export default function LoginPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Sign In - SmartBank',
    description: 'Sign in to your SmartBank account to access secure online banking services.',
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
            src="https://images.unsplash.com/photo-1733503747506-773e56e4078f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8b25saW5lJTIwYmFua2luZ3xlbnwwfHwwfHx8MA%3D%3D"
            alt="Online banking illustration"
            fill
            className="object-cover"
            priority
          />
        </section>
        <section className="w-full lg:w-2/3 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
          <div className="w-full max-w-lg">
            <LoginForm />
          </div>
        </section>
      </main>
    </>
  )
}
