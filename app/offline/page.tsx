import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export const metadata = {
  title: 'غير متصل',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-bg">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[#22C55E]/10 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-[#22C55E]" />
        </div>
        <h1 className="font-cairo font-bold text-3xl mb-3">أنت غير متصل</h1>
        <p className="text-[#94A3B8] mb-8">
          مفيش اتصال بالإنترنت دلوقتي. بياناتك المحفوظة لسه متاحة، وهتتزامن
          تلقائياً لما يرجع النت.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all"
        >
          حاول تاني
        </Link>
      </div>
    </div>
  )
}
