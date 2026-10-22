import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Driver from "@/models/driver";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, licenseNumber, planName, planPrice } = body;

        if (!name || !phone || !licenseNumber) {
            return NextResponse.json(
                { success: false, error: "Name, phone number, and driving license are required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const cleanPhone = phone.trim();
        const cleanLicense = licenseNumber.trim().toUpperCase();

        // Check if driver already registered
        const existing = await Driver.findOne({
            $or: [{ phone: cleanPhone }, { licenseNumber: cleanLicense }]
        });

        if (existing) {
            return NextResponse.json(
                { 
                    success: true, 
                    message: "You have already registered with this phone or license number. Our verification team is reviewing your profile.",
                    alreadyExists: true 
                },
                { status: 200 }
            );
        }

        const nameParts = name.trim().split(" ");
        const firstName = nameParts[0] || "Driver";
        const lastName = nameParts.slice(1).join(" ") || "Partner";
        const email = `driver.${cleanPhone.replace(/\D/g, '')}@drivepulse.in`;
        const driverId = `DRV-${Date.now().toString().slice(-6)}`;

        const newDriver = await Driver.create({
            firstName,
            lastName,
            email,
            phone: cleanPhone,
            licenseNumber: cleanLicense,
            driverId,
            status: "pending",
            isOnline: false,
            isVerified: false,
            address: planName ? `Requested Plan: ${planName} (₹${planPrice || 999})` : "Website Lead Application",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Driver partner application registered successfully",
                data: {
                    driverId: newDriver.driverId,
                    firstName: newDriver.firstName,
                }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error submitting driver application:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to submit driver application" },
            { status: 500 }
        );
    }
}
