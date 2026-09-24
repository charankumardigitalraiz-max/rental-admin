import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address, licenseNumber } = body;

    if (!firstName || !lastName || !email || !phone || !licenseNumber) {
      return NextResponse.json(
        { success: false, message: "Required fields are missing" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if driver with this email or phone already exists
    const existingDriver = await Driver.findOne({
      $or: [{ email }, { phone }, { licenseNumber }],
    });

    if (existingDriver) {
      return NextResponse.json(
        { success: false, message: "Driver with this email, phone, or license already exists" },
        { status: 409 }
      );
    }

    // Generate unique driver ID
    const driverId = `DRV-${Date.now()}`;

    // Create new driver
    const newDriver = await Driver.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      licenseNumber,
      driverId,
      status: true,
    });

    // Generate token
    const token = jwt.sign(
      { id: newDriver._id, role: "driver" },
      process.env.JWT_SECRET || "fallback",
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Driver registered successfully",
        token,
        driver: {
          id: newDriver._id,
          firstName: newDriver.firstName,
          lastName: newDriver.lastName,
          phone: newDriver.phone,
          email: newDriver.email,
          driverId: newDriver.driverId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Driver registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
