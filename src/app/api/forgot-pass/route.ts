import { authService } from "@/services";
import { cookies } from "next/headers";

import { NextResponse } from "next/server";

const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS
  ? process.env.NEXT_PUBLIC_ALLOWED_ORIGINS.split(",")
  : [];

export async function POST(req: Request) {
  const origin = req.headers.get("Origin");

  if (origin && allowedOrigins.includes(origin)) {
    try {
      const bodyText = await req.text();

      if (!bodyText) {
        throw new Error("Request body is empty");
      }
      const { xmail } = JSON.parse(bodyText);
      const { data } = await authService.forgotPasswordUnauthenticated(xmail);

      const response = new NextResponse(
        JSON.stringify({
          message: "Email sent successfully",
        }),
        { status: 200 },
      );

      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "POST");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
      response.headers.set("Access-Control-Allow-Credentials", "true");

      return response;
    } catch (error) {
      console.error("err", error);
      const response = new NextResponse(
        JSON.stringify({
          message: "Email is incorrect",
          error: "Email is incorrect",
        }),
        { status: 400 },
      );

      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "POST");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
      response.headers.set("Access-Control-Allow-Credentials", "true");

      return response;
    }
  } else {
    const response = new NextResponse(
      JSON.stringify({
        message: "Forbidden",
        // error: "CORS policy: Origin not allowed",
      }),
      { status: 403 },
    );

    response.headers.set("Access-Control-Allow-Origin", origin ?? "");
    response.headers.set("Access-Control-Allow-Methods", "POST");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
  }
}
