import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password, confirmPassword } = body;

    // Validaciones de obligatoriedad
    if (!name || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // Validación de longitud de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Validación de coincidencia de contraseña
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Las contraseñas no coinciden" },
        { status: 400 }
      );
    }

    // Validación de correo único
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario con rol por defecto "cliente"
    const newUser = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
        phone,
        password: hashedPassword,
        role: "cliente",
        needsPasswordChange: false,
      },
    });

    return NextResponse.json(
      {
        message: "Cuenta creada exitosamente. Ya puedes iniciar sesión.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar el registro" },
      { status: 500 }
    );
  }
}
