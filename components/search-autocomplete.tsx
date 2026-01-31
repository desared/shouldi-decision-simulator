"use client"

import { useState, useRef, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Search, Briefcase, MapPin, Home, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectScenario: (id: string) => void
  onPremiumClick: () => void
  placeholder: string
}

export function SearchAutocomplete({
  value,
  onChange,
  onSelectScenario,
  onPremiumClick,
  placeholder
}: SearchAutocompleteProps) {
  const t = useTranslations('scenarios')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const scenarios = [
    {
      id: 'job-change',
      icon: Briefcase,
      titleKey: 'jobChange.title',
      descriptionKey: 'jobChange.description',
      premium: false,
      keywords: ['job', 'career', 'work', 'salary', 'position', 'arbeit', 'beruf', 'gehalt', 'stelle', 'wechsel']
    },
    {
      id: 'relocate',
      icon: MapPin,
      titleKey: 'relocate.title',
      descriptionKey: 'relocate.description',
      premium: false,
      keywords: ['city', 'move', 'relocate', 'location', 'stadt', 'umzug', 'umziehen', 'ort', 'wohnort']
    },
    {
      id: 'buy-rent',
      icon: Home,
      titleKey: 'buyRent.title',
      descriptionKey: 'buyRent.description',
      premium: false,
      keywords: ['buy', 'rent', 'house', 'home', 'apartment', 'kaufen', 'mieten', 'haus', 'wohnung', 'immobilie']
    },
    {
      id: 'work-hours',
      icon: Clock,
      titleKey: 'workHours.title',
      descriptionKey: 'workHours.description',
      premium: true,
      keywords: ['hours', 'time', 'reduce', 'part-time', 'stunden', 'zeit', 'reduzieren', 'teilzeit', 'arbeitszeit']
    }
  ]

  const filteredScenarios = value.trim()
    ? scenarios.filter(s => {
      const searchLower = value.toLowerCase()
      const title = t(s.titleKey).toLowerCase()
      const description = t(s.descriptionKey).toLowerCase()
      const keywordMatch = s.keywords.some(k => k.includes(searchLower) || searchLower.includes(k))
      return title.includes(searchLower) || description.includes(searchLower) || keywordMatch
    })
    : scenarios

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredScenarios.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredScenarios.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && filteredScenarios[highlightedIndex]) {
          const scenario = filteredScenarios[highlightedIndex]
          if (scenario.premium) {
            onPremiumClick()
          } else {
            onSelectScenario(scenario.id)
          }
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  const handleSelect = (scenario: typeof scenarios[0]) => {
    if (scenario.premium) {
      onPremiumClick()
    } else {
      onSelectScenario(scenario.id)
    }
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setIsOpen(true)
            setHighlightedIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-14 pl-12 bg-card text-foreground placeholder:text-muted-foreground text-lg shadow-lg border-2 border-border focus:border-primary"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('suggestions')}
            </p>
            <div className="max-h-80 overflow-y-auto">
              {filteredScenarios.map((scenario, index) => (
                <button
                  key={scenario.id}
                  onClick={() => handleSelect(scenario)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${highlightedIndex === index
                      ? 'bg-primary/10'
                      : 'hover:bg-secondary/50'
                    }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${scenario.premium ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                    }`}>
                    <scenario.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {t(scenario.titleKey)}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {t(scenario.descriptionKey)}
                    </p>
                  </div>
                  {scenario.premium && (
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                      {t('premium')}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {filteredScenarios.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                {t('noResults')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
