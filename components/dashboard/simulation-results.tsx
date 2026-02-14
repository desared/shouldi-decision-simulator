"use client"

import { ArrowUpRight, ArrowDownRight, Minus, Download, ArrowLeft } from "lucide-react"
import { jsPDF } from "jspdf"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface Factor {
    id: string
    label: string
    value: number
    min: number
    max: number
    unit?: string
    question?: string
    answer?: string
}

interface Outcome {
    id: string
    label: string
    value: number
    rangeMin: number
    rangeMax: number
    trend: "up" | "down" | "stable"
    description?: string
    confidence?: "high" | "medium" | "low"
    confidenceInterval?: string
    recommendation?: string
}

interface SimulationResultsProps {
    title: string
    factors: Factor[]
    outcomes: Outcome[]
    status: "optimal" | "moderate" | "risk"
    onBack: () => void
    showDownload?: boolean
}

export function SimulationResults({ title, factors, outcomes, status, onBack, showDownload = true }: SimulationResultsProps) {
    const t = useTranslations('dashboard')

    const statusConfig = {
        optimal: { label: t('results.optimal'), color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
        moderate: { label: t('results.moderate'), color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
        risk: { label: t('results.risk'), color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
    }

    const handleDownloadPDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 20
        const contentWidth = pageWidth - margin * 2
        let y = 20

        const checkPageBreak = (needed: number) => {
            if (y + needed > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage()
                y = 20
            }
        }

        // Header
        doc.setFontSize(22)
        doc.setFont("helvetica", "bold")
        doc.text("shouldi", margin, y)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(120, 120, 120)
        doc.text("Decision Simulation Report", margin + 42, y)
        y += 4
        doc.setDrawColor(100, 100, 255)
        doc.setLineWidth(0.5)
        doc.line(margin, y, pageWidth - margin, y)
        y += 12

        // Title & Status
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        const titleLines = doc.splitTextToSize(title, contentWidth)
        doc.text(titleLines, margin, y)
        y += titleLines.length * 7 + 4

        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        const statusLabel = statusConfig[status].label
        const statusColor = status === "optimal" ? [34, 139, 34] : status === "moderate" ? [200, 160, 0] : [200, 50, 50]
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
        doc.text(`Status: ${statusLabel}`, margin, y)
        doc.setTextColor(120, 120, 120)
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, y)
        y += 12

        // Input Factors
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Input Factors", margin, y)
        y += 8

        factors.forEach((factor) => {
            checkPageBreak(20)
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(40, 40, 40)
            const qLines = doc.splitTextToSize(factor.question || factor.label, contentWidth - 10)
            doc.text(qLines, margin + 4, y)
            y += qLines.length * 5 + 2

            doc.setFont("helvetica", "normal")
            doc.setTextColor(80, 80, 80)
            doc.text(`Answer: ${factor.answer || 'N/A'}`, margin + 4, y)
            doc.setTextColor(100, 100, 255)
            doc.text(`${factor.value}${factor.unit || ''}`, pageWidth - margin - 15, y)
            y += 8

            doc.setDrawColor(220, 220, 220)
            doc.setLineWidth(0.2)
            doc.line(margin + 4, y - 3, pageWidth - margin, y - 3)
        })

        y += 6

        // Predicted Outcomes
        checkPageBreak(20)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Predicted Outcomes", margin, y)
        y += 8

        outcomes.forEach((outcome) => {
            checkPageBreak(35)
            doc.setFontSize(11)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(40, 40, 40)
            doc.text(outcome.label, margin + 4, y)

            const trendSymbol = outcome.trend === "up" ? "▲" : outcome.trend === "down" ? "▼" : "—"
            const trendColor = outcome.trend === "up" ? [34, 139, 34] : outcome.trend === "down" ? [200, 50, 50] : [120, 120, 120]
            doc.setTextColor(trendColor[0], trendColor[1], trendColor[2])
            doc.text(`${outcome.value}% ${trendSymbol}`, pageWidth - margin - 25, y)
            y += 6

            // Range bar
            const barX = margin + 4
            const barWidth = contentWidth - 10
            const barHeight = 3
            doc.setFillColor(230, 230, 230)
            doc.roundedRect(barX, y, barWidth, barHeight, 1.5, 1.5, "F")
            const rangeStart = barX + (outcome.rangeMin / 100) * barWidth
            const rangeWidth = ((outcome.rangeMax - outcome.rangeMin) / 100) * barWidth
            doc.setFillColor(100, 100, 255, 0.3)
            doc.roundedRect(rangeStart, y, rangeWidth, barHeight, 1.5, 1.5, "F")
            const valuePos = barX + (outcome.value / 100) * barWidth
            doc.setFillColor(80, 80, 220)
            doc.roundedRect(valuePos - 0.75, y, 1.5, barHeight, 0.5, 0.5, "F")
            y += 5

            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(`${outcome.rangeMin}%`, barX, y + 3)
            doc.text(`${outcome.rangeMax}%`, barX + barWidth - 8, y + 3)
            y += 6

            if (outcome.description) {
                doc.setFontSize(9)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(80, 80, 80)
                const descLines = doc.splitTextToSize(outcome.description, contentWidth - 10)
                checkPageBreak(descLines.length * 4 + 4)
                doc.text(descLines, margin + 4, y)
                y += descLines.length * 4 + 2
            }

            if (outcome.confidenceInterval) {
                doc.setFontSize(8)
                doc.setTextColor(120, 120, 120)
                doc.text(`Confidence Interval: ${outcome.confidenceInterval}`, margin + 4, y)
                y += 5
            }

            y += 4
            doc.setDrawColor(220, 220, 220)
            doc.setLineWidth(0.2)
            doc.line(margin + 4, y - 2, pageWidth - margin, y - 2)
        })

        // Footer
        checkPageBreak(15)
        y += 8
        doc.setDrawColor(100, 100, 255)
        doc.setLineWidth(0.5)
        doc.line(margin, y, pageWidth - margin, y)
        y += 6
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text("Generated by shouldi - AI-Powered Decision Simulator | shouldi.io", margin, y)

        doc.save(`${title.replace(/\s+/g, '_')}_report.pdf`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    <div className={cn("inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-medium", statusConfig[status].bg, statusConfig[status].color)}>
                        {statusConfig[status].label}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('results.back')}
                    </Button>
                    {showDownload && (
                        <Button onClick={handleDownloadPDF} className="gradient-primary text-white">
                            <Download className="mr-2 h-4 w-4" />
                            {t('results.downloadPdf')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Factors */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4">{t('results.inputFactors')}</h2>
                    <div className="space-y-4">
                        {factors.map((factor) => (
                            <div key={factor.id} className="py-3 border-b border-border last:border-0">
                                <p className="text-sm font-medium text-foreground mb-1">
                                    {factor.question || factor.label}
                                </p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground mr-2">
                                        Answer: <span className="text-foreground">{factor.answer || 'N/A'}</span>
                                    </span>
                                    <span className="font-semibold text-primary">
                                        {factor.value}{factor.unit || ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Predicted Outcomes */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4">{t('results.predictedOutcomes')}</h2>
                    <div className="space-y-6">
                        {outcomes.map((outcome) => (
                            <div key={outcome.id} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="font-medium text-foreground">{outcome.label}</h3>
                                    <div className={cn(
                                        "shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium",
                                        outcome.trend === "up" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                            outcome.trend === "down" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                                    )}>
                                        {outcome.value}%
                                        {outcome.trend === "up" && <ArrowUpRight className="h-3 w-3" />}
                                        {outcome.trend === "down" && <ArrowDownRight className="h-3 w-3" />}
                                        {outcome.trend === "stable" && <Minus className="h-3 w-3" />}
                                    </div>
                                </div>

                                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-primary/30 rounded-full"
                                        style={{ left: `${outcome.rangeMin}%`, width: `${outcome.rangeMax - outcome.rangeMin}%` }}
                                    />
                                    <div
                                        className="absolute h-full w-1 bg-primary rounded-full"
                                        style={{ left: `${outcome.value}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{outcome.rangeMin}%</span>
                                    <span>{outcome.rangeMax}%</span>
                                </div>

                                {outcome.description && (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {outcome.description}
                                    </p>
                                )}

                                {outcome.confidenceInterval && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-muted-foreground">Confidence Interval:</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border">
                                            {outcome.confidenceInterval}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
