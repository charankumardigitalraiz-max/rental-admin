import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";
import { uploadFile } from "@/lib/uploadFile";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const licenseNumber = formData.get("licenseNumber") as string;
    const pancardNumber = formData.get("pancardNumber") as string;
    const aadhaarNumber = formData.get("aadhaarNumber") as string;
    const passportId = formData.get("passportId") as string;

    const pancardFile = formData.get("pancard") as File | null;
    const aadhaarCardFrontFile = formData.get("aadhaarCardFront") as File | null;
    const aadhaarCardBackFile = formData.get("aadhaarCardBack") as File | null;
    const drivingLicenseFile = formData.get("drivingLicense") as File | null;
    const selfieFile = formData.get("selfie") as File | null;
    const passportFile = formData.get("passport") as File | null;

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

    // Handle file uploads
    const pancard = await uploadFile(pancardFile);
    const aadhaarCardFront = await uploadFile(aadhaarCardFrontFile);
    const aadhaarCardBack = await uploadFile(aadhaarCardBackFile);
    const drivingLicense = await uploadFile(drivingLicenseFile);
    const selfie = await uploadFile(selfieFile);
    const passport = await uploadFile(passportFile);

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
      pancardNumber,
      aadhaarNumber,
      passportId,
      driverId,
      pancard,
      aadhaarCardFront,
      aadhaarCardBack,
      drivingLicense,
      selfie,
      passport,
      isVerified: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please wait for admin approval.",
        driver: {
          id: newDriver._id,
          firstName: newDriver.firstName,
          lastName: newDriver.lastName,
          phone: newDriver.phone,
          email: newDriver.email,
          driverId: newDriver.driverId,
          isVerified: newDriver.isVerified ?? false,
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
