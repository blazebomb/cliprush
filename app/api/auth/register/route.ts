import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

import User from "@/models/Users";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and Password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    await User.create({
      email,
      password,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "failed to register user" },
      { status: 500 }
    );
  }
}

// CODE TO SEND THE USER TO THE BACKEND FROM THE FRONTEND
// fetch("api/auth/register", {
//   method : "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },body: JSON.stringify({email, password})
// })

// resizeBy.json 