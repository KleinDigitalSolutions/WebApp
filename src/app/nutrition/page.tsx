'use client'

import { useState } from 'react'
import { BookOpen, LayoutGrid, Book, Sparkles } from 'lucide-react'
import NutritionOverview from '@/components/NutritionOverview'
import DiaryView from '@/components/DiaryView'
import AiCoachView from '@/components/AiCoachView'

export default function NutritionPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-100">Ernährung</h1>
          <BookOpen className="h-6 w-6 text-gray-400" />
        </div>
        
        {/* Sub-Navigation Tabs */}
        <div className="px-4">
          <div className="flex space-x-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('diary')}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'diary'
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Book className="h-4 w-4 mr-2" />
              Tagebuch
            </button>
            <button
              onClick={() => setActiveTab('ai-coach')}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'ai-coach'
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              KI-Coach
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Content */}
      <div className="mt-4">
        {activeTab === 'overview' && <NutritionOverview />}
        {activeTab === 'diary' && <DiaryView />}
        {activeTab === 'ai-coach' && <AiCoachView />}
      </div>
    </div>
  )
}
