// app/admin/menu-option-groups/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type MenuOptionGroup = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

type MenuOption = {
  id: string;
  name: string;
  description: string | null;
  price_adjustment: number;
  is_active: boolean;
};

export default function MenuOptionGroupForm({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new';
  const router = useRouter();
  
  const [optionGroup, setOptionGroup] = useState<MenuOptionGroup>({
    id: '',
    name: '',
    description: '',
    is_active: true
  });
  
  const [availableOptions, setAvailableOptions] = useState<MenuOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all available options
        const { data: optionsData, error: optionsError } = await supabase
          .from('menu_options')
          .select('*')
          .order('name');
        
        if (optionsError) throw optionsError;
        setAvailableOptions(optionsData || []);
        
        // If editing an existing option group
        if (!isNew) {
          // Fetch the option group
          const { data: groupData, error: groupError } = await supabase
            .from('menu_option_groups')
            .select('*')
            .eq('id', params.id)
            .single();
          
          if (groupError) throw groupError;
          setOptionGroup(groupData as MenuOptionGroup);
          
          // Fetch associated options
          const { data: relationsData, error: relationsError } = await supabase
            .from('menu_option_group_options')
            .select('option_id')
            .eq('option_group_id', params.id);
          
          if (relationsError) throw relationsError;
          setSelectedOptions(relationsData.map(relation => relation.option_id));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, isNew]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setOptionGroup(prev => ({ ...prev, [name]: checked }));
    } else {
      setOptionGroup(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOptionSelection = (optionId: string) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId);
      } else {
        return [...prev, optionId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      let groupId = params.id;
      
      // Create or update the option group
      if (isNew) {
        const { data, error } = await supabase
          .from('menu_option_groups')
          .insert({
            name: optionGroup.name,
            description: optionGroup.description,
            is_active: optionGroup.is_active
          })
          .select('id')
          .single();
        
        if (error) throw error;
        groupId = data.id;
      } else {
        const { error } = await supabase
          .from('menu_option_groups')
          .update({
            name: optionGroup.name,
            description: optionGroup.description,
            is_active: optionGroup.is_active
          })
          .eq('id', groupId);
        
        if (error) throw error;
        
        // Delete existing relationships
        const { error: deleteError } = await supabase
          .from('menu_option_group_options')
          .delete()
          .eq('option_group_id', groupId);
        
        if (deleteError) throw deleteError;
      }
      
      // Create new relationships for selected options
      if (selectedOptions.length > 0) {
        const relationshipsToInsert = selectedOptions.map(optionId => ({
          option_group_id: groupId,
          option_id: optionId
        }));
        
        const { error: insertError } = await supabase
          .from('menu_option_group_options')
          .insert(relationshipsToInsert);
        
        if (insertError) throw insertError;
      }
      
      // Redirect back to the list page
      router.push('/admin/menu-option-groups');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{isNew ? 'Create New Option Group' : 'Edit Option Group'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
                <input
                  type="text"
                  name="name"
                  value={optionGroup.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  name="description"
                  value={optionGroup.description || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </label>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={optionGroup.is_active}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Available Options</h2>
          <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
            {availableOptions.length === 0 ? (
              <p className="text-gray-500">No options available</p>
            ) : (
              <div className="space-y-2">
              availableOptions.map((option) => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`option-${option.id}`}
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleOptionSelection(option.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`option-${option.id}`} className="ml-2 block">
                      <span className="text-sm font-medium text-gray-700">{option.name}</span>
                      {option.price_adjustment !== 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          {option.price_adjustment > 0 ? '+' : ''}{option.price_adjustment}
                        </span>
                      )}
                      {option.description && (
                        <p className="text-xs text-gray-500">{option.description}</p>
                      )}
                    </label>
                  </div>
                ))
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/admin/menu-option-groups')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}