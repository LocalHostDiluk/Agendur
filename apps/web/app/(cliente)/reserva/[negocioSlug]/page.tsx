import { BookingPortal } from "@/components/cliente/BookingPortal";

export default async function ReservaNegocioPage({
  params,
}: {
  params: Promise<{ negocioSlug: string }>;
}) {
  const { negocioSlug } = await params;

  return (
    <main>
      <BookingPortal negocioSlug={negocioSlug} />
    </main>
  );
}
