import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { loginSchema, registerSchema } from "@/server/validators/auth";

export async function registerUser(input: unknown) {
  const payload = registerSchema.parse(input);
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError("An account with that email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);

  return prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email.toLowerCase(),
      passwordHash,
    },
  });
}

export async function authenticateUser(input: unknown) {
  const payload = loginSchema.parse(input);
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  return user;
}
