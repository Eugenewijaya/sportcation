import { AuthPanel } from "@/components/auth-panel"

export default async function MerchantLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return <AuthPanel mode="login" nextPath={next} role="merchant" />
}
