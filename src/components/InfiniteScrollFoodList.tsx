import React from 'react';
import { useInView } from 'react-intersection-observer';
import { Plus } from 'lucide-react';

export interface FoodItem {
  code: string;
  product_name: string;
  image_url?: string;
  nutriments: Record<string, number>;
}

interface Props {
  items: FoodItem[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (item: FoodItem) => void;
}

const InfiniteScrollFoodList: React.FC<Props> = ({ items, loading, hasMore, onLoadMore, onSelect }) => {
  const { ref, inView } = useInView({ threshold: 0 });

  React.useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore();
    }
  }, [inView, hasMore, loading, onLoadMore]);

  return (
    <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100 rounded-2xl">
      {items.map((food, idx) => (
        <div
          key={(food.code ? food.code : 'idx-') + idx}
          className="w-full flex items-center justify-between p-4 bg-white/90 hover:bg-emerald-50 border border-emerald-100 rounded-2xl shadow transition-colors text-left"
        >
          <div className="flex-1" onClick={() => onSelect(food)}>
            <h4 className="font-medium text-gray-900">{food.product_name || 'Unbekanntes Produkt'}</h4>
            <p className="text-sm text-gray-600">
              {food.nutriments['energy-kcal_100g'] || 0} kcal pro 100g
            </p>
          </div>
          <button
            onClick={() => onSelect(food)}
            className="ml-4 flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center text-white shadow active:scale-95 transition-transform"
            aria-label="Lebensmittel hinzufügen"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      ))}
      <div ref={ref} />
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
        </div>
      )}
      {!hasMore && !loading && items.length > 0 && (
        <div className="text-center text-gray-400 py-2 text-sm">Keine weiteren Ergebnisse</div>
      )}
    </div>
  );
};

export default InfiniteScrollFoodList;
