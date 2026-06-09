import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendCommentNotification } from "@/lib/mailer";

export async function GET() {
  const comments = await prisma.comment.findMany({
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { comment, rating } = body;

    if (!comment || !rating) {
      return NextResponse.json(
        { error: "Comentario y calificación son obligatorios" },
        { status: 400 }
      );
    }

    const newComment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        comment,
        rating,
      },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    });

    // Enviar correo asíncronamente
    sendCommentNotification(
      newComment.user.name || "Cliente Anónimo",
      newComment.user.email || "Sin correo",
      rating,
      comment
    ).catch((e) => console.error("Fallo al enviar correo", e));

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear el comentario" },
      { status: 500 }
    );
  }
}
