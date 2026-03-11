import { RegisterForm } from "@/app/components/RegisterForm";

export const metadata = {
  title: "Crear cuenta | NexoShop",
  description: "Registrate en NexoShop para comprar",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <RegisterForm />
    </main>
  );
}
