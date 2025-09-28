import { Navigation } from "@/components/navigation"
import { SummarySearch } from "@/components/summary-search"
import { Footer } from "@/components/footer"

export default function SummaryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">Buscar Sumário de Conversa</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Digite o ID da conversa para visualizar um resumo detalhado do atendimento
          </p>
        </div>
        <SummarySearch />
      </main>
      <Footer />
    </div>
  )
}
