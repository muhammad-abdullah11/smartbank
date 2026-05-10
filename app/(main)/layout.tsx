import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return <AuthGuard>{children}</AuthGuard>
}
