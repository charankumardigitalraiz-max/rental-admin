import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/admin";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { name, email, password, role } = body;
        const admin = await Admin.findOne({ email });
        if (admin)
            return NextResponse.json(
                { success: false, error: "Admin already exists" },
                { status: 400 }
            );

        const adminCount = await Admin.countDocuments();
        const generateUsername = () => {
            const cleanName = name ? name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 4) : "user";
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            return `${cleanName}${randomNum}`;
        };
        let username = adminCount === 0 ? "admin" : generateUsername();

        while (await Admin.findOne({ username })) {
            username = generateUsername();
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            name,
            username,
            email,
            password: hashedPassword,
            role: role || "superAdmin",
            status: true,
        });

        return NextResponse.json({ success: true, data: newAdmin }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 400 }
        );
    }
}