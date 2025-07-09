// src/components/ActivitiesCard.tsx
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store'

export interface Activity {
  id: string
  name: string
  emoji: string
  met: number
}

// alphabetisch sortiert nach name
const activitiesList: Activity[] = [
  { id: 'aerobic', name: 'Aerobic Dancing', emoji: '💃', met: 7 },
  { id: 'aikido', name: 'Aikido', emoji: '🥋', met: 5 },
  { id: 'angeln', name: 'Angeln', emoji: '🎣', met: 2.5 },
  { id: 'aquajogging', name: 'Aquajogging', emoji: '🏊‍♂️', met: 7 },
  { id: 'ausfallschritte', name: 'Ausfallschritte', emoji: '💪', met: 5 },
  { id: 'badminton', name: 'Badminton', emoji: '🏸', met: 4.5 },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', met: 6.5 },
  { id: 'basketball_wettkampf', name: 'Basketball, Wettkampf', emoji: '🏀', met: 8.3 },
  { id: 'beinpresse', name: 'Beinpresse', emoji: '💪', met: 5 },
  { id: 'bergsteigen', name: 'Bergsteigen', emoji: '🧗‍♂️', met: 8 },
  { id: 'boxen', name: 'Boxen', emoji: '🥊', met: 7.8 },
  { id: 'boxen_wettkampf', name: 'Boxen, Wettkampf', emoji: '🥊', met: 12 },
  { id: 'crosstrainer', name: 'Crosstrainer', emoji: '🏋️‍♂️', met: 5 },
  { id: 'fahrrad', name: 'Fahrradfahren, generell', emoji: '🚴‍♂️', met: 6 },
  { id: 'fussball', name: 'Fußball', emoji: '⚽', met: 7 },
  { id: 'fussball_wettkampf', name: 'Fußball, Wettkampf', emoji: '⚽', met: 10 },
  { id: 'handball', name: 'Handball', emoji: '🤾‍♂️', met: 8 },
  { id: 'handball_wettkampf', name: 'Handball, Wettkampf', emoji: '🤾‍♂️', met: 12 },
  { id: 'hiit', name: 'HIIT', emoji: '🔥', met: 8 },
  { id: 'joggen', name: 'Joggen, Laufen', emoji: '🏃‍♂️', met: 8 },
  { id: 'klettern', name: 'Klettern', emoji: '🧗‍♂️', met: 8 },
  { id: 'krafttraining', name: 'Krafttraining, Fitnessstudio', emoji: '💪', met: 6 },
  { id: 'laufen', name: 'Laufen (schnell)', emoji: '🏃‍♂️', met: 10 },
  { id: 'mountainbike', name: 'Mountainbiken', emoji: '🚵‍♂️', met: 8.5 },
  { id: 'nordicwalking', name: 'Nordic Walking', emoji: '🚶‍♀️', met: 4.5 },
  { id: 'pilates', name: 'Pilates', emoji: '🧘‍♀️', met: 3 },
  { id: 'reiten', name: 'Reiten', emoji: '🏇', met: 5.5 },
  { id: 'rudern', name: 'Rudern', emoji: '🚣‍♂️', met: 7 },
  { id: 'rudern_wettkampf', name: 'Rudern, Wettkampf', emoji: '🚣‍♂️', met: 12 },
  { id: 'schwimmen', name: 'Schwimmen', emoji: '🏊‍♂️', met: 6 },
  { id: 'schwimmen_kraulen', name: 'Schwimmen, Kraulen', emoji: '🏊‍♂️', met: 9.8 },
  { id: 'skifahren', name: 'Ski fahren', emoji: '⛷️', met: 7 },
  { id: 'skifahren_wettkampf', name: 'Ski fahren, Wettkampf', emoji: '⛷️', met: 10 },
  { id: 'skilanglauf', name: 'Ski Langlauf', emoji: '🎿', met: 7.5 },
  { id: 'spazieren', name: 'Spazieren gehen', emoji: '🚶‍♂️', met: 3 },
  { id: 'springen', name: 'Seilspringen', emoji: '🤾‍♂️', met: 12 },
  { id: 'tanzen', name: 'Tanzen', emoji: '💃', met: 5.5 },
  { id: 'tanzen_salsa', name: 'Tanzen: Salsa', emoji: '💃', met: 7 },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', met: 7.3 },
  { id: 'tischtennis', name: 'Tischtennis', emoji: '🏓', met: 4 },
  { id: 'trampolin', name: 'Trampolin springen', emoji: '🤸‍♂️', met: 3.5 },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐', met: 3.5 },
  { id: 'volleyball_wettkampf', name: 'Volleyball, Wettkampf', emoji: '🏐', met: 8 },
  { id: 'wandern', name: 'Wandern', emoji: '🥾', met: 6 },
  { id: 'yoga', name: 'Yoga', emoji: '🧘‍♂️', met: 3 },
  { id: 'zufussgehen', name: 'Zufußgehen', emoji: '🚶‍♂️', met: 3.5 },
  { id: 'zumba', name: 'Zumba', emoji: '🧘‍♂️', met: 5.5 },
]

export default function ActivitiesCard() {
  const [selected, setSelected] = useState<string | null>(null)
  const [duration, setDuration] = useState<number>(30)
  const [note, setNote] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user, profile } = useAuthStore()

  // Hilfsfunktion zur Kalorienberechnung
  function calcCalories(met: number, weight: number, duration: number) {
    // kcal = MET * Gewicht (kg) * Dauer (h)
    return Math.round(met * weight * (duration / 60))
  }

  async function handleSave() {
    if (!user || !profile || !selected) return
    setSaving(true)
    setSuccess(false)
    const activity = activitiesList.find(a => a.id === selected)
    if (!activity) return
    const weight = profile.weight_kg || 70
    const calories = calcCalories(activity.met, weight, duration)
    const { error } = await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_id: activity.id,
      activity_name: activity.name,
      emoji: activity.emoji,
      met: activity.met,
      duration_min: duration,
      weight_kg: weight,
      calories,
      note: note || null, // explizit null für leere Notiz
      activity_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(), // explizit setzen
    })
    setSaving(false)
    if (!error) {
      setSuccess(true)
      setSelected(null)
      setDuration(30)
      setNote('')
      setTimeout(() => setSuccess(false), 2000)
    } else {
      alert('Fehler beim Speichern! ' + (error?.message || ''))
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 text-gray-800 relative">
      <div className="flex items-center mb-3">
        <span className="text-2xl mr-2">🏃‍♂️</span>
        <h3 className="text-lg font-semibold text-gray-800">Aktivität hinzufügen</h3>
      </div>
      <p className="text-gray-600 text-sm mb-4">Wähle eine Aktivität aus der Liste und füge sie deinem Tagebuch hinzu.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
        {activitiesList.map((activity) => (
          <button
            key={activity.id}
            onClick={() => setSelected(activity.id)}
            className={`flex items-center px-3 py-2 rounded-2xl border shadow-sm transition-all duration-200 focus:outline-none ${selected === activity.id ? 'bg-emerald-500 text-white scale-105' : 'bg-gray-50 border-gray-200 hover:bg-emerald-50 text-gray-800'}`}
          >
            <span className="text-xl mr-2">{activity.emoji}</span>
            <span className="text-sm font-medium text-left">{activity.name}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mt-6 flex flex-col items-center">
          <span className="text-3xl mb-2">{activitiesList.find(a => a.id === selected)?.emoji}</span>
          <div className="text-lg font-semibold mb-1">{activitiesList.find(a => a.id === selected)?.name}</div>
          <div className="text-sm text-gray-600 mb-2">MET: {activitiesList.find(a => a.id === selected)?.met}</div>
          <label className="mt-2 text-sm text-gray-700">Dauer (Minuten):
            <input
              type="number"
              min={5}
              max={300}
              step={5}
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-800 w-20 text-center border border-gray-300"
            />
          </label>
          <label className="mt-2 text-sm text-gray-700">Notiz (optional):
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-800 w-40 border border-gray-300"
              placeholder="z.B. Strecke, Puls..."
            />
          </label>
          <div className="mt-2 text-gray-600 text-sm">Geschätzter Verbrauch: <b>{calcCalories(activitiesList.find(a => a.id === selected)?.met || 1, profile?.weight_kg || 70, duration)}</b> kcal</div>
          <button
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-full font-semibold shadow-lg hover:bg-emerald-700 transition disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Speichern...' : 'Aktivität speichern'}
          </button>
          <button
            className="mt-2 px-4 py-2 bg-gray-400 text-white rounded-full font-semibold shadow-lg hover:bg-gray-500 transition"
            onClick={() => setSelected(null)}
            disabled={saving}
          >
            Abbrechen
          </button>
        </div>
      )}
      {success && (
        <div className="mt-4 text-emerald-600 font-semibold text-center">Aktivität gespeichert! 🎉</div>
      )}
    </div>
  )
}
