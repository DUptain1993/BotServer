import { redirect } from "next/navigation"

export default function RegisterPage() {
  // Redirect to main page since authentication is disabled
  redirect("/")
}