"use client";
import { supabase } from '@/lib/supabaseClient';
import React, { useEffect } from 'react';

const UpdateData = () => {
    const updateProduct = async () => {
        const response= await supabase.from("Products").update({ name: "Sofas Chesterfield" }).eq("id",21).select();

        if (response.error) {
            console.error("Error updating product:", response.error.message);
            alert(response.error.message);
        } else {
            console.log("Product updated successfully:", response);
        }
    };

    useEffect(() => {
        const authentication = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                alert("Not authenticated");
            } else {
                await updateProduct(); // Correct function call
            }
        };

        authentication();
    }, []);

    return <div>UpdateData</div>;
};

export default UpdateData;



//____ Updating products Example:

/*
const { data, error } = await supabase
  .from("Products")
  .update({ price: 120 }) // Updating price
  .eq("id", 1); // Where id = 1

if (error) {
  console.error("Error updating product:", error);
} else {
  console.log("Product updated:", data);
}

 */

/*
// updateData.js
import { supabase } from './supabaseClient';

export const updateProfile = async (id, updatedData) => {
  const { data, error } = await supabase
    .from('profiles') // replace with your table name
    .update(updatedData) // Updated data
    .eq('id', id); // Condition to find the record to update

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
};
 */