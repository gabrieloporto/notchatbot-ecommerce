import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string({ required_error: "El email es obligatorio" })
    .min(1, "El email es obligatorio")
    .email("Email inválido"),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(64, "La contraseña no puede tener más de 64 caracteres"),
});

export const signUpSchema = z
  .object({
    name: z
      .string({ required_error: "El nombre es obligatorio" })
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede tener más de 100 caracteres"),
    email: z
      .string({ required_error: "El email es obligatorio" })
      .min(1, "El email es obligatorio")
      .email("Email inválido"),
    password: z
      .string({ required_error: "La contraseña es obligatoria" })
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(64, "La contraseña no puede tener más de 64 caracteres"),
    confirmPassword: z
      .string({ required_error: "Confirma tu contraseña" })
      .min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
