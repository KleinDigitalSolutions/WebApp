-- Migration: Füge ein Feld 'tags' (Text-Array) zur Tabelle 'recipes' hinzu
ALTER TABLE recipes ADD COLUMN tags TEXT[];
-- Optional: Index für schnellere Suche
CREATE INDEX idx_recipes_tags ON recipes USING GIN (tags);
