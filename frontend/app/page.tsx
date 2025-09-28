import { Navigation } from "@/components/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
            Converse com seu Agente Virtual de Saúde
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Tire suas dúvidas sobre saúde de forma segura e confiável com nossa IA especializada
          </p>
        </div>
        <ChatInterface />
      </main>
      <Footer />
    </div>
  )
}
