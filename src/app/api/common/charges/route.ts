import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import DriverPricing from "@/models/driverPricing";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET all driver pricing
export async function GET() {
    try {
        await connectToDatabase();
        let driverPricing = await DriverPricing.find().sort({ createdAt: -1 }).lean();
        
        if (!driverPricing || driverPricing.length === 0) {
            const defaultDoc = await DriverPricing.create({
                local: {
                    one_way: {
                        morningHours: { hours: 4, timeRange: "06:00-18:00", customerPrice: 400, driverPrice: 320 },
                        nightHours: { hours: 4, timeRange: "18:00-06:00", customerPrice: 500, driverPrice: 400 },
                    },
                    round_trip: {
                        morningHours: { hours: 8, timeRange: "06:00-18:00", customerPrice: 800, driverPrice: 650 },
                        nightHours: { hours: 8, timeRange: "18:00-06:00", customerPrice: 950, driverPrice: 780 },
                    },
                },
                outstation: {
                    one_way: {
                        day: 1,
                        customerPrice: 1500,
                        driverPrice: 1200,
                        morningHours: { hours: 12, timeRange: "06:00-18:00", customerPrice: 1500, driverPrice: 1200 },
                        nightHours: { hours: 12, timeRange: "18:00-06:00", customerPrice: 1800, driverPrice: 1450 },
                    },
                    round_trip: {
                        day: 1,
                        customerPrice: 2000,
                        driverPrice: 1600,
                        morningHours: { hours: 12, timeRange: "06:00-18:00", customerPrice: 2000, driverPrice: 1600 },
                        nightHours: { hours: 12, timeRange: "18:00-06:00", customerPrice: 2400, driverPrice: 1950 },
                    },
                },
                valletparking: {
                    person: 1,
                    hours: 4,
                    customerprice: 600,
                    driverprice: 480,
                },
            });
            driverPricing = [defaultDoc.toObject ? defaultDoc.toObject() : defaultDoc];
        }

        return NextResponse.json(
            { success: true, data: driverPricing },
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                }
            }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
