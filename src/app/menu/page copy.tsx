// app/menu/page.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for our data
interface MenuItem {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  category_id: number | null;
  is_popular: number | null;
  view_order: number | null;
}

interface Category {
  id: number;
  name: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      if (categoriesError) {
        console.error("Error fetching categories:", categoriesError);
      } else if (categoriesData) {
        setCategories(categoriesData);
      }

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from("menus")
        .select("*")
        .order("view_order");

      if (menuError) {
        console.error("Error fetching menu items:", menuError);
      } else if (menuData) {
        setMenuItems(menuData);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Filter menu items by category
  const filteredItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => {
          const categoryObj = categories.find(
            (cat) => cat.id === item.category_id
          );
          return categoryObj && categoryObj.name === activeCategory;
        });

  // Filter popular items
  const popularItems = menuItems.filter((item) => item.is_popular === 1);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-8">Our Menu</h1>

      <Tabs
        defaultValue="all"
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <div className="flex justify-center mb-8">
          <TabsList className="overflow-x-auto">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.name}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-8">
          <MenuGrid items={menuItems} loading={loading} />
        </TabsContent>

        <TabsContent value="popular" className="space-y-8">
          <MenuGrid items={popularItems} loading={loading} />
        </TabsContent>

        {categories.map((category) => (
          <TabsContent
            key={category.id}
            value={category.name}
            className="space-y-8"
          >
            <MenuGrid
              items={menuItems.filter(
                (item) => item.category_id === category.id
              )}
              loading={loading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MenuGrid({ items, loading }: { items: MenuItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No menu items found in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => (
        <MenuItem key={item.id} item={item} />
      ))}
    </div>
  );
}

function MenuItem({ item }: { item: MenuItem }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        {item.is_popular === 1 && (
          <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
            Popular
          </Badge>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{item.name}</h3>
          {item.price !== null && (
            <span className="font-bold text-green-600">
              ${item.price.toFixed(2)}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-2">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}

function MenuItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-2" />
      </div>
    </div>
  );
}
