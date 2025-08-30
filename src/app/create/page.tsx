"use client";
import { supabase } from '@/lib/supabaseClient'
import React, { useEffect , useState} from 'react';

const CreateProduct = () => {
  const [isAdmin, setisAdmin] = useState("");

  const create = async () => {
    const { data, error } = await supabase
  .from("Products")
  .insert([
    {
      name: "New Product",
      image:null
    }
  ]);

  console.log(data);
  if(error) {
    console.log(error.message);
  }
  }
useEffect(() => {
  // console.log(window.document.cookie.split("=").shift());
  const getIdentity = async () =>{
    const response = await supabase.auth.getUser();
    console.log(response);
    if(response.error) {
      alert(response.error.message);
    }
    await create();
  }
  getIdentity();
},[]);
  return (
    <div>CreateProduct</div>
  )
}

export default CreateProduct;

//____ Create products Example:

/*
const { data, error } = await supabase
  .from("Products")
  .insert([
    {
      name: "New Product", 
      price: 100, 
      image_url: "https://yourimageurl.com",
      description: "This is a new product"
    }
  ]);

if (error) {
  console.error("Error inserting product:", error);
} else {
  console.log("Product added:", data);
}

 */

//____ Fetch products Example:

/*
const { data, error } = await supabase
  .from("Products")
  .select("*"); // Select all columns

if (error) {
  console.error("Error fetching products:", error);
} else {
  console.log("Fetched products:", data);
}

 */



//____ Replacement products Example:
/*
const { data, error } = await supabase
  .from("Products")
  .upsert([
    {
      id: 1,  // Ensure ID exists
      name: "Updated Product",
      price: 200,
      image_url: "https://newimageurl.com",
      description: "Updated description"
    }
  ]);

if (error) {
  console.error("Error replacing product:", error);
} else {
  console.log("Product replaced:", data);
}

 */

//____ Deleting products Example:

/*
const { data, error } = await supabase
  .from("Products")
  .delete()
  .eq("id", 1); // Where id = 1

if (error) {
  console.error("Error deleting product:", error);
} else {
  console.log("Product deleted:", data);
}

 */