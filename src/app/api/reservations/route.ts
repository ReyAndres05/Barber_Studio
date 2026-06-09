import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Si es admin, puede ver todas. Si es cliente, solo las suyas.
  const role = session.user.role;
  let reservations;

  if (role === "admin") {
    reservations = await prisma.reservation.findMany({
      include: { user: true, service: true, barber: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    reservations = await prisma.reservation.findMany({
      where: { userId: session.user.id },
      include: { service: true, barber: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { serviceId, barberId, date, time, price } = body;

    if (!serviceId || !date || !time) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const newReservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        serviceId,
        barberId,
        date,
        time,
        price,
        status: "pending",
      },
    });

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}
