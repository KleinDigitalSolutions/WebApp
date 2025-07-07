'use client';

import { useState } from 'react';
import activitiesList, { Activity } from '@/lib/activities-list';
import { supabase } from '@/lib/supabase';

export default function ActivitiesPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Activity | null>(null);
  const [duration, setDuration] = useState(30);
  const [weight, setWeight] = useState(70);
  const [note, setNote] = useState('');

  const filtered = activitiesList.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  function calcCalories(met: number, weight: number, duration: number) {
    return Math.round(met * weight * (duration / 60));
  }

  async function handleSave() {
    if (!selected) return;
    // Hier ggf. User-ID aus Auth holen, z.B. aus Zustand-Store
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
    if (!user) {
      alert('Nicht eingeloggt!');
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const calories = calcCalories(selected.met, weight, duration);
    const { error } = await supabase.from('user_activities').insert({
      user_id: user.id,
      activity_name: selected.name,
      emoji: selected.emoji,
      duration_min: duration,
      calories,
      activity_date: today,
      note,
    });
    if (error) {
      alert('Fehler beim Speichern: ' + error.message);
    } else {
      alert('Aktivität gespeichert!');
      setSelected(null);
      setDuration(30);
      setWeight(70);
      setNote('');
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Aktivität hinzufügen</h2>
      {!selected ? (
        <>
          <input
            className="w-full p-2 mb-4 border rounded"
            placeholder="Aktivität suchen"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filtered.map((a) => (
              <button
                key={a.id}
                className="flex items-center w-full p-3 bg-white rounded shadow hover:bg-emerald-50"
                onClick={() => setSelected(a)}
              >
                <span className="text-2xl mr-3">{a.emoji}</span>
                <span>{a.name}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded shadow p-4">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">{selected.emoji}</span>
            <span className="font-semibold">{selected.name}</span>
          </div>
          <label className="block mt-2 text-sm">Dauer (Minuten):</label>
          <input
            type="number"
            min={1}
            max={300}
            className="w-full p-2 border rounded mb-2"
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
          />
          <label className="block mt-2 text-sm">Körpergewicht (kg):</label>
          <input
            type="number"
            min={30}
            max={200}
            className="w-full p-2 border rounded mb-2"
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
          />
          <label className="block mt-2 text-sm">Notiz (optional):</label>
          <input
            className="w-full p-2 border rounded mb-2"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <div className="mb-2 text-emerald-700 font-medium">
            Geschätzter Kalorienverbrauch: {calcCalories(selected.met, weight, duration)} kcal
          </div>
          <div className="flex gap-2 mt-4">
            <button
              className="flex-1 bg-emerald-600 text-white p-2 rounded font-semibold"
              onClick={handleSave}
            >Speichern</button>
            <button
              className="flex-1 bg-gray-200 p-2 rounded"
              onClick={() => setSelected(null)}
            >Zurück</button>
          </div>
        </div>
      )}
    </div>
  );
}
