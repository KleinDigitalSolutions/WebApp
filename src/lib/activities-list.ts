// Zentrale Aktivitätenliste für TrackFood (aus ActivitiesCard extrahiert)
export interface Activity {
  id: string;
  name: string;
  emoji: string;
  met: number;
}

const activitiesList: Activity[] = [
  { id: 'aerobic', name: 'Aerobic Dancing', emoji: '💃', met: 7 },
  { id: 'aikido', name: 'Aikido', emoji: '🥋', met: 5 },
  { id: 'angeln', name: 'Angeln', emoji: '🎣', met: 2.5 },
  { id: 'aquajogging', name: 'Aquajogging', emoji: '🏊‍♂️', met: 7 },
  { id: 'ausfallschritte', name: 'Ausfallschritte', emoji: '💪', met: 5 },
  { id: 'badminton', name: 'Badminton', emoji: '🏸', met: 4.5 },
  { id: 'basketball', name: 'Basketball', emoji: '🏀', met: 6.5 },
  { id: 'basketball_wettkampf', name: 'Basketball, wettkampfmäßig', emoji: '🏀', met: 8.3 },
  { id: 'beinpresse', name: 'Beinpresse', emoji: '💪', met: 5 },
  { id: 'bergsteigen', name: 'Bergsteigen', emoji: '🧗‍♂️', met: 8 },
  { id: 'boxen', name: 'Boxen', emoji: '🥊', met: 7.8 },
  { id: 'boxen_wettkampf', name: 'Boxen, wettkampfmäßig', emoji: '🥊', met: 12 },
  { id: 'crosstrainer', name: 'Crosstrainer', emoji: '🏋️‍♂️', met: 5 },
  { id: 'fahrrad', name: 'Fahrradfahren, generell', emoji: '🚴‍♂️', met: 6 },
  { id: 'fussball', name: 'Fußball', emoji: '⚽', met: 7 },
  { id: 'fussball_wettkampf', name: 'Fußball, wettkampfmäßig', emoji: '⚽', met: 10 },
  { id: 'handball', name: 'Handball', emoji: '🤾‍♂️', met: 8 },
  { id: 'handball_wettkampf', name: 'Handball, wettkampfmäßig', emoji: '🤾‍♂️', met: 12 },
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
  { id: 'rudern_wettkampf', name: 'Rudern, wettkampfmäßig', emoji: '🚣‍♂️', met: 12 },
  { id: 'schwimmen', name: 'Schwimmen', emoji: '🏊‍♂️', met: 6 },
  { id: 'schwimmen_kraulen', name: 'Schwimmen, Kraulen', emoji: '🏊‍♂️', met: 9.8 },
  { id: 'skifahren', name: 'Ski fahren', emoji: '⛷️', met: 7 },
  { id: 'skifahren_wettkampf', name: 'Ski fahren, wettkampfmäßig', emoji: '⛷️', met: 10 },
  { id: 'skilanglauf', name: 'Ski Langlauf', emoji: '🎿', met: 7.5 },
  { id: 'spazieren', name: 'Spazieren gehen', emoji: '🚶‍♂️', met: 3 },
  { id: 'springen', name: 'Seilspringen', emoji: '🤾‍♂️', met: 12 },
  { id: 'tanzen', name: 'Tanzen', emoji: '💃', met: 5.5 },
  { id: 'tanzen_salsa', name: 'Tanzen: Salsa', emoji: '💃', met: 7 },
  { id: 'tennis', name: 'Tennis', emoji: '🎾', met: 7.3 },
  { id: 'tischtennis', name: 'Tischtennis', emoji: '🏓', met: 4 },
  { id: 'trampolin', name: 'Trampolin springen', emoji: '🤸‍♂️', met: 3.5 },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐', met: 3.5 },
  { id: 'volleyball_wettkampf', name: 'Volleyball, wettkampfmäßig', emoji: '🏐', met: 8 },
  { id: 'wandern', name: 'Wandern', emoji: '🥾', met: 6 },
  { id: 'yoga', name: 'Yoga', emoji: '🧘‍♂️', met: 3 },
  { id: 'zufussgehen', name: 'Zufußgehen', emoji: '🚶‍♂️', met: 3.5 },
  { id: 'zumba', name: 'Zumba', emoji: '🧘‍♂️', met: 5.5 },
];

export default activitiesList;
