'use client'

import { useState } from 'react'
import { Calendar, Zap } from 'lucide-react'
import ActivityView from '@/components/ActivityView'
import CoursePlanView from '@/components/CoursePlanView'

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState('courses')

  return (
    <div className="min-h-screen bg-black pb-24">
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-gray-100">Studio & Kurse</h1>
          <Calendar className="h-6 w-6 text-gray-400" />
        </div>
        
        {/* Sub-Navigation Tabs */}
        <div className="px-4">
          <div className="flex space-x-2 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'courses'
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Kursplan
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === 'activities'
                  ? 'border-b-2 border-emerald-400 text-emerald-400'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Zap className="h-4 w-4 mr-2" />
              Aktivitäten
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Content */}
      <div className="mt-4">
        {activeTab === 'courses' && <CoursePlanView />}
        {activeTab === 'activities' && <ActivityView />}
      </div>
    </div>
  )
}
