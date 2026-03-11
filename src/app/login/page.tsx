import { LoginForm } from "@/app/components/LoginForm";

export const metadata = {
  title: "Iniciar sesión | NexoShop",
  description: "Ingresá a tu cuenta de NexoShop",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <LoginForm />
    </main>
  );
}
