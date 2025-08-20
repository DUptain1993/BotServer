import { redirect } from "next/navigation"

export default function LoginPage() {
  // Redirect to main page since authentication is disabled
  redirect("/")
}