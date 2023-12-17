import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: Request): Promise<Response> {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Получение заголовков
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  // Если заголовки отсутствуют, вызывается ошибка
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Error: Missing svix headers', {
      status: 400
    });
  }

  // Получение тела запроса
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Создание нового экземпляра Svix с использованием секрета
  const svixWebhook = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Проверка подписи запроса с использованием заголовков
  try {
    evt = svixWebhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Webhook verification failed', {
      status: 400
    });
  }

  // Получение типа события
  const eventType = evt.type;

  // Обработка разных типов событий
  switch (eventType) {
    case "user.created":
      try {
        // Вставка данных пользователя в базу данных
        await db.user.create({
          data: {
            externalUserId: payload.data.id,
            username: payload.data.username,
            imageUrl: payload.data.image_url,
          }
        });
      } catch (dbError) {
        console.error('Error inserting user data into the database:', dbError);
        return new Response('Error: Failed to insert user data into the database', {
          status: 500
        });
      }
      break;

    case "user.updated":
      try {
        // Поиск пользователя в базе данных
        const currentUser = await db.user.findUnique({
          where: { externalUserId: payload.data.id }
        });

        // Если пользователь не найден, возвращается ошибка 404
        if (!currentUser) {
          return new Response("User not found", { status: 404 });
        }

        // Обновление данных пользователя в базе данных
        await db.user.update({
          where: { externalUserId: payload.data.id },
          data: {
            username: payload.data.username,
            imageUrl: payload.data.image_url,
          },
        });
      } catch (dbError) {
        console.error('Error updating user data in the database:', dbError);
        return new Response('Error: Failed to update user data in the database', {
          status: 500
        });
      }
      break;

      case "user.deleted":
        try{
          //deleted user from db
          await db.user.delete({
            where: {externalUserId:payload.data.id}
          });
      } catch(dbError){
        console.error('Error deleting user data from the database:', dbError);
        return new Response('Error: Failed to delete user data from the database', {
          status: 500
        });
      }
      break;

    default:
      console.warn(`Warning: Unhandled event type - ${eventType}`);
  }

  return new Response('', { status: 200 });
}
