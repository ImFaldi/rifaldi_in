import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard/DashboardClient";
import { verifyAuthToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/authConstants";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token || !verifyAuthToken(token)) {
    redirect("/auth");
  }

  return <DashboardClient />;
}
