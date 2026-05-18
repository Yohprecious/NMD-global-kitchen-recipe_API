import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from './lib/firebase.ts';
import RecipeCard from './components/RecipeCard.tsx';
import RecipeModal from './components/RecipeModal.tsx';
import RecipeForm from './components/RecipeForm.tsx';
import { Search, Plus, ChefHat, UtensilsCrossed, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Use the local assets we generated
const DEFAULT_RECIPES = [
  {
    id: 'ndole-default',
    title: 'Authentic Ndolé',
    description: 'The King of Cameroonian cuisine. A rich stew of bitterleaf, fresh peanuts, and succulent beef.',
    ingredients: ['Bitterleaf', 'Peanuts', 'Beef', 'Shrimp', 'Onions', 'Palm Oil'],
    instructions: '1. Clean and boil bitterleaves.\n2. Grind peanuts into a paste.\n3. Boil beef and shrimp until tender.\n4. Mix ingredients and simmer with palm oil until rich and creamy.',
    cookingTime: 90,
    difficulty: 'Hard',
    category: 'Lunch',
    imageUrl: '/images/ndole.png',
    videoUrl: '/videos/ndole.mp4'
  },
  {
    id: 'poulet-dg-default',
    title: 'Poulet DG',
    description: "Director General Chicken. A prestigious mix of bird, plantain, and vibrant vegetables.",
    ingredients: ['Chicken', 'Plantain', 'Carrots', 'Green Beans', 'Bell Peppers', 'Tomatoes'],
    instructions: '1. Cube and fry plantain until golden.\n2. Brown chicken pieces.\n3. Sauté vegetables in a tomato base.\n4. Combine all components and simmer together.',
    cookingTime: 60,
    difficulty: 'Medium',
    category: 'Supper',
    imageUrl: '/images/poulet_dg.png',
    videoUrl: '/videos/poulet_dg.mp4'
  },
  {
    id: 'achu-default',
    title: 'Achu with Yellow Soup',
    description: 'A traditional delicacy from the North West region. Pounded cocoyam served with iconic yellow soup.',
    ingredients: ['Cocoyam', 'Red Palm Oil', 'Limestone (Kanwa)', 'Spices', 'Beef/Skin (Canda)'],
    instructions: '1. Boil and pound cocoyams until smooth.\n2. Mix palm oil and kanwa to create the yellow soup emulsification.\n3. Season and add cooked meat.\n4. Serve in traditional wooden bowls.',
    cookingTime: 120,
    difficulty: 'Hard',
    category: 'Lunch',
    imageUrl: '/images/achu.png',
    videoUrl: '/videos/achu.mp4'
  },
  {
    id: 'koki-default',
    title: 'Koki Beans',
    description: 'Steamed bean cake made from black-eyed peas and palm oil, wrapped in banana leaves.',
    ingredients: ['Black-eyed Peas', 'Palm Oil', 'Hot Peppers', 'Banana Leaves'],
    instructions: '1. Peel and grind beans.\n2. Mix with palm oil and peppers until fluffy.\n3. Wrap portions in banana leaves.\n4. Steam for several hours.',
    cookingTime: 180,
    difficulty: 'Medium',
    category: 'Brunch',
    imageUrl: '/images/koki.png',
    videoUrl: '/videos/koki.mp4'
  }
];

export default function App() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    // Firestore Listener
    const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeStore = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes([...DEFAULT_RECIPES, ...data]);
      setLoading(false);
    });

    return () => {
      unsubscribeStore();
    };
  }, []);

  const handleAddRecipe = async (recipeData: any) => {
    try {
      await addDoc(collection(db, 'recipes'), {
        ...recipeData,
        author: 'YOH PRECIOUS'
      });
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Error adding recipe. Please check your connection.');
    }
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.ingredients.some((i: string) => i.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="text-accent w-8 h-8" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-neutral-900 leading-none">The Global Kitchen</h1>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] mt-1">By YOH PRECIOUS</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-neutral-500">
            {['All', 'Breakfast', 'Brunch', 'Lunch', 'Supper'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`transition-colors hover:text-accent ${activeCategory === cat ? 'text-accent border-b-2 border-accent pb-1' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-accent text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-brand-600 py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Sparkles className="absolute top-10 left-1/4 w-32 h-32 text-white" />
          <ChefHat className="absolute bottom-10 right-1/4 w-48 h-48 text-white" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-serif font-bold text-brand-50 mb-6 leading-tight"
          >
            Taste the Magic of Cameroon
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-brand-50/70 text-lg md:text-xl font-light mb-12"
          >
            Explore real recipes from the heart of our community. From traditional stews to modern twists, discover the flavor that unites us.
          </motion.p>
          
          <div className="relative max-w-xl mx-auto shadow-2xl rounded-full overflow-hidden">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by meal or ingredient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-neutral-900 pl-14 pr-6 py-5 outline-none font-medium text-lg"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h3 className="text-3xl font-serif font-bold text-neutral-900 mb-2">
              {searchTerm ? `Searching for "${searchTerm}"` : `${activeCategory} Meals`}
            </h3>
            <div className="h-1 w-20 bg-accent rounded-full" />
          </div>
          <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
            {filteredRecipes.length} recipes found
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <UtensilsCrossed className="w-12 h-12 mb-4 animate-bounce" />
            <p className="font-bold tracking-widest text-xs uppercase">Loading Flavors...</p>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} onSelect={setSelectedRecipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <h4 className="text-2xl font-serif font-bold text-neutral-400 mb-4">No recipes found yet.</h4>
            <p className="text-neutral-500 mb-8">Be the first to share this flavor with the world!</p>
            <button
               onClick={() => setIsFormOpen(true)}
               className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-sm hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add a Recipe
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-500 py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="text-white/20 w-10 h-10" />
            <div>
               <p className="text-white font-serif font-bold text-lg">The Global Kitchen</p>
               <p className="text-[10px] uppercase font-bold tracking-widest">Digital Cookbook by YOH PRECIOUS</p>
            </div>
          </div>
          <p className="text-xs">© 2024. Created with love for the Cameroonian Community.</p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors cursor-pointer">About</span>
            <span className="text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors cursor-pointer">Contact</span>
            <span className="text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors cursor-pointer">Privacy</span>
          </div>
        </div>
      </footer>

      {/* Modal & Form overlays */}
      <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      {isFormOpen && <RecipeForm onAdd={handleAddRecipe} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
