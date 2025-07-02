"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function RecipeDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchRecipe() {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();
      setRecipe(data);
      setLoading(false);
    }
    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Lädt Rezept ...</span>
      </div>
    );
  }
  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-red-500">Rezept nicht gefunden</span>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white min-h-screen">
      <div className="rounded-xl overflow-hidden shadow-lg mb-4">
        {recipe.image_url && (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            width={600}
            height={400}
            className="w-full h-64 object-cover"
            priority
          />
        )}
      </div>
      <h1 className="text-2xl font-bold mb-2 text-green-800">{recipe.title}</h1>
      {recipe.category && (
        <div className="mb-2 text-sm text-green-600 font-medium">Kategorie: {recipe.category}</div>
      )}
      <div className="mb-4">
        <h2 className="font-semibold text-lg mb-1">Zutaten</h2>
        <ul className="list-disc list-inside text-base text-gray-800">
          {Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map((ing: any, i: number) => (
                <li key={i}>{typeof ing === "string" ? ing : ing.name || ing}</li>
              ))
            : null}
        </ul>
      </div>
      {recipe.instructions && (
        <div className="mb-4">
          <h2 className="font-semibold text-lg mb-1">Zubereitung</h2>
          <p className="whitespace-pre-line text-base text-gray-700">{recipe.instructions}</p>
        </div>
      )}
    </div>
  );
}
