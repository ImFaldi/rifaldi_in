import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard/DashboardClient";
import { verifyAuthToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/authConstants";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Halaman dashboard internal.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token || !verifyAuthToken(token)) {
    redirect("/auth");
  }

  return <DashboardClient />;
}
