'use client'

import { useState } from 'react'
import { Calendar, Clock, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

const demoCourses = [
  {
    id: 1,
    title: 'HIIT Power Session',
    time: '17:30 - 18:15',
    trainer: 'Anna',
    spotsLeft: 3,
    image: '/1.png',
    category: 'Cardio'
  },
  {
    id: 2,
    title: 'Yoga Flow & Relax',
    time: '18:30 - 19:30',
    trainer: 'Markus',
    spotsLeft: 5,
    image: '/2.png',
    category: 'Flexibilität'
  },
  {
    id: 3,
    title: 'Glutes & Legs Strength',
    time: '19:00 - 20:00',
    trainer: 'Rad Lopez',
    spotsLeft: 2,
    image: '/3.png',
    category: 'Kraft'
  },
  {
    id: 4,
    title: 'Spinning Pro',
    time: '20:00 - 21:00',
    trainer: 'Julia',
    spotsLeft: 0,
    image: '/1.png',
    category: 'Cardio'
  },
]

export default function CoursePlanView() {
  const [bookedCourses, setBookedCourses] = useState<Set<number>>(new Set())

  const handleBooking = (courseId: number) => {
    setBookedCourses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
      }
      return newSet
    })
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Heutige Kurse</h2>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Calendar className="h-6 w-6 text-gray-500" />
      </div>

      <div className="space-y-4">
        {demoCourses.map((course, index) => {
          const isBooked = bookedCourses.has(course.id)
          const isFull = course.spotsLeft === 0
          
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-800"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${course.image})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
              
              <div className="relative p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 inline-block mb-2 font-semibold">
                      {course.category}
                    </div>
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{course.time} mit {course.trainer}</span>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    isFull ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                  }`}>
                    {isFull ? 'Ausgebucht' : `${course.spotsLeft} Plätze frei`}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => handleBooking(course.id)}
                    disabled={isFull && !isBooked}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 text-sm
                      ${isBooked 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed'
                      }`}
                  >
                    {isBooked ? 'Buchung stornieren' : 'Kurs buchen'}
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
