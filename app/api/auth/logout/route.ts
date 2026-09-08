import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente.",
    });
  } catch (error) {
    Sentry.captureException(error);
    const message = error instanceof Error ? error.message : "Error al cerrar sesión.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

