import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/customer";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address } = body;

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if customer with this email or phone already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, message: "User with this email or phone already exists" },
        { status: 409 }
      );
    }

    // Generate unique customer ID
    const custId = `CUST-${Date.now()}`;

    // Create new customer
    const newCustomer = await Customer.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      custId,
      status: true,
    });

    // Generate token
    const token = jwt.sign(
      { id: newCustomer._id, role: "customer" },
      process.env.JWT_SECRET || "fallback",
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newCustomer._id,
          firstName: newCustomer.firstName,
          lastName: newCustomer.lastName,
          phone: newCustomer.phone,
          email: newCustomer.email,
          custId: newCustomer.custId,
        },
      },
      { status: 201 }
    );

    response.cookies.set("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7 // 7 days in seconds
    });

    return response;
  } catch (error: any) {
    console.error("User registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
