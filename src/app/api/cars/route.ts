import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Car from "@/models/Car";

export async function GET() {
  try {
    await connectToDatabase();
    const cars = await Car.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: cars }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const car = await Car.create(body);
    return NextResponse.json({ success: true, data: car }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
