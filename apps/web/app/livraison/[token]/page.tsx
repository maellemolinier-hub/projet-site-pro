import { DeliveryView } from "@/components/livraison/DeliveryView";

export const dynamic = "force-dynamic";

export default async function LivraisonPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <DeliveryView token={token} />;
}
