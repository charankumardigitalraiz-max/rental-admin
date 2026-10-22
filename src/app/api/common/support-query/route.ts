import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import SupportQuery from "@/models/supportQuery";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, category, subject, message, bookingId, priority } = body;

        if (!name || !email || !phone || !subject || !message) {
            return NextResponse.json(
                { success: false, error: "Please fill in all required fields (Name, Email, Phone, Subject, and Message)." },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const ticketId = `DP-Q-${Math.floor(100000 + Math.random() * 900000)}`;

        const newQuery = await SupportQuery.create({
            ticketId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            category: category || "General Support",
            subject: subject.trim(),
            message: message.trim(),
            bookingId: bookingId ? bookingId.trim() : "",
            priority: priority || "Normal",
            status: "Open",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Your support query has been logged successfully. Our executive will reach out to you within 30 minutes.",
                data: {
                    ticketId: newQuery.ticketId,
                    name: newQuery.name,
                    category: newQuery.category,
                    status: newQuery.status,
                    createdAt: newQuery.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Error creating support query:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to submit query. Please try again or call our 24/7 helpline." },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const ticketId = url.searchParams.get("ticketId");

        if (!ticketId) {
            return NextResponse.json(
                { success: false, error: "ticketId query parameter is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        const query = await SupportQuery.findOne({ ticketId: ticketId.trim().toUpperCase() }).lean();

        if (!query) {
            return NextResponse.json(
                { success: false, error: "Support ticket not found. Please verify your reference number." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    ticketId: (query as any).ticketId,
                    name: (query as any).name,
                    category: (query as any).category,
                    subject: (query as any).subject,
                    status: (query as any).status,
                    createdAt: (query as any).createdAt,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error fetching support query:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch ticket status" },
            { status: 500 }
        );
    }
}
