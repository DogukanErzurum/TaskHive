import { ProjectStatus } from "@/types";
import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Geçersiz e-posta adresi"),
  password: z.string().min(6, "Şifre zorunludur"),
});

export const signUpSchema = z
  .object({
    email: z.string().email("Geçersiz e-posta adresi"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    name: z.string().min(3, "İsim en az 3 karakter olmalıdır"),
    confirmPassword: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Şifreler eşleşmiyor",
  });

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    confirmPassword: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Şifreler eşleşmiyor",
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Geçersiz e-posta adresi"),
});

export const workspaceSchema = z.object({
  name: z.string().min(3, "İsim en az 3 karakter olmalıdır"),
  color: z.string().min(3, "Renk en az 3 karakter olmalıdır"),
  description: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(3, "Başlık en az 3 karakter olmalıdır"),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus),
  startDate: z.string().min(10, "Başlangıç tarihi zorunludur"),
  dueDate: z.string().min(10, "Bitiş tarihi zorunludur"),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .optional(),
  tags: z.string().optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1, "Görev başlığı zorunludur"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Son tarih zorunludur"),
  assignees: z.array(z.string()).min(1, "En az bir kişi atanmalıdır"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
});