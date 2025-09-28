"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, FileText, Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConversationSummary {
  id: string
  date: string
  duration: string
  mainTopics: string[]
  keyPoints: string[]
  recommendations: string[]
  urgencyLevel: "low" | "medium" | "high"
  followUpNeeded: boolean
}

export function SummarySearch() {
  const [conversationId, setConversationId] = useState("")
  const [summary, setSummary] = useState<ConversationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!conversationId.trim()) {
      setError("Por favor, digite um ID de conversa válido")
      return
    }

    setIsLoading(true)
    setError("")
    setSummary(null)

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId: conversationId.trim() }),
      })

      if (!response.ok) {
        throw new Error("Conversa não encontrada")
      }

      const data = await response.json()
      setSummary(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar sumário")
    } finally {
      setIsLoading(false)
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case "high":
        return "Alta Prioridade"
      case "medium":
        return "Prioridade Média"
      case "low":
        return "Baixa Prioridade"
      default:
        return "Não Definida"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Conversa
          </CardTitle>
          <CardDescription>Digite o ID da conversa para gerar um sumário detalhado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conversation-id">ID da Conversa</Label>
            <div className="flex gap-2">
              <Input
                id="conversation-id"
                placeholder="Ex: conv_1234567890_abc123"
                value={conversationId}
                onChange={(e) => setConversationId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sumário da Conversa
                </CardTitle>
                <CardDescription>ID: {summary.id}</CardDescription>
              </div>
              <Badge variant={getUrgencyColor(summary.urgencyLevel)}>{getUrgencyLabel(summary.urgencyLevel)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data:</span>
                <span>{summary.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Duração:</span>
                <span>{summary.duration}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Principais Tópicos Abordados</h4>
              <div className="flex flex-wrap gap-2">
                {summary.mainTopics.map((topic, index) => (
                  <Badge key={index} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Pontos-Chave da Conversa</h4>
              <ul className="space-y-2">
                {summary.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-3">Recomendações</h4>
              <ul className="space-y-2">
                {summary.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {summary.followUpNeeded && (
              <>
                <Separator />
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Acompanhamento Necessário:</strong> Esta conversa indica a necessidade de acompanhamento
                    médico profissional.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
