import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, "İsim zorunludur"),
  email: z.string().email("Geçersiz e-posta adresi"),
  password: z.string().min(8, "Şifre en az 8 karakter uzunluğunda olmalıdır"),
});

const loginSchema = z.object({
  email: z.string().email("Geçersiz e-posta adresi"),
  password: z.string().min(1, "Şifre zorunludur"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token zorunludur"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token zorunludur"),
  newPassword: z.string().min(8, "Şifre en az 8 karakter uzunluğunda olmalıdır"),
  confirmPassword: z.string().min(1, "Şifre doğrulama zorunludur"),
});

const emailSchema = z.object({
  email: z.string().email("Geçersiz e-posta adresi"),
});

const inviteMemberSchema = z.object({
  email: z.string().email("Geçersiz e-posta adresi"),
  role: z.enum(["admin", "member", "viewer"]),
});

const tokenSchema = z.object({
  token: z.string().min(1, "Token zorunludur"),
});

const workspaceSchema = z.object({
  name: z.string().min(1, "İsim zorunludur"),
  description: z.string().optional(),
  color: z.string().min(1, "Renk zorunludur"),
});

const projectSchema = z.object({
  title: z.string().min(3, "Başlık zorunludur"),
  description: z.string().optional(),
  status: z.enum([
    "Planning",
    "In Progress",
    "On Hold",
    "Completed",
    "Cancelled",
  ]),
  startDate: z.string(),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
  members: z
    .array(
      z.object({
        user: z.string(),
        role: z.enum(["manager", "contributor", "viewer"]),
      })
    )
    .optional(),
});

const taskSchema = z.object({
  title: z.string().min(1, "Görev başlığı zorunludur"),
  description: z.string().optional(),
  status: z.enum(["To Do", "In Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Bitiş tarihi zorunludur"),
  assignees: z.array(z.string()).min(1, "En az bir sorumlu atanmalıdır"),
});

export {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  emailSchema,
  workspaceSchema,
  projectSchema,
  taskSchema,
  inviteMemberSchema,
  tokenSchema,
};