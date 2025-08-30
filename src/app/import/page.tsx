"use client";

import React, { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface SanityProduct {
  productName: string;
  category: string;
  price: number;
  quantityAvailable: number;
  discount: number;
  shortDescription: string;
  longDescription: { children: { text: string }[] }[]; // Rich text array
  ratings: number;
  ratingsInCount: number;
  tags: string[];
  weight: string;
  image?: { asset: { url: string } };
}

// Define Supabase product type
interface SupabaseProduct {
  name: string;
  category: string;
  price: number;
  quantityAvailable: number;
  discount: number;
  short_description: string;
  long_description: string;
  image: string | null;
  ratings: number;
  rating_count: number;
  Tags: string[] | null;
  weight: string;
}

// Supported image formats
const contentTypeMap: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
  avif: "image/avif",
};

const Import = () => {
  useEffect(() => {
    const getData = async () => {
      try {
        const sanityRes = await fetch(`http://localhost:3000/api`);
        const mockData = await sanityRes.json();
        const sanityData: SanityProduct[] = mockData.message;

        let failedUploads: { productName: string; error: string }[] = [];
        let uploadedProducts: { productName: string; image: string | null }[] = [];

        for (const product of sanityData) {
          const {
            productName,
            category,
            price,
            quantityAvailable,
            discount,
            shortDescription,
            longDescription,
            ratings,
            ratingsInCount,
            tags,
            weight,
          } = product;

          const tagsFormatted = tags && tags.length > 0 ? tags.map(tag => JSON.stringify({ name: tag })) : null;

          const imageUrl = product?.image?.asset?.url || null;
          let uploadedImageUrl: string | null = null;

          // Upload image to Supabase Storage if image exists
          if (imageUrl) {
            try {
              const imageResponse = await fetch(imageUrl);
              if (!imageResponse.ok) throw new Error("Failed to fetch image");

              const imageBuffer = await imageResponse.arrayBuffer();
              const fileExtension = imageUrl.split(".").pop()?.split("?")[0]?.toLowerCase() || "png";
              const contentType = contentTypeMap[fileExtension] || "image/png";

              const fileName = `uploads/${Date.now()}.${fileExtension}`;
              const imageBlob = new Blob([imageBuffer], { type: contentType });

              const { error: uploadError } = await supabase.storage
                .from("comforty-products-images")
                .upload(fileName, imageBlob, { contentType });

              if (uploadError) throw new Error(uploadError.message);

              // Get the public URL of the uploaded image
              uploadedImageUrl = supabase.storage.from("comforty-products-images").getPublicUrl(fileName).data.publicUrl;
            } catch (imgError: any) {
              console.error("Image Upload Failed:", imgError.message);
              failedUploads.push({ productName, error: imgError.message });
              continue;
            }
          }

          // Prepare Supabase product data
          const newProduct: SupabaseProduct = {
            name: productName,
            category,
            price,
            quantityAvailable,
            discount,
            short_description: shortDescription,
            long_description: JSON.stringify(longDescription),
            image: uploadedImageUrl,
            ratings,
            rating_count: ratingsInCount,
            Tags: tagsFormatted,
            weight,
          };

          // Insert product into Supabase
          const { error: insertError } = await supabase.from("Products").insert([newProduct]);

          if (insertError) {
            console.error("Database Insert Failed:", insertError.message);
            failedUploads.push({ productName, error: insertError.message });
          } else {
            uploadedProducts.push({ productName, image: uploadedImageUrl });
          }
        }

        console.log("Import Completed", { uploadedProducts, failedUploads });
      } catch (error) {
        console.error("Error Fetching Data:", error);
      }
    };

    const authenticate = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error || !user) {
        alert("Not authenticated");
        return;
      }
      await getData();
    };

    authenticate();
  }, []);

  return <div>Import</div>;
};

export default Import;

// "use client";

// import React,{useState, useEffect} from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import sanityClient from "@/lib/sanityClient";
// interface SanityProduct {
//   productName: string;
//   category: string;
//   price: number;
//   quantityAvailable: number;
//   discount: number;
//   shortDescription: string;
//   longDescription: { children: { text: string }[] }[]; // Rich text array
//   ratings: number;
//   ratingsInCount: number;
//   tags: string[];
//   weight: string;
//   image?: { asset: { url: string } };
// }

// // Define Supabase product type
// interface SupabaseProduct {
//   name: string;
//   category: string;
//   price: number;
//   quantityAvailable: number;
//   discount: number;
//   short_description: string;
//   long_description: string;
//   image: string | null;
//   ratings: number;
//   rating_count: number;
//   Tags: string[] | null;
//   weight: string;
// }

// // Supported image formats
// const contentTypeMap: Record<string, string> = {
//   jpg: "image/jpeg",
//   jpeg: "image/jpeg",
//   png: "image/png",
//   svg: "image/svg+xml",
//   webp: "image/webp",
//   avif: "image/avif",
// };


// const Import = () => {

// useEffect(() => {
// const getData = async () => {
//   const sanityRes = await fetch(`http://localhost:3000/api`);
//           const mockData = await sanityRes.json();
//           const sanityData: SanityProduct[] = mockData.message;  
//           // if (!sanityData || sanityData.length === 0) {
//           //     return NextResponse.json({ error: "No data found from Sanity" }, { status: 404 });
//           // }
  
//           let failedUploads: { productName: string; error: string }[] = [];
//           let uploadedProducts: { productName: string; image: string | null }[] = [];
  
//           for (const product of sanityData) {
//               // Extract product data
//               const {
//                   productName,
//                   category,
//                   price,
//                   quantityAvailable,
//                   discount,
//                   shortDescription,
//                   longDescription,
//                   ratings,
//                   ratingsInCount,
//                   tags,
//                   weight,
//               } = product;
//               const arr:any[] = [];
//               if(tags) {
//                   tags.forEach((tag:string) => {
//                       arr.push(JSON.stringify({name:tag}))
//                   });
//               }
  
//               const imageUrl = product?.image?.asset?.url || null;
  
//               let uploadedImageUrl: string | null = null;
  
//               // Upload image to Supabase Storage
//               if (imageUrl) {
//                   try {
//                       const imageResponse = await fetch(imageUrl);
//                       const imageBuffer = await imageResponse.arrayBuffer();
  
//                       // Extract file extension
//                       const fileExtension = imageUrl.split(".").pop()?.split("?")[0]?.toLowerCase() || "png";
//                       const contentType = contentTypeMap[fileExtension] || "image/png"; // Default to PNG
  
//                       // Generate unique file name
//                       const fileName = `uploads/${Date.now()}.${fileExtension}`;
  
//                       // Upload image to Supabase Storage
//                       const { data: uploadData, error: uploadError } = await supabase.storage
//                           .from("comforty-products-images")
//                           .upload(fileName, imageBuffer, {
//                               contentType,
//                           });
  
//                       if (uploadError) {
//                           console.error("Image Upload Failed:", uploadError.message);
//                           failedUploads.push({ productName, error: uploadError.message });
//                           continue;
//                       }
  
//                       uploadedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/comforty-products-images/${fileName}`;
//                   } catch (imgError: any) {
//                       console.error("Image Fetch Failed:", imgError.message);
//                       failedUploads.push({ productName, error: imgError.message });
//                       continue;
//                   }
//               }
  
//               // Prepare Supabase product data
//               const newProduct: SupabaseProduct = {
//                   name: productName,
//                   category,
//                   price,
//                   quantityAvailable,
//                   discount,
//                   short_description: shortDescription,
//                   long_description: JSON.stringify(longDescription), // Store as JSON string
//                   image: uploadedImageUrl,
//                   ratings,
//                   rating_count: ratingsInCount,
//                   // Tags: tags && tags.length > 0 ? JSON.stringify({name:tags}) : null, // Store as JSON string
//                   Tags: tags? arr: null, // Store as JSON string
//                   weight,
//               };
  
//               // Insert product into Supabase
//               const { error } = await supabase.from("Products").insert([newProduct]);
  
//               if (error) {
//                   console.error("Database Insert Failed:", error.message);   // error
//                   failedUploads.push({ productName, error: error.message });
//               } else {
//                   uploadedProducts.push({ productName, image: uploadedImageUrl });
//               }
//           }
  
//           // return NextResponse.json({ message: "Import completed", uploadedProducts, failedUploads }, { status: 200 });
// }

// const authenticate = async () => {
//   const auth = await supabase.auth.getUser();
//   if(auth.error) {
//     alert("Not authenticated");
//   }
//   await getData();
// }

// authenticate();
// },[]);

//   return (
//     <div>Import</div>
//   )
// }

// export default Import;



//-----------------------------------------------------------
// "use client";
// import { Product } from '@/@types/Product';
// import React, {useEffect, useState} from 'react';
// import { supabase } from '@/lib/supabaseClient';



// const ImportData = () => {
//   const [productFromSanity, setproductFromSanity] = useState<Product[]>([]);
//   const [productsFromSupabase, setproductsFromSupabase] = useState<any[]>([]);
//   const [newProducts, setnewProducts] = useState<any[]>([]);
//   const [creation, setcreation] = useState(true);

//   const getData = async () => {
//     try {
//       const response = await fetch("/api");
//       const data = await response.json();
//       console.log(data.message);
      
//       setproductFromSanity(data.message);
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   const fetchFromSupabase = async () => {
//     const response = await supabase.from("Products").select("*");
//     if(response.error) {
//       alert("Error in supabase fetch")
//     }
//     console.log(response.data);
    
//     // setproductsFromSupabase(response.data);
//     // return response.data
//   }

//   const auth = async () => {
//     const {data, error} = await supabase.auth.getUser();
//     if(error) {
//       alert("Error while fetching");
//     }
//     fetchFromSupabase();
//   }

//   useEffect(() => {
//     auth();
//     getData();
//   },[]);


//   return (
//     <div>
//       {
//         productFromSanity.map((product:Product, ind:number) => {
//           return <div key={ind}>{product.productName}</div>
//         })
//       }
//     </div>
//   )
// }

// export default ImportData



