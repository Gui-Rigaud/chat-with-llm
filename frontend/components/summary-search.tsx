"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Search, FileText, Calendar, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface ConversationSummary {
  id: string
  date: string
  keyPoints: string[]
  markdown: string
}

export function SummarySearch() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [summary, setSummary] = useState<ConversationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!phoneNumber.trim()) {
      setError("Por favor, digite um número de telefone válido")
      return
    }

    setIsLoading(true)
    setError("")
    setSummary(null)

    try {
      const url = `http://127.0.0.1:8000/summary?phoneNumber=${encodeURIComponent(phoneNumber.trim())}`
      const response = await fetch(url, { method: "GET" })

      if (!response.ok) {
        throw new Error("Conversa não encontrada")
      }

      const data = await response.json()
      const triageText = typeof data?.triage_summary === "string"
        ? data.triage_summary
        : typeof data?.triage_summary?.summary === "string"
          ? data.triage_summary.summary
          : ""

      const lines: string[] = triageText
        .split("\n")
        .map((l: string) => l.trim())
        .filter(Boolean)

      const mapped: ConversationSummary = {
        id: data?._id || phoneNumber.trim(),
        date: data?.finalized_at ? new Date(data.finalized_at).toLocaleString("pt-BR") : new Date().toLocaleString("pt-BR"),
        keyPoints: lines,
        markdown: triageText,
      }
      setSummary(mapped)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar sumário")
    } finally {
      setIsLoading(false)
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
          <CardDescription>Digite o número de telefone para gerar um sumário detalhado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-number">Número de telefone</Label>
            <div className="flex gap-2">
              <Input
                id="phone-number"
                placeholder="Ex: +5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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
                <CardDescription>Telefone: {summary.id}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data:</span>
                <span>{summary.date}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Resumo</h4>
              <div className="text-sm leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {summary.markdown || summary.keyPoints.join("\n")}
                </ReactMarkdown>
              </div>
            </div>

            <Separator />

          </CardContent>
        </Card>
      )}
    </div>
  )
}
