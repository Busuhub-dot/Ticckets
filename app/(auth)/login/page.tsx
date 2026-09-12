import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600">
            <span className="text-xl font-bold text-white">ET</span>
          </div>

          <h1 className="text-2xl font-semibold text-white">
            Event Ticket System
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Sign in to manage event tickets
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
