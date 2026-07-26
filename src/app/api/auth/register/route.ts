import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { logError } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const existing = await db.user.findUnique({
      where: { email: validated.email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(validated.password);

    const user = await db.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
        displayName: validated.name,
      },
      select: { id: true, email: true, displayName: true },
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: user.displayName,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { issues: Array<{ message: string }> }).issues },
        { status: 400 }
      );
    }
    logError("auth/register", "Failed to register user", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
