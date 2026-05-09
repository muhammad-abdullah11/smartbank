import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if there is a session and if the user is an admin
  if (!session?.user || session.user.role !== "admin") {
    // Redirect non-admins or unauthenticated users to the homepage (or login)
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Future Admin Navigation / Sidebar can be added here */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
