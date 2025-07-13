# TrackFood Migration: Next.js/React → Flutter

## Projektüberblick
TrackFood ist eine intelligente Ernährungs-Tracking-App mit folgenden Kernfunktionen:

- Dashboard mit Makronährstoffen, Aktivitäten, Mahlzeiten, Fasten, Challenges, Trends
- Barcode-Scanner (OpenFoodFacts, später Fatsecrets, Supabase)
- KI-Chat (Gemini) mit personalisierten Empfehlungen
- Onboarding mit Zielauswahl und Quiz
- Animationen (Framer Motion)

   - SUPABASE_ANON_KEY
## Vollständige Tabellenstruktur (Supabase Export)

```csv
table_name,column_name,data_type
abstinence_challenges,id,uuid
abstinence_challenges,user_id,uuid
abstinence_challenges,challenge_type,text
abstinence_challenges,challenge_name,text
abstinence_challenges,start_date,timestamp with time zone
abstinence_challenges,last_reset_date,timestamp with time zone
abstinence_challenges,current_streak_days,integer
abstinence_challenges,longest_streak_days,integer
abstinence_challenges,total_attempts,integer
abstinence_challenges,is_active,boolean
abstinence_challenges,status,text
abstinence_challenges,target_days,integer
abstinence_challenges,reward_message,text
abstinence_challenges,created_at,timestamp with time zone
abstinence_challenges,updated_at,timestamp with time zone
abstinence_logs,id,uuid
abstinence_logs,challenge_id,uuid
abstinence_logs,user_id,uuid
abstinence_logs,log_date,date
abstinence_logs,success,boolean
abstinence_logs,notes,text
abstinence_logs,mood_rating,integer
abstinence_logs,created_at,timestamp with time zone
diary_entries,id,uuid
diary_entries,user_id,uuid
diary_entries,food_name,text
diary_entries,quantity,numeric
diary_entries,unit,text
diary_entries,meal_type,text
diary_entries,calories,numeric
diary_entries,protein_g,numeric
diary_entries,carb_g,numeric
diary_entries,fat_g,numeric
diary_entries,fiber_g,numeric
diary_entries,sugar_g,numeric
diary_entries,sodium_mg,numeric
diary_entries,entry_date,date
diary_entries,created_at,timestamp with time zone
diary_entries,product_code,text
fasting_sessions,id,uuid
fasting_sessions,user_id,uuid
fasting_sessions,plan,text
fasting_sessions,start_time,timestamp with time zone
fasting_sessions,end_time,timestamp with time zone
fasting_sessions,is_active,boolean
fasting_sessions,created_at,timestamp with time zone
fasting_sessions,updated_at,timestamp with time zone
fasting_sessions,status,text
fasting_sessions,target_duration_hours,integer
fasting_sessions,fasting_type,text
fasting_sessions,notes,text
popular_scanned_products,code,text
popular_scanned_products,name,text
popular_scanned_products,brand,text
popular_scanned_products,category,text
popular_scanned_products,scan_count,bigint
popular_scanned_products,unique_users,bigint
popular_scanned_products,last_scanned,timestamp with time zone
product_reports,id,uuid
product_reports,product_id,uuid
product_reports,user_id,uuid
product_reports,report_type,text
product_reports,description,text
product_reports,status,text
product_reports,resolved_by,uuid
product_reports,resolved_at,timestamp with time zone
product_reports,created_at,timestamp with time zone
product_reviews,id,uuid
product_reviews,product_id,uuid
product_reviews,user_id,uuid
product_reviews,rating,integer
product_reviews,review_text,text
product_reviews,is_nutrition_accurate,boolean
product_reviews,created_at,timestamp with time zone
products, 4.397 records
products,id,uuid
products,code,text
products,name,text
products,brand,text
products,category,text
products,supermarkets,ARRAY
products,price_min,numeric
products,price_max,numeric
products,image_url,text
products,calories_per_100g,numeric
products,protein_per_100g,numeric
products,carbs_per_100g,numeric
products,fat_per_100g,numeric
products,fiber_per_100g,numeric
products,sugar_per_100g,numeric
products,salt_per_100g,numeric
products,allergens,ARRAY
products,keywords,ARRAY
products,created_by,uuid
products,is_verified,boolean
products,is_community_product,boolean
products,verification_status,text
products,moderator_notes,text
products,verified_by,uuid
products,created_at,timestamp with time zone
products,updated_at,timestamp with time zone
products,source,text
products,sodium_mg,numeric
products,stores,ARRAY
products,country,text
profiles,id,uuid
profiles,age,integer
profiles,gender,text
profiles,height_cm,numeric
profiles,weight_kg,numeric
profiles,activity_level,text
profiles,goal,text
profiles,dietary_restrictions,text
profiles,health_conditions,text
profiles,created_at,timestamp with time zone
profiles,updated_at,timestamp with time zone
profiles,first_name,text
profiles,last_name,text
profiles,show_onboarding,boolean
profiles,target_weight_kg,numeric
profiles,birth_date,date
profiles,goals,ARRAY
profiles,onboarding_completed,boolean
profiles,onboarding_step,integer
profiles,diet_type,character varying
profiles,intolerances,text
profiles,is_glutenfree,boolean
profiles,email,text
recipe_favorites,id,uuid
recipe_favorites,user_id,uuid
recipe_favorites,recipe_id,text
recipe_favorites,created_at,timestamp with time zone
recipes, 2.923 records
recipes,id,bigint
recipes,title,text
recipes,image_url,text
recipes,link,text
recipes,ingredients,ARRAY
recipes,category,text
recipes,source,text
recipes,created_at,timestamp with time zone
recipes,instructions,ARRAY
user_activities,id,uuid
user_activities,user_id,uuid
user_activities,activity_id,text
user_activities,activity_name,text
user_activities,emoji,text
user_activities,met,numeric
user_activities,duration_min,integer
user_activities,weight_kg,numeric
user_activities,calories,numeric
user_activities,note,text
user_activities,activity_date,date
user_activities,created_at,timestamp with time zone
water_intake,id,uuid
water_intake,user_id,uuid
water_intake,date,date
water_intake,amount_ml,integer
water_intake,daily_goal_ml,integer
water_intake,created_at,timestamp with time zone
water_intake,updated_at,timestamp with time zone
weight_history,id,uuid
weight_history,user_id,uuid
weight_history,weight_kg,numeric
weight_history,recorded_date,date
weight_history,notes,text
weight_history,created_at,timestamp with time zone
```
   - GROQ_API_KEY
5. **UI/UX mit Flutter Widgets und Animationen nachbauen**
6. **State-Management mit Provider/Riverpod/Bloc**
### profiles
- id (uuid)
### diary_entries
- id (uuid)
- user_id (uuid)
### products
- id (uuid)
- barcode, brand, image_url, source
- name, category, nutrition values

### activities
- id (uuid)
- user_id (uuid)
- activity_type, activity_name, duration_minutes, calories_burned, emoji, note, created_at

### water_intake
- id (uuid)
- user_id (uuid)
- amount_ml, created_at

### recipes
- id (uuid)
- user_id (uuid)
- name, ingredients, instructions, nutrition

## API-Integration

- **Supabase**: Auth, Datenbank, Storage
## Funktionen & Zuordnung

| Funktion                | API/Backend         | Tabelle(n)         |
|------------------------|--------------------|--------------------|
| Dashboard              | Supabase           | diary_entries, activities, water_intake |
| Barcode-Scanner        | OpenFoodFacts, Supabase | products         |
| KI-Chat                | Groq/Gemini, Supabase | profiles, diary_entries |
| Onboarding             | Supabase           | profiles           |
| Produktdatenbank       | Supabase, OpenFoodFacts | products         |
| Aktivitäten            | Supabase           | activities         |
| Wassertracking         | Supabase           | water_intake       |
| Rezepte                | Supabase, TheMealDB | recipes            |
| Challenges             | Supabase           | challenges         |

## .env Beispiel für Flutter
```
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_ANON_KEY=your_anon_key
GROQ_API_KEY=your_groq_key
GOOGLE_AI_API_KEY=your_google_key
```

## Hinweise zur Migration
- Alle Backend-Funktionen und Datenmodelle können übernommen werden.
- UI/UX, State und Logik müssen in Flutter/Dart neu gebaut werden.
- Animationen und Micro-Interactions mit Flutter-Widgets und Packages umsetzen.
- API-Keys und Endpunkte aus .env übernehmen.

ozgurazap@Mac-mini-von-Ozgur WebApp % supabase db list
Manage Postgres databases

Usage:
  dump        Dumps data or schemas from the remote database
  pull        Pull schema from the remote database
  push        Push new migrations to the remote database
  reset       Resets the local database to current migrations
  start       Starts local Postgres database

Flags:
  -h, --help   help for db

Global Flags:
      --create-ticket                                  create a support ticket for any CLI error
      --debug                                          output debug logs to stderr
      --dns-resolver [ native | https ]                lookup domain names using the specified resolver (default native)
      --experimental                                   enable experimental features
      --network-id string                              use the specified docker network instead of a generated one
  -o, --output [ env | pretty | json | toml | yaml ]   output format of status variables (default pretty)
      --workdir string                                 path to a Supabase project directory
      --yes                                            answer yes to all prompts

Use "supabase db [command] --help" for more information about a command.

## Weiterführende Links
- [Supabase Flutter Docs](https://supabase.com/docs/guides/with-flutter)
- [Flutter Dotenv](https://pub.dev/packages/flutter_dotenv)
- [Flutter Animationen](https://docs.flutter.dev/development/ui/animations)
- [Flutter State Management](https://docs.flutter.dev/development/data-and-backend/state-mgmt/overview)

---

**Diese README enthält alle wichtigen Infos für die Migration und Integration der Kernfunktionen in Flutter.**
---

## Beispiel-Dart-Modelle für Supabase Tabellen

```dart
// diary_entries.dart
class DiaryEntry {
  final String id;
  final String userId;
  final String foodName;
  final double quantity;
  final String unit;
  final String mealType;
  final double calories;
  final double proteinG;
  final double carbG;
  final double fatG;
  final double fiberG;
  final double sugarG;
  final double sodiumMg;
  final DateTime entryDate;
  final DateTime createdAt;
  final String? productCode;

  DiaryEntry({
    required this.id,
    required this.userId,
    required this.foodName,
    required this.quantity,
    required this.unit,
    required this.mealType,
    required this.calories,
    required this.proteinG,
    required this.carbG,
    required this.fatG,
    required this.fiberG,
    required this.sugarG,
    required this.sodiumMg,
    required this.entryDate,
    required this.createdAt,
    this.productCode,
  });

  factory DiaryEntry.fromJson(Map<String, dynamic> json) => DiaryEntry(
    id: json['id'],
    userId: json['user_id'],
    foodName: json['food_name'],
    quantity: (json['quantity'] as num).toDouble(),
    unit: json['unit'],
    mealType: json['meal_type'],
    calories: (json['calories'] as num).toDouble(),
    proteinG: (json['protein_g'] as num).toDouble(),
    carbG: (json['carb_g'] as num).toDouble(),
    fatG: (json['fat_g'] as num).toDouble(),
    fiberG: (json['fiber_g'] as num).toDouble(),
    sugarG: (json['sugar_g'] as num).toDouble(),
    sodiumMg: (json['sodium_mg'] as num).toDouble(),
    entryDate: DateTime.parse(json['entry_date']),
    createdAt: DateTime.parse(json['created_at']),
    productCode: json['product_code'],
  );
}

// products.dart
class Product {
  final String id;
  final String code;
  final String name;
  final String brand;
  final String category;
  final List<String>? supermarkets;
  final double? priceMin;
  final double? priceMax;
  final String? imageUrl;
  // ...weitere Felder nach Bedarf

  Product({
    required this.id,
    required this.code,
    required this.name,
    required this.brand,
    required this.category,
    this.supermarkets,
    this.priceMin,
    this.priceMax,
    this.imageUrl,
  });

  factory Product.fromJson(Map<String, dynamic> json) => Product(
    id: json['id'],
    code: json['code'],
    name: json['name'],
    brand: json['brand'],
    category: json['category'],
    supermarkets: (json['supermarkets'] as List?)?.map((e) => e.toString()).toList(),
    priceMin: (json['price_min'] as num?)?.toDouble(),
    priceMax: (json['price_max'] as num?)?.toDouble(),
    imageUrl: json['image_url'],
  );
}

// profiles.dart
class Profile {
  final String id;
  final int age;
  final String gender;
  final double heightCm;
  final double weightKg;
  final String activityLevel;
  final String goal;
  // ...weitere Felder nach Bedarf

  Profile({
    required this.id,
    required this.age,
    required this.gender,
    required this.heightCm,
    required this.weightKg,
    required this.activityLevel,
    required this.goal,
  });

  factory Profile.fromJson(Map<String, dynamic> json) => Profile(
    id: json['id'],
    age: json['age'],
    gender: json['gender'],
    heightCm: (json['height_cm'] as num).toDouble(),
    weightKg: (json['weight_kg'] as num).toDouble(),
    activityLevel: json['activity_level'],
    goal: json['goal'],
  );
}
```

---

## Supabase Auth-Flow in Flutter

1. **Installation:**
   ```yaml
   dependencies:
     supabase_flutter: ^2.0.0
   ```
2. **Initialisierung:**
   ```dart
   await Supabase.initialize(
     url: 'SUPABASE_URL',
     anonKey: 'SUPABASE_ANON_KEY',
   );
   ```
3. **Sign Up / Sign In:**
   ```dart
   // Registrierung
   final response = await supabase.auth.signUp(email: email, password: password);
   // Login
   final response = await supabase.auth.signInWithPassword(email: email, password: password);
   ```
4. **Session Handling:**
   ```dart
   final user = supabase.auth.currentUser;
   final session = supabase.auth.currentSession;
   ```

---

## Beispiel-API-Calls (Query, Insert, Update)

```dart
// Query: Alle diary_entries für User
final response = await supabase
  .from('diary_entries')
  .select()
  .eq('user_id', userId);

// Insert: Neues Produkt
final response = await supabase
  .from('products')
  .insert({
    'code': '123456789',
    'name': 'Apfel',
    'brand': 'Bio',
    'category': 'Obst',
  });

// Update: Profil aktualisieren
final response = await supabase
  .from('profiles')
  .update({'weight_kg': 80})
  .eq('id', profileId);
```

---

## Migration von Bildern/Dateien (Supabase Storage)

1. **Bucket anlegen im Supabase Dashboard**
2. **Upload in Flutter:**
   ```dart
   final fileBytes = await file.readAsBytes();
   final response = await supabase.storage
     .from('images')
     .upload('profile_pics/${userId}.jpg', fileBytes);
   ```
3. **Download/URL holen:**
   ```dart
   final url = supabase.storage
     .from('images')
     .getPublicUrl('profile_pics/${userId}.jpg');
   ```

---

## Hinweise zu Row Level Security (RLS) und Policies

- **RLS aktivieren:** Im Supabase Dashboard für jede Tabelle einschalten.
- **Policies erstellen:**
  - Beispiel: Nur User darf eigene diary_entries sehen/bearbeiten
    ```sql
    CREATE POLICY "User can access own entries" ON diary_entries
      FOR SELECT USING (user_id = auth.uid());
    CREATE POLICY "User can insert own entries" ON diary_entries
      FOR INSERT WITH CHECK (user_id = auth.uid());
    CREATE POLICY "User can update own entries" ON diary_entries
      FOR UPDATE USING (user_id = auth.uid());
    ```
- **Testen:** Policies nach Migration unbedingt testen!
