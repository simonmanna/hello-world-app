// app/categories/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import MenuDetailModal from "../components/MenuDetailModal";
import EditModal from "../components/EditModal";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for our data
interface Category {
  id: number;
  created_at: string;
  updated_at: string | null;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  parent_id: number | null;
  code: string | null;
  view_order: number | null;
  children?: Category[];
}

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

interface EditableItem {
  id: number;
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  price?: number | null;
  category_id?: number | null;
  parent_id?: number | null;
  type: "category" | "menuItem";
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<EditableItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("view_order");

    if (error) {
      console.error("Error fetching categories:", error);
    } else if (data) {
      // Build the category tree
      const categoryTree = buildCategoryTree(data);
      setCategories(categoryTree);
    }

    setLoading(false);
  }

  // Build a hierarchical tree from flat category data
  function buildCategoryTree(flatCategories: Category[]): Category[] {
    const categoryMap = new Map<number, Category>();

    // Create a map of all categories with their IDs as keys
    flatCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    const rootCategories: Category[] = [];

    // Organize categories into a hierarchical structure
    flatCategories.forEach((category) => {
      const categoryWithChildren = categoryMap.get(category.id);

      if (categoryWithChildren) {
        if (category.parent_id === null) {
          // This is a root category
          rootCategories.push(categoryWithChildren);
        } else {
          // This is a child category
          const parentCategory = categoryMap.get(category.parent_id);
          if (parentCategory) {
            if (!parentCategory.children) {
              parentCategory.children = [];
            }
            parentCategory.children.push(categoryWithChildren);
          }
        }
      }
    });

    // Sort categories by view_order
    rootCategories.sort((a, b) => {
      return (a.view_order || 0) - (b.view_order || 0);
    });

    return rootCategories;
  }

  // Handle category selection
  async function handleCategoryClick(category: Category) {
    setLoading(true);
    setCurrentCategory(category);

    // Update the category path
    if (category.parent_id === null) {
      setCategoryPath([category]);
    } else {
      const newPath = [...categoryPath];

      // Find if the category is already in the path
      const existingIndex = newPath.findIndex(
        (item) => item.id === category.id
      );
      if (existingIndex !== -1) {
        // If it's in the path, truncate the path up to this category
        setCategoryPath(newPath.slice(0, existingIndex + 1));
      } else {
        // If it's not in the path, add it
        setCategoryPath([...newPath, category]);
      }
    }

    // If the category has no children, fetch its menu items
    if (!category.children || category.children.length === 0) {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("category_id", category.id)
        .order("view_order");

      if (error) {
        console.error("Error fetching menu items:", error);
      } else {
        setMenuItems(data || []);
      }
    } else {
      // If the category has children, clear the menu items
      setMenuItems([]);
    }

    setLoading(false);
  }

  // Handle back navigation
  function handleBackClick() {
    if (categoryPath.length > 1) {
      // Navigate to the parent category
      const parentCategory = categoryPath[categoryPath.length - 2];
      handleCategoryClick(parentCategory);
    } else {
      // Navigate to the root
      setCurrentCategory(null);
      setCategoryPath([]);
      setMenuItems([]);
    }
  }

  // Handle menu item click to show detail modal
  function handleMenuItemClick(item: MenuItem) {
    setSelectedItem(item);
  }

  // Close the modal
  function handleCloseModal() {
    setSelectedItem(null);
  }

  // Handle edit button click for category or menu item
  function handleEditClick(
    item: Category | MenuItem,
    type: "category" | "menuItem",
    event: React.MouseEvent
  ) {
    event.stopPropagation(); // Prevent triggering the parent onClick

    setItemToEdit({
      id: item.id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: type === "menuItem" ? (item as MenuItem).price : undefined,
      category_id:
        type === "menuItem" ? (item as MenuItem).category_id : undefined,
      parent_id: type === "category" ? (item as Category).parent_id : undefined,
      type: type,
    });

    setIsEditing(true);
  }

  // Close the edit modal
  function handleCloseEditModal() {
    setItemToEdit(null);
    setIsEditing(false);
  }

  // Save edited item
  async function handleSaveEdit(editedItem: EditableItem) {
    setLoading(true);

    const {
      id,
      name,
      description,
      imageUrl,
      price,
      type,
      category_id,
      parent_id,
    } = editedItem;
    const tableName = type === "category" ? "categories" : "menus";

    // Create update object based on item type
    const updateData: any = {
      name,
      description,
      imageUrl,
      updated_at: new Date().toISOString(),
    };

    // Add price only for menu items
    if (type === "menuItem" && price !== undefined) {
      updateData.price = price;
      updateData.category_id = category_id;
    }

    // Add parent_id for categories
    if (type === "category" && parent_id !== undefined) {
      updateData.parent_id = parent_id;
    }

    // Update the item in the database
    const { error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error(`Error updating ${type}:`, error);
      alert(`Failed to update ${type}: ${error.message}`);
    } else {
      // Handle successful update
      if (type === "category") {
        // Complete refresh is needed as category hierarchy might have changed
        fetchCategories();

        // If category parent has changed, we need to return to a safe navigation point
        if (currentCategory && currentCategory.id === id) {
          // If we changed the currently selected category, go to the root level
          setCurrentCategory(null);
          setCategoryPath([]);
          setMenuItems([]);
        }
      } else {
        // For menu items, if category changed, refresh menu items
        if (currentCategory && category_id !== currentCategory.id) {
          // Remove the item from the current view if its category changed
          setMenuItems(menuItems.filter((item) => item.id !== id));
        } else {
          // Just update the local state
          const updatedMenuItems = menuItems.map((item) =>
            item.id === id
              ? { ...item, name, description, imageUrl, price, category_id }
              : item
          );
          setMenuItems(updatedMenuItems);

          // If this is the selected item, update it
          if (selectedItem && selectedItem.id === id) {
            setSelectedItem({
              ...selectedItem,
              name,
              description,
              imageUrl,
              price,
              category_id,
            });
          }
        }
      }
    }

    setIsEditing(false);
    setItemToEdit(null);
    setLoading(false);
  }

  // Handle image upload
  async function handleImageUpload(file: File): Promise<string | null> {
    try {
      // Generate a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `food_categories/${fileName}`;

      // Convert File to Binary Data
      const arrayBuffer = await file.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Upload the file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("food_categories") // Use the same bucket as your mobile app
        .upload(filePath, fileData, {
          contentType: `image/${fileExt}`,
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return null;
      }

      // Get the public URL - using same approach as mobile app
      const { data: urlData } = supabase.storage
        .from("food_categories")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Detailed upload error:", error);
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Menu Management
            </h1>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Breadcrumb navigation */}
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <button
              onClick={() => {
                setCurrentCategory(null);
                setCategoryPath([]);
                setMenuItems([]);
              }}
              className="hover:text-blue-600"
            >
              Home
            </button>

            {categoryPath.map((category, index) => (
              <div key={category.id} className="flex items-center">
                <span className="mx-2">/</span>
                <button
                  onClick={() => handleCategoryClick(category)}
                  className={`hover:text-blue-600 ${
                    index === categoryPath.length - 1 ? "font-medium" : ""
                  }`}
                >
                  {category.name}
                </button>
              </div>
            ))}
          </div>
        </header>

        <main>
          {/* Navigation buttons */}
          {currentCategory && (
            <button
              onClick={handleBackClick}
              className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center"
            >
              <span className="mr-1">←</span> Back
            </button>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div>
              {!currentCategory ? (
                /* Root level categories */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="h-48 bg-gray-200 relative">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name || ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        <button
                          onClick={(e) =>
                            handleEditClick(category, "category", e)
                          }
                          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="mt-1 text-gray-600 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentCategory.children &&
                currentCategory.children.length > 0 ? (
                /* Subcategories */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentCategory.children.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      onClick={() => handleCategoryClick(subcategory)}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="h-48 bg-gray-200 relative">
                        {subcategory.imageUrl ? (
                          <img
                            src={subcategory.imageUrl}
                            alt={subcategory.name || ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        <button
                          onClick={(e) =>
                            handleEditClick(subcategory, "category", e)
                          }
                          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {subcategory.name}
                        </h3>
                        {subcategory.description && (
                          <p className="mt-1 text-gray-600 line-clamp-2">
                            {subcategory.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Menu items */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMenuItemClick(item)}
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="h-48 bg-gray-200 relative">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No image
                          </div>
                        )}
                        <button
                          onClick={(e) => handleEditClick(item, "menuItem", e)}
                          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {item.name}
                          </h3>
                          {item.price && (
                            <span className="font-semibold text-green-600">
                              UGX {item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-gray-600 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Menu Item Detail Modal */}
      {selectedItem && (
        <MenuDetailModal item={selectedItem} onClose={handleCloseModal} />
      )}

      {/* Edit Modal */}
      {isEditing && itemToEdit && (
        <EditModal
          item={itemToEdit}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
          onImageUpload={handleImageUpload}
        />
      )}
    </div>
  );
}
