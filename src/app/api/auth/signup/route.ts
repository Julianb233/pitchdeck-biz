import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  getUserByEmail,
  createUser,
  hashPassword,
  createSessionToken,
  setSessionCookie,
  toSafeUser,
} from "@/lib/auth";

const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SignupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { email, password, name } = parsed.data;

    if (getUserByEmail(email)) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = createUser(email, name, passwordHash);
    const token = await createSessionToken(user.id);
    const headers = setSessionCookie(token);

    return NextResponse.json({ user: toSafeUser(user) }, { status: 201, headers });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
