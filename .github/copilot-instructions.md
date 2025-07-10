Anleitung für Copilot/Agent in TrackFood Projekt

(cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF'
diff --git a/TrackFood_UI_Research_Anweisungen.md b/TrackFood_UI_Research_Anweisungen.md
--- a/TrackFood_UI_Research_Anweisungen.md
+++ b/TrackFood_UI_Research_Anweisungen.md
@@ -0,0 +1,408 @@
+# TrackFood UI/UX Modernisierung: Research & Anweisungen
+
+## 📊 Aktuelle Situation der TrackFood App
+
+### ✅ Stärken
+- **Technologie-Stack**: Next.js + Capacitor (hybride App) ✓
+- **KI-Integration**: Gemini AI bereits implementiert ✓
+- **Core-Features**: Barcode-Scanner, Food-Tracking, Dashboard ✓
+- **Komponenten-Architektur**: Gute Struktur mit separaten UI-Komponenten ✓
+- **Animationen**: Framer Motion integriert ✓
+
+### ⚠️ Verbesserungsbedarf für "App-like" Feel
+1. **Farbschema**: Aktuelle grün-blaue Palette zu "web-lastig"
+2. **UI-Patterns**: Standard Web-UI, nicht native App-Patterns
+3. **Micro-Interactions**: Begrenzte interaktive Elemente
+4. **Design-System**: Fehlt modernes, natives App-Design-System
+5. **Personalisierung**: Begrenzte AI-gestützte Personalisierung
+
+---
+
+## 🎨 Research: Moderne Nutrition App UI-Trends 2024
+
+### Top-Apps Analyse: Yazio & Lifesum
+
+#### **Yazio Design-Prinzipien:**
+- **Clean Minimalism**: Wenig visuelle Ablenkung, Focus auf Content
+- **Personalisierte Dashboards**: KI-gestützte Empfehlungen im Vordergrund
+- **Gamification**: Subtle Belohnungen ohne Overload
+- **Barcode-Integration**: Nahtlos in den Flow integriert
+- **Progress Visualization**: Circular progress rings, achievement badges
+
+#### **Lifesum Design-Prinzipien:**
+- **Multimodal Tracking**: Photo, Voice, Text, Barcode in einem Interface
+- **AI-First Approach**: Intelligente Vorschläge basierend auf Patterns
+- **Holistic Wellness**: Integration von Sleep, Mood, Activity
+- **Social Integration**: Community Features ohne Fokus-Verlust
+- **Premium Feel**: Hochwertige Animationen und Transitions
+
+### **2024 Native App Design Trends:**
+
+#### **1. Farbpsychologie & Paletten**
+- **Primärfarben**: Warme, energetische Töne (Orange #FF6B35, Coral #FF9F79)
+- **Sekundärfarben**: Beruhigende Grüntöne (Emerald #10B981, Sage #9CA3AF)
+- **Akzentfarben**: Purple für Premium-Features (#8B5CF6)
+- **Neutrale**: Warme Graus statt kalte (#F8FAFC, #1E293B)
+
+#### **2. Glassmorphism & Depth**
+- Frosted Glass Effekte für Overlays
+- Subtle Drop Shadows und Blur Effects
+- Layered UI mit depth perception
+
+#### **3. Micro-Interactions & Haptics**
+- Completion animations (confetti, pulse effects)
+- Haptic feedback bei wichtigen Actions
+- Loading states mit personality
+- Smooth transitions zwischen States
+
+#### **4. Native App Patterns**
+- Tab Bars mit custom icons
+- Sheet presentations für Modals
+- Pull-to-refresh mit custom animations
+- Context menus und long-press interactions
+
+---
+
+## 🚀 Konkrete Modernisierungs-Anweisungen
+
+### **Phase 1: Design System Overhaul (Priorität: HOCH)**
+
+#### **1.1 Neue Farbpalette implementieren**
+```css
+/* Ersetze in tailwind.config.js */
+colors: {
+  // Primary Brand Colors
+  primary: {
+    50: '#FFF7ED',
+    100: '#FFEDD5', 
+    500: '#FF6B35',  // Main brand color
+    600: '#EA580C',
+    700: '#C2410C',
+    900: '#9A3412'
+  },
+  
+  // Success & Health Colors  
+  success: {
+    50: '#ECFDF5',
+    100: '#D1FAE5',
+    500: '#10B981',
+    600: '#059669',
+    700: '#047857'
+  },
+  
+  // Premium Purple
+  premium: {
+    500: '#8B5CF6',
+    600: '#7C3AED',
+    700: '#6D28D9'
+  },
+  
+  // Warm Neutrals
+  neutral: {
+    50: '#FAFAFA',
+    100: '#F5F5F5', 
+    200: '#E5E5E5',
+    300: '#D4D4D4',
+    400: '#A3A3A3',
+    500: '#737373',
+    600: '#525252',
+    700: '#404040',
+    800: '#262626',
+    900: '#171717'
+  }
+}
+```
+
+#### **1.2 Native App UI-Komponenten entwickeln**
+
+**Button-System:**
+```typescript
+// Ersetze Button-Komponente mit native feel
+const NativeButton = {
+  primary: 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg active:scale-95',
+  secondary: 'bg-white border border-neutral-200 shadow-md active:scale-95',
+  floating: 'rounded-full w-14 h-14 shadow-xl active:scale-90'
+}
+```
+
+**Card-System:**
+```typescript
+// Native Card-Komponenten
+const NativeCard = {
+  elevated: 'bg-white rounded-3xl shadow-xl border border-white/10',
+  glass: 'bg-white/80 backdrop-blur-md rounded-2xl border border-white/20',
+  gradient: 'bg-gradient-to-br from-white via-neutral-50 to-primary-50/30'
+}
+```
+
+#### **1.3 Typography-Upgrade**
+- **Headings**: SF Pro Display / Inter (Apple/Google Style)
+- **Body**: System font stack für native Feel
+- **Sizes**: iOS Human Interface Guidelines folgen
+
+### **Phase 2: Dashboard Modernisierung (Priorität: HOCH)**
+
+#### **2.1 Hero-Section Redesign**
+```jsx
+// Neues Dashboard Hero mit personalisierten Insights
+<DashboardHero>
+  <PersonalizedGreeting />
+  <AIDailyInsight />
+  <QuickActions />
+  <ProgressRings />
+</DashboardHero>
+```
+
+#### **2.2 Progress Visualization Upgrade**
+- **Circular Progress Rings** statt Balken
+- **Animated Counters** für Zahlen
+- **Milestone Celebrations** bei Zielerreichung
+- **Weekly/Monthly Trend Cards**
+
+#### **2.3 Quick Actions Redesign**
+```jsx
+// Native Quick Actions Grid
+<QuickActionsGrid>
+  <FloatingActionButton icon="camera" label="Foto scannen" />
+  <FloatingActionButton icon="barcode" label="Barcode" />
+  <FloatingActionButton icon="mic" label="Sprache" />
+  <FloatingActionButton icon="plus" label="Manuell" />
+</QuickActionsGrid>
+```
+
+### **Phase 3: Onboarding Experience (Priorität: MITTEL)**
+
+#### **3.1 Interactive Onboarding**
+- **Story-driven Approach** statt Formulare
+- **Interactive Slider** für Gewicht/Ziele
+- **Visual Goal Selection** mit Illustrationen
+- **AI Voice Introduction** für persönlichen Touch
+
+#### **3.2 Gamification Elements**
+```jsx
+// Onboarding Gamification
+<OnboardingSteps>
+  <ProgressIndicator animated />
+  <AchievementUnlock when="completed" />
+  <PersonalityQuiz for="meal_preferences" />
+  <VirtualCoach introduction />
+</OnboardingSteps>
+```
+
+### **Phase 4: Food Tracking Revolution (Priorität: HOCH)**
+
+#### **4.1 Multimodal Input Interface**
+```jsx
+// Moderne Input-Methoden
+<FoodInputModal>
+  <PhotoCapture ai_recognition />
+  <VoiceInput natural_language />
+  <BarcodeScanner enhanced />
+  <ManualInput smart_suggestions />
+</FoodInputModal>
+```
+
+#### **4.2 AI-Enhanced Tracking**
+- **Smart Portion Recognition** via Kamera
+- **Natural Language Processing** für Voice Input
+- **Predictive Suggestions** basierend auf Tageszeit
+- **Meal Pattern Learning** für Automation
+
+### **Phase 5: Social & Community Features (Priorität: NIEDRIG)**
+
+#### **5.1 Subtle Social Integration**
+- **Achievement Sharing** (optional)
+- **Anonymous Community Challenges**
+- **Expert Nutrition Tips** feed
+- **Success Story Highlights**
+
+---
+
+## 🛠️ Technische Implementierung
+
+### **Priority Queue:**
+
+#### **Woche 1-2: Design System Foundation**
+1. Neue Farbpalette in Tailwind Config
+2. Native Button & Card Komponenten
+3. Typography & Spacing System
+4. Icon Library Upgrade (Lucide → Phosphor/SF Symbols)
+
+#### **Woche 3-4: Dashboard Modernisierung**
+1. Hero Section Redesign
+2. Progress Rings Implementation  
+3. Quick Actions Floating Buttons
+4. Micro-Interactions hinzufügen
+
+#### **Woche 5-6: Input Flow Upgrade**
+1. Multimodal Food Input Interface
+2. Enhanced Camera Integration
+3. Voice Input (Web Speech API)
+4. Smart Suggestions System
+
+#### **Woche 7-8: Polish & Details**
+1. Onboarding Flow Redesign
+2. Loading States & Animations
+3. Haptic Feedback (Capacitor)
+4. Dark Mode Optimization
+
+### **Code-Beispiele für sofortige Umsetzung:**
+
+#### **1. Neue Button-Komponente:**
+```tsx
+// components/ui/NativeButton.tsx
+export const NativeButton = ({ variant = 'primary', size = 'md', children, ...props }) => {
+  const baseClasses = 'font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50'
+  
+  const variants = {
+    primary: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl',
+    floating: 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full w-16 h-16 shadow-2xl hover:shadow-xl',
+    glass: 'bg-white/80 backdrop-blur-md border border-white/20 text-neutral-700 shadow-lg'
+  }
+  
+  return (
+    <button className={cn(baseClasses, variants[variant])} {...props}>
+      {children}
+    </button>
+  )
+}
+```
+
+#### **2. Progress Ring Komponente:**
+```tsx
+// components/ui/ProgressRing.tsx
+export const ProgressRing = ({ progress, size = 120, strokeWidth = 8, children }) => {
+  const normalizedRadius = (size - strokeWidth) / 2
+  const circumference = normalizedRadius * 2 * Math.PI
+  const strokeDashoffset = circumference - (progress / 100) * circumference
+  
+  return (
+    <div className="relative inline-flex items-center justify-center">
+      <svg height={size} width={size} className="transform -rotate-90">
+        <circle
+          cx={size / 2}
+          cy={size / 2}
+          r={normalizedRadius}
+          stroke="currentColor"
+          strokeWidth={strokeWidth}
+          fill="transparent"
+          className="text-neutral-200"
+        />
+        <circle
+          cx={size / 2}
+          cy={size / 2}
+          r={normalizedRadius}
+          stroke="url(#gradient)"
+          strokeWidth={strokeWidth}
+          fill="transparent"
+          strokeDasharray={circumference}
+          strokeDashoffset={strokeDashoffset}
+          strokeLinecap="round"
+          className="transition-all duration-1000 ease-out"
+        />
+        <defs>
+          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
+            <stop offset="0%" stopColor="#FF6B35" />
+            <stop offset="100%" stopColor="#10B981" />
+          </linearGradient>
+        </defs>
+      </svg>
+      <div className="absolute inset-0 flex items-center justify-center">
+        {children}
+      </div>
+    </div>
+  )
+}
+```
+
+---
+
+## 📱 Native App Optimierungen
+
+### **Capacitor-spezifische Verbesserungen:**
+
+#### **1. Haptic Feedback Integration**
+```typescript
+// utils/haptics.ts
+import { Haptics, ImpactStyle } from '@capacitor/haptics'
+
+export const hapticFeedback = {
+  light: () => Haptics.impact({ style: ImpactStyle.Light }),
+  medium: () => Haptics.impact({ style: ImpactStyle.Medium }),
+  heavy: () => Haptics.impact({ style: ImpactStyle.Heavy }),
+  success: () => Haptics.notification({ type: NotificationType.Success })
+}
+```
+
+#### **2. Native Status Bar**
+```typescript
+// App Layout mit nativer Status Bar
+import { StatusBar, Style } from '@capacitor/status-bar'
+
+const setStatusBarStyle = async () => {
+  await StatusBar.setStyle({ style: Style.Light })
+  await StatusBar.setBackgroundColor({ color: '#FF6B35' })
+}
+```
+
+#### **3. Safe Area Handling**
+```css
+/* globals.css - Native safe areas */
+.safe-top {
+  padding-top: env(safe-area-inset-top);
+}
+
+.safe-bottom {
+  padding-bottom: env(safe-area-inset-bottom);
+}
+```
+
+---
+
+## 🎯 KPIs für Erfolg-Messung
+
+### **Engagement-Metriken:**
+- Session Duration: +40% Ziel
+- Daily Active Users: +60% Ziel  
+- Feature Adoption Rate: +50% Ziel
+- Onboarding Completion: +35% Ziel
+
+### **User Experience Metriken:**
+- App Store Rating: 4.5+ Ziel
+- User Retention (30 Tage): +45% Ziel
+- Time to First Value: <60 Sekunden
+- Task Completion Rate: 95%+ Ziel
+
+---
+
+## 🚀 Sofort umsetzbare Quick Wins
+
+### **Diese Woche:**
+1. **Farbpalette updaten** (2 Stunden)
+2. **Button-Komponenten überarbeiten** (4 Stunden)
+3. **Dashboard Hero-Section** modernisieren (6 Stunden)
+4. **Loading States** verbessern (2 Stunden)
+
+### **Nächste Woche:**
+1. **Progress Rings** implementieren (8 Stunden)
+2. **Quick Actions** als Floating Buttons (6 Stunden)
+3. **Micro-Interactions** hinzufügen (4 Stunden)
+4. **Haptic Feedback** integrieren (3 Stunden)
+
+---
+
+## 💡 Fazit & Empfehlung
+
+**TrackFood hat eine solide technische Basis, braucht aber ein natives App-Design-System für den "echten App-Charakter".**
+
+**Top-Prioritäten:**
+1. **Design System Overhaul** mit nativen Komponenten
+2. **Dashboard Modernisierung** mit AI-Insights
+3. **Multimodal Input Interface** für bessere UX
+4. **Micro-Interactions** für Engagement
+
+**Das Ziel:** Von einer "Web-App in App-Hülle" zu einer "nativen App-Erfahrung" mit modernem UI/UX, die mit Top-Apps wie Yazio und Lifesum konkurrieren kann.
+
+**Budget-Schätzung:** 40-60 Entwicklerstunden für vollständige Modernisierung
+**Timeline:** 6-8 Wochen für komplette Transformation
+**ROI:** Erwartete 50%+ Steigerung in User Engagement und Retention
EOF
)



# Copilot/Agent Notizen: Next.js Static Export für Native App

10.07.2025

- Für den Static Export (output: 'export') wurden alle API-Routen aus `src/app/api` nach `src/app/_api_backup/api` verschoben.
- Die Auth-Callback-Route (`src/app/auth/callback`) wurde nach `src/app/_api_backup/auth_callback` verschoben.
- Die dynamische Route `/recipes/[id]` wurde nach `src/app/_api_backup/recipes_id` verschoben.
- Die Next.js-Konfiguration (`next.config.ts`) enthält jetzt nur noch statische Einstellungen (keine PWA-Plugins, keine Serverfunktionen).
- Ziel: Die App kann jetzt als reines statisches Frontend (z. B. für Capacitor, PWA oder statisches Hosting) gebaut werden.
- Für native Features oder API-Calls muss das Frontend über HTTP mit einem externen Backend (z. B. Supabase, eigene API) kommunizieren.

**WICHTIG:**
- Für Static Export dürfen keine API-Routen, SSR- oder dynamische Serverfunktionen im Projekt sein.
- Alle ausgelagerten Routen sind im Backup-Ordner und können für SSR/Serverless-Deployments wiederhergestellt werden.
- Der User hat keinerlei Coding Erfahrung, Agent muss alles übernehmen!


# Farben

**WICHTIG:** Für halbtransparente Custom Colors (z.B. brand1–brand10) IMMER inline style mit rgba verwenden, NICHT Tailwind-Opacity-Utilities oder bg-brandX/80! Beispiel:

```tsx
<div style={{ backgroundColor: 'rgba(181, 228, 140, 0.85)' }}>...</div>
```

Das gilt besonders für die Key Features Karten und alle Flächen, die Transparenz benötigen. Tailwind generiert KEINE Opacity-Utilities für Custom Colors. 

**Gradients:** Für garantierte Farbdarstellung bei Gradients (z.B. swipebare Feature-Karten) immer echtes CSS linear-gradient mit den brand-Farben als style verwenden, z.B.:

```tsx
style={{ background: 'linear-gradient(135deg, #34A0A4 0%, #76C893 100%)' }}
```

**Buttons:** Wenn ein Button auf farbigem Hintergrund steht, sollte er weiß (#fff) als Hintergrund und brand6 (#34A0A4) als Textfarbe bekommen, damit er sich klar abhebt.

---

# TrackFood - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
TrackFood ist eine intelligente Ernährungs-Tracking-Web-App mit **personalisierten KI-Empfehlungen** und **vollständigem Barcode-Scanner**, gebaut mit Next.js App Router, TypeScript, Tailwind CSS, Zustand for State Management, und Supabase als Backend-as-a-Service.

## 🔥 **NEUE FEATURES (implementiert)**
- **📊 7-Tage Ernährungsanalyse:** Automatische Auswertung der Tagebuchdaten
- **🧠 Intelligente Problembewertung:** Erkennt ungesunde Muster (z.B. zu viel Cola)
- **💡 Personalisierte Empfehlungen:** Konkrete, umsetzbare Verbesserungsvorschläge
- **📈 Erweiterte Nährstoff-Tracking:** Zucker, Ballaststoffe, Natrium
- **🎯 Zielspezifische Beratung:** Angepasst an Abnehmen, Zunehmen, Muskelaufbau
- **📱 Barcode-Scanner:** Vollständig integriert mit Quagga2, mobile- und Safari/iOS-optimiert
- **🏪 Deutsche Produktdatenbank:** 2500+ Produkte aus OpenFoodFacts, alle großen Marken

## Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: **Groq AI (LLaMA 3.1)**, OpenFoodFacts, TheMealDB
- **Barcode**: Quagga2 (mobile- und Safari-kompatibel)
- **Styling**: Tailwind CSS with mobile-first approach
- **PWA**: Progressive Web App capabilities

## 📱 Barcode-Scanner Implementation

### Core Components
- **`/src/components/BarcodeScanner.tsx`**: Hauptkomponente mit Quagga2-Integration
- **`/src/app/api/food/barcode/route.ts`**: API-Route für Barcode-Lookup
- **`/src/lib/openfoodfacts-api.ts`**: OpenFoodFacts-API-Wrapper
- **`/src/lib/german-product-database.ts`**: Lokale Produktdatenbank-Utils

### Scanner Features
```typescript
// Mobile- und Safari/iOS-optimiert
// Automatisches Fallback für Kamera-Probleme
// Benutzerfreundliche Fehlerbehandlung
// PWA-kompatibel (getUserMedia)
// Unterstützt EAN-13, EAN-8, Code-128, Code-39
```

### Barcode Lookup Strategy
1. **Lokale Supabase-Datenbank** (schnellstes Ergebnis)
2. **OpenFoodFacts-API** (falls nicht lokal vorhanden)
3. **Automatischer Import** neuer Produkte in lokale DB

### Database Schema (Barcode Support)
```sql
-- Erweiterte products-Tabelle:
ALTER TABLE products ADD COLUMN barcode VARCHAR(20);
ALTER TABLE products ADD COLUMN brand VARCHAR(100);
ALTER TABLE products ADD COLUMN image_url TEXT;
ALTER TABLE products ADD COLUMN source VARCHAR(20) DEFAULT 'manual';
CREATE INDEX idx_products_barcode ON products(barcode);

-- Erweiterte Nährstoff-Spalten in diary_entries:
ALTER TABLE diary_entries ADD COLUMN sugar_g NUMERIC DEFAULT 0;
ALTER TABLE diary_entries ADD COLUMN fiber_g NUMERIC DEFAULT 0; 
ALTER TABLE diary_entries ADD COLUMN sodium_mg NUMERIC DEFAULT 0;
```

## 🏪 Deutsche Produktdatenbank

### Import-Strategie
- **Bulk-Import**: 800+ Basis-Produkte aus OpenFoodFacts
- **Enhanced Import**: Gezielte Marken-Importe mit Duplikat-Prüfung
- **Automatischer Import**: Neue Produkte beim ersten Barcode-Scan

### Abgedeckte Marken (2500+ Produkte)
```typescript
const majorGermanBrands = [
  'Ferrero', 'Milka', 'Haribo', 'Ritter Sport', 'Kinder',
  'ja!', 'EDEKA', 'REWE', 'ALDI', 'Lidl', 'K-Classic',
  'Coca-Cola', 'Nutella', 'Yogurette', 'Hanuta', 'Duplo',
  'Dr. Oetker', 'Knorr', 'Maggi', 'Barilla', 'Müller',
  // ... und viele weitere
];
```

### Import-Tools
- **`/src/lib/openfoodfacts-bulk-importer.ts`**: Basis-Import
- **`/src/lib/enhanced-openfoodfacts-importer.ts`**: Marken-spezifischer Import
- **`/test-enhanced-import.js`**: Test-Script für neue Importe
- **`/analyze-brands.js`**: Marken-Analyse für Lücken-Identifikation

## 🧠 KI-Chat Implementation Details

### API Structure (`/src/app/api/chat/route.ts`)
```typescript
// Lädt 7-Tage Tagebuchdaten aus Supabase
// Analysiert Nährstoffe: Kalorien, Protein, Kohlenhydrate, Fett, Zucker, Ballaststoffe, Natrium
// Erkennt Muster: häufige Lebensmittel, ungesunde Gewohnheiten
// Übergibt strukturierten Kontext an Groq AI
```

### Groq AI Integration (`/src/lib/groq-api.ts`)
```typescript
// Model: 'llama-3.1-8b-instant'
// Spezialisierter Ernährungsexperten-Prompt
// Strukturierte Antworten mit Emojis
// Personalisierte Empfehlungen basierend auf Tagebuchdaten
```

### Chat Frontend (`/src/app/chat/page.tsx`)
```typescript
// User-ID wird an Chat-API übertragen
// Quick-Action Buttons für typische Fragen
// Welcome-Message mit Feature-Erklärung
// Responsive Design mit Tailwind
```

## 💻 Development Guidelines

### Barcode-Scanner Entwicklung
- **Quagga2 verwenden** für zuverlässige Barcode-Erkennung
- **Mobile-first Optimierung** (besonders iOS/Safari)
- **Fehlerbehandlung** für Kamera-Zugriff implementieren
- **PWA-Kompatibilität** sicherstellen
- **Deutsche Produktdatenbank** kontinuierlich erweitern

### Produktdatenbank-Management
- **OpenFoodFacts-API** als primäre Quelle nutzen
- **Duplikat-Prüfung** bei Importen durchführen
- **Marken-spezifische Importe** für bessere Abdeckung
- **Automatischer Import** bei neuen Barcode-Scans
- **Test-Scripts** für Validierung verwenden

### KI-Chat Entwicklung
- **Groq API verwenden** statt Grok AI (LLaMA 3.1 Model)
- **Deutsche Prompts** für bessere Antworten
- **Strukturierte Datenanalyse** der letzten 7 Tage
- **Automatische Problembewertung** implementieren
- **Quick-Actions** für häufige Fragen bereitstellen

### Ernährungsdaten-Analyse
- **Makronährstoffe bewerten:** Protein 15-25%, Kohlenhydrate 45-65%, Fett 20-35%
- **Mikronährstoffe tracken:** Ballaststoffe (25-30g/Tag), Zucker, Natrium
- **Muster erkennen:** Cola/Softdrinks, Fast Food, Süßwaren
- **Personalisierte Empfehlungen:** Basierend auf Nutzerzielen

### UI/UX Best Practices  
- **Mobile-first Design** mit Tailwind CSS
- **Emojis und Struktur** in KI-Antworten
- **Quick-Action Buttons** für sofortige Analyse
- **Loading States** für KI-Antworten
- **Responsive Chat-Interface**
- **Kompakte Tagebuch-Darstellung** mit neuen Icons

## Architecture Principles
- Mobile-first design with "app-like" feel
- Server-side rendering (SSR) for dynamic content
- Static generation (SSG) for static content
- Incremental Static Regeneration (ISR) for semi-static content
- Row Level Security (RLS) in Supabase for data protection
- **KI-gestützte personalisierte Ernährungsberatung**
- **Offline-fähiger Barcode-Scanner** (PWA)

## Code Standards
- Use TypeScript for all code
- Implement proper error handling
- Follow Next.js App Router patterns
- Use Tailwind CSS utility classes
- Implement responsive design with Tailwind breakpoints
- Add loading states and smooth animations
- Ensure API keys are properly secured server-side
- **Deutsche Sprache für KI-Antworten und UI**
- **Mobile-optimierte Barcode-Scanner**

## Database Schema
- `profiles`: User profile data extending auth.users
- `diary_entries`: **Erweiterte** Daily nutrition entries (mit sugar_g, fiber_g, sodium_mg)
- `products`: **Erweiterte** Product database (mit barcode, brand, image_url, source)
- `recipes`: User recipes and saved recipes
- `weight_history`: Weight tracking (future phase)
- `knowledge_articles`: Blog content (future phase)

## Security Guidelines
- Always use RLS policies in Supabase
- Keep API keys server-side only (besonders GROQ_API_KEY)
- Validate all user inputs
- Implement proper authentication flows
- **Service Role Key** für Chat-API Zugriff auf Tagebuchdaten
- **OpenFoodFacts-API** öffentlich, keine Keys erforderlich

## 🚀 Future Enhancements

### Produktdatenbank-Erweiterung
- **Kontinuierliche Marken-Ergänzung** basierend auf User-Feedback
- **Regionale Produkte** (Bio-Läden, lokale Marken)
- **Nährwert-Verbesserungen** (vollständigere Mikronährstoffe)

### Barcode-Scanner Optimierung
- **Scan-Geschwindigkeit** weiter verbessern
- **Offline-Modus** für häufig gescannte Produkte
- **Batch-Scanning** für Einkaufslisten

### Dokumentation
- **Import-Logs** für nachvollziehbare Datenbank-Änderungen
- **API-Performance-Monitoring** für OpenFoodFacts-Aufrufe
- **User-Analytics** für Scanner-Nutzung und beliebte Produkte

## 🚀 Geplante Features & TODOs (inspiriert von Yazio, Lifesum, MyFitnessPal, Cronometer, FDDB, Foodvisor)

### 1. Foto-Tracking & KI-Bilderkennung
- Nutzer können Mahlzeiten fotografieren, KI erkennt Lebensmittel & schätzt Nährwerte
- Umsetzung: KI-API anbinden, Frontend-Upload, Bildanalyse
- TODO: KI-API auswählen, Frontend-Flow bauen, Backend-Integration

### 2. Intelligente Rezeptvorschläge
- KI schlägt Rezepte vor, passend zu Zielen, Unverträglichkeiten, bisherigen Einträgen
- Resteverwertung: Rezepte auf Basis vorhandener Zutaten
- TODO: Rezeptdatenbank erweitern, KI-Logik anpassen, UI für Vorschläge

### 4. Fortschritts- & Motivations-Features
- Visualisierung von Trends (Makroverteilung, Mikronährstoff-Deckung, Gewicht)
- Life Score / Ernährungs-Score als tägliche/wöchentliche Bewertung
- Erfolge/Badges für gesunde Gewohnheiten (Gamification)
- TODO: Score-Logik, Badges, neue Diagramme im Dashboard

### 5. Community & Social
- Rezepte, Mahlzeiten oder Tagebucheinträge mit Freunden teilen
- Öffentliche Challenges, Ranglisten, Erfahrungsberichte
- Fragen & Antworten Bereich (wie FDDB)
- TODO: Sharing-Mechanismus, Challenge-Logik, Community-Bereich

### 7. Integration & Export
- Datenexport als PDF/CSV für Arzt/Ernährungsberatung
- Integration mit Google Fit (Web möglich), Apple Health/Samsung Health nur mit nativer App (Web: nur Export/Import)
- TODO: Export-Feature bauen, ggf. OAuth/Import-Flow für Google Fit

### 8. Wissensbereich & Tipps
- Tägliche Ernährungs-Tipps, Mythen-Check, Blog-Artikel
- Lexikon für Nährstoffe, Lebensmittelgruppen, Allergene
- TODO: Content-DB, UI für Tipps/Lexikon, KI-Integration für Tipps

### 9. Premium-Features (Monetarisierung)
- Erweiterte Analysen, individuelle Ernährungspläne, Rezeptdatenbank, Experten-Chat
- TODO: Feature-Flag, Paywall, Stripe-Integration prüfen

# Hinweis: Schrittzähler & Wearable-Sync nur eingeschränkt als Web-App möglich (Apple/Samsung kostenpflichtig, Google Fit Web-API möglich)

# Supabase Tabellenstruktur (automatisch generiert)

```
[
  { "table_name": "diary_entries", "column_name": "id", "data_type": "uuid" },
  { "table_name": "diary_entries", "column_name": "user_id", "data_type": "uuid" },
  { "table_name": "diary_entries", "column_name": "food_name", "data_type": "text" },
  { "table_name": "diary_entries", "column_name": "quantity", "data_type": "numeric" },
  { "table_name": "diary_entries", "column_name": "unit", "data_type": "text" },
  { "table_name": "diary_entries", "column_name": "meal_type", "data_type": "text" },
  { "table_name": "diary_entries", "column_name": "calories", "data_type": "numeric" },
  { "table_name": "diary_entries", "column_name": "protein_g", "data_type": "numeric" },
  { "table_name": "diary_entries", "column_name": "carb_g", "data_type": "numeric" },
  { "table_name": "diary_entries", "column_name": "fat_g", "data_type": "numeric" },
  { "table_name": "diary_entries", "column_name": "fiber_g", "data_type": "numeric" },
  { "table_name": "diary_entries", "column_name": "sugar_g", "data_type": "numeric" },
  { "table_name": "diary_entries", "column_name": "sodium_mg", "data_type": "numeric" },
  { "table_name": "diary_entries", "column_name": "entry_date", "data_type": "date" },
  { "table_name": "diary_entries", "column_name": "created_at", "data_type": "timestamp with time zone" },
  { "table_name": "diary_entries", "column_name": "product_code", "data_type": "text" },
  ... (weitere Tabellen und Felder, siehe vollständige JSON oben) ...
]
```

# Hinweis: Die vollständige Tabellenstruktur ist im JSON-Format dokumentiert. Für Queries, Migrationen und Copilot-Features kann direkt darauf Bezug genommen werden.
