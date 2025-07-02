-- Supabase: Übersicht aller Tabellen und Spalten für TrackFood
-- Dieses Skript listet alle Tabellen und deren Spalten im aktuellen Schema auf

SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Optional: Nur Tabellennamen
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
