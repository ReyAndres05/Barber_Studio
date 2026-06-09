import nodemailer from "nodemailer";

// Configuración del transporter.
// Si no hay variables de entorno, Nodemailer puede usar Ethereal para pruebas
// o simplemente puedes loguear el mensaje a la consola.
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // generated ethereal user
    pass: process.env.SMTP_PASS, // generated ethereal password
  },
});

export async function sendCommentNotification(
  userName: string,
  userEmail: string,
  rating: number,
  comment: string
) {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@barberstudio.com";

  const mailOptions = {
    from: `"Barber Studio Bot" <${process.env.SMTP_USER || "no-reply@barberstudio.com"}>`,
    to: adminEmail,
    subject: "Nuevo comentario recibido",
    text: `Nombre: ${userName}\n\nCorreo: ${userEmail}\n\nCalificación: ${rating} estrellas\n\nComentario:\n${comment}\n\nFecha:\n${new Date().toLocaleDateString("es-ES")}`,
  };

  try {
    if (!process.env.SMTP_USER) {
      console.log("Mock Email Sent:");
      console.log(mailOptions.text);
      return { success: true, message: "Mock email logged to console" };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
