"use client"

import React from 'react'
import { useAuthStore } from '@/store'
import CaloriesIntakeDetail from '@/components/CaloriesIntakeDetail'
import CaloriesBurnedDetail from '@/components/CaloriesBurnedDetail'
import FastingDetail from '@/components/FastingDetail'
import ChallengesDetail from '@/components/ChallengesDetail'

export default function MonthlyDetailsPage() {
  const { user } = useAuthStore()
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  if (!user) return <div className="p-8">Bitte einloggen.</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Monatsdetails</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Kalorienaufnahme</h2>
        <CaloriesIntakeDetail userId={user.id} month={month} year={year} />
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Kalorienverbrauch</h2>
        <CaloriesBurnedDetail userId={user.id} month={month} year={year} />
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Fasten</h2>
        <FastingDetail userId={user.id} month={month} year={year} />
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Challenges</h2>
        <ChallengesDetail userId={user.id} month={month} year={year} />
      </section>
    </div>
  )
}
