import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { hasAnyUser } from "@/server/queries";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (!(await hasAnyUser())) redirect("/setup");
  if (await getSession()) redirect("/");
  return <LoginForm />;
}
