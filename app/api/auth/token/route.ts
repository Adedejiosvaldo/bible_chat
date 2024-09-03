import { NextApiRequest } from "next";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest) {
  const token = await getToken({ req });
  return NextResponse.json({ token });
}
