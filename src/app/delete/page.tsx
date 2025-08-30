"use client";
import { supabase } from '@/lib/supabaseClient';
import React, { useEffect } from 'react'

const Delete = () => {

    const deleteData = async () => {
        const response = await supabase.from("Products").delete().eq("id", 2).select();
        if(response.error) {
            alert("Error while deleting");
        }
        console.log("Product deleted successfully :", response.data);     
      }
    useEffect(() => {
        const authenticate = async () => {
            const response = await supabase.auth.getUser();
            if(response.error){
                alert(response.error.message)
            }
            deleteData();
        }
        authenticate();
    },[]);
  return (
    <div>Delete</div>
  )
}

export default Delete;