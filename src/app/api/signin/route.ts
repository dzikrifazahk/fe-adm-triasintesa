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
      const { xuser, xpass } = JSON.parse(bodyText);
      const { data } = await authService.login(xuser, xpass);
      const cookieStore = await cookies();
      cookieStore.delete("accessToken");
      cookieStore.delete("userData");

      const user = {
        username: data.user.username,
        email: data.user.email,
        role: data.user.role?.name,
      };

      cookieStore.set("accessToken", data.accessToken, {
        path: "/",
        // httpOnly: true,
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
      });

      cookieStore.set("userData", JSON.stringify(user), {
        path: "/",
        // httpOnly: true,
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
      });

      const response = new NextResponse(
        JSON.stringify({
          message: "Login Success",
        }),
        { status: 200 },
      );

      response.cookies.set("role", String(data.user.role?.name), {
        path: "/",
        httpOnly: false,
        secure: process.env.NEXT_PUBLIC_NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
      });

      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "POST");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
      response.headers.set("Access-Control-Allow-Credentials", "true");

      return response;
    } catch (error) {
      console.error("err", error);
      const response = new NextResponse(
        JSON.stringify({
          message: "Email or Password is incorrect",
          error: "Email or Password is incorrect",
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

export async function GET() {
  const response = new NextResponse(
    JSON.stringify({
      message: "Hello from API",
    }),
    { status: 200 },
  );

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}
