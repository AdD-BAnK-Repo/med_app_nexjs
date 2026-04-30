import { NextResponse } from "next/server"; export async function GET() { return NextResponse.json({ test: "hello", location: null, shelf: null }); }
