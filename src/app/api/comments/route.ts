import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendCommentNotification } from "@/lib/mailer";

export async function GET() {
  try {
    const comments = await prisma.comments.findMany({
      include: {
        users: {
          select: { name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedComments = comments.map((c: any) => {
      const { users, ...rest } = c;
      return { ...rest, user: users };
    });

    return NextResponse.json(formattedComments);
  } catch (error) {
    console.error("Error in GET /api/comments:", error);
    return NextResponse.json(
      { error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
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

    const newComment = await prisma.comments.create({
      data: {
        id: crypto.randomUUID(),
        users: { connect: { id: session.user.id } },
        comment,
        rating,
      },
      include: {
        users: {
          select: { name: true, email: true, image: true },
        },
      },
    });

    const { users, ...rest } = newComment;
    const formattedComment = { ...rest, user: users };

    // Enviar correo asíncronamente
    sendCommentNotification(
      formattedComment.user?.name || "Cliente Anónimo",
      formattedComment.user?.email || "Sin correo",
      rating,
      comment
    ).catch((e) => console.error("Fallo al enviar correo", e));

    return NextResponse.json(formattedComment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear el comentario" },
      { status: 500 }
    );
  }
}
