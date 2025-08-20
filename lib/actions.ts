"use server"

// Authentication is disabled - using local storage instead
// These functions are kept for compatibility but don't perform any actions

// Sign in action
export async function signIn(prevState: any, formData: FormData) {
  return { success: true }
}

// Sign up action
export async function signUp(prevState: any, formData: FormData) {
  return { success: "Account created successfully." }
}

// Sign out action
export async function signOut() {
  // No server-side sign out needed since we're using local storage
  return { success: true }
}
