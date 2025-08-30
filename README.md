## Supabase setup for comforty ecommerce:

Due to frequent down grading of sanity datasets and poor service. It has been decided to change approach for storage and remove sanity permenantly from ecommerce application. For now the project has to be converted to **Supabase** , an opensource firebase alternative.

<ul>
<li>Setup guide</li>
</ul>

## Setup guide :
Install supabase in nextjs project using following command.

``` bash
npm install @supabase/supabase-js
```

Then create a new configuration file in **@/lib/supabaseClient.ts** and paste the following configuration in it. 

``` javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

```

Create a .env file in root of project and configure the enviroment variables provided by supabase in dashboard.

``` bash
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY="annon key from "
```

get annon key and url from [there](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs) . Once configuration completed run your nextjs application.

## Fetching and manipulating data:
All the backkend configurations are already created in supabase dashboard. Just import supabase module in your files as:

``` javascript
import { supabase } from '@/lib/supabaseClient';
```

fetch the products using built in methods read the component below:

```javascript
import React from 'react'
import { supabase } from '@/lib/supabaseClient'

const Home = async () => {
  const response = await supabase.from("Products").select("*"); // select all columns
  const data = response.data; // getting actual data
  console.log(data); // testing incoming data ...

  return (
    <div>
      <ul>
        {
            // render products names as list items 
                  data?.map((product:any, index:number) => {
                    return <li key={index}>{product.name}</li>
                  })
        }
      </ul>
    </div>
  )
}

export default Home;

```
Supabase storage is already setup along withdata tables so use scripts and methods to upload images. Note that bucket has a folder named upload inside which are images located and to be fetched for manipulating in ecommerce. Read the following component below:

``` typescript
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function UploadImage() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Show preview before upload
    }
  };

  const uploadImage = async () => {
    if (!image) return alert("Please select an image");

    setUploading(true);
    const fileExt = image.name.split(".").pop();
    const filePath = `uploads/${Date.now()}.${fileExt}`; // Unique file name

    const { data, error } = await supabase.storage
      .from("comforty-products-images") // Your bucket name
      .upload(filePath, image);

    setUploading(false);

    if (error) {
      console.error("Upload Error:", error.message);
      return alert("Upload failed");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filePath);

    console.log("File uploaded:", urlData.publicUrl);
    alert("Image uploaded successfully!");
  };

  return (
    <div>
      <h2>Upload Image</h2>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && <img src={preview} alt="Preview" width={200} />}
      <button onClick={uploadImage} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
    </div>
  );
}

```


## Sanity to supabase Migration code

Create another route and paste that component in your page.tsx file . Run the development server . Whenever this component render , it'll fetch data from sanity, extracts images from it , upload these images while retrieving url and upload the complete data to supabase


```typescript
"use client";

import React, { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// type of product data coming from sanity project
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

// Define Supabase product type create a new table and fetch the demo data first and check incoming fields of objects
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

// Supported image formats to ensure all common formats should be acceptable while uploading image to supabase storage
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
        const sanityRes = await fetch(`http://localhost:3000/api`);  // first fetch the sanity data to an api endpoint then fetch the products from it
        const mockData = await sanityRes.json();
        const sanityData: SanityProduct[] = mockData.message;  // attach the array coming from api endpoint

        let failedUploads: { productName: string; error: string }[] = []; //____ array carrying failed products (if any)
        let uploadedProducts: { productName: string; image: string | null }[] = []; //____array carrying products to be uploaded

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

          const tagsFormatted = tags && tags.length > 0 ? tags.map(tag => JSON.stringify({ name: tag })) : null; // ensure tags is an array of json strings not object

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
```


Note : run other scripts to edit and update data .


Name: Muhammad affan
Roll number: 00223338
Phone: number: 0331-2861014
Email:affanamir903@gmail.com

*Assignments:*

General code: https://github.com/Web-Affan-Farooq/class-assignments-nextjsq2.git
Jewellery website : https://github.com/Web-Affan-Farooq/Jewellery-Website.git

Class assignment-1: https://class-assignments-gamma.vercel.app/
Class assignment-2: https://class-assignments-3de8.vercel.app/
Class assignment-3: https://class-assignments-fiyo.vercel.app/
Class assingment-4: https://docs.google.com/presentation/d/18ukW7IWffghwqOwFVkQZqJA4YiQUc3hdk1VtOcl7Qdk/edit#slide=id.g311fdabf8e9_0_0
Class assignment-5 (Jewellery website): https://jewellery-website-delta.vercel.app/
Class assignmet-6: https://assignment-6-omega-three.vercel.app/
Class assignment-7: https://assignment-7-cyan.vercel.app/
Class assignment-8: https://personal-blog-seven-gamma.vercel.app/


*NextJS Milestone-1*:
Code : 
Nextjs milestone-1: completed installation;
NextJS milestone-1 (project): developed simple styled components and integrated in into app (no deployment required for this)

*NextJs milestone-2*:
Assignment-1: Build a simple multi-page website using React components.
- Apply Custom CSS to style the website, ensuring responsiveness ()
code: https://github.com/Web-Affan-Farooq/nextjs-milestone-2
vercel : https://nextjs-milestone-2-customcss-l3c15nvbg.vercel.app/

Project-1: Profolio with custom css:
Link: my-portfolio-bq2cn6dsg-muhammad-affans-projects-225eb4b7.vercel.app

Project-2 Portfolio with tailwindcss:
Link: my-portfolio-bq2cn6dsg-muhammad-affans-projects-225eb4b7.vercel.app


*NextJs milestone-3:*
Code : https://github.com/Web-Affan-Farooq/nextjs-milestone-3.git

Assignment : blog app and comment section:
Link : https://blog-application-comment-section.vercel.app/

Project: Ecommerce with add to cart:
Link: https://nike-react-mocha.vercel.app/

*NextJS Milestone-4:*

Code : https://github.com/Web-Affan-Farooq/nextjs-milestone-4.git

Assignments: Fetching data using SSG, ISG, SSR utilizing cache capabilities of nextjs.
Link : 

Project: Blogger.com full stack blogging platform:
Link: https://bloggercom.vercel.app/


Hackathon-1 Resume builder application using html css and typescript:

Code: https://github.com/Web-Affan-Farooq/Hackathon-1-

Milestone-1 and milestone-2: https://hackathon-1-milestone-1and2.netlify.app/
Milestone-3: https://hackathon-1-milestone-3.netlify.app/
MileStone-4: https://hackathon-1-milestone-4.netlify.app/
Milestone-5: https://willowy-starburst-eb23a1.netlify.app/


Hackathon-2: 

Code: https://github.com/Web-Affan-Farooq/nextjs-uiux-hackathon.git
Link: https://nextjs-hackathon-giaic-fkdh36zoe.vercel.app/


*Hackathon-3:*

Code (contains all the required documentation):https://github.com/Web-Affan-Farooq/nextjs-uiux-hackathon.git

Application Link : https://nextjs-hackathon-giaic-fkdh36zoe.vercel.app/
Dashboard Link :https://nextjs-uiux-hackathon-lovat.vercel.app/

*30 days coding challenge (Practice NextJS)*:
Code : https://github.com/Web-Affan-Farooq/30days-challenge.git
Code: https://github.com/Web-Affan-Farooq/30-days-challenge-p2.git

Movie search application: https://movie-search-app-omega-wheat.vercel.app/
Password generator: https://password-generator-red-seven.vercel.app/
Random user generator app: https://random-user-generator-rosy.vercel.app/
Countdown timer : https://countdown-timer-lilac-one.vercel.app/
Number guessing game: https://number-guessing-game-beryl.vercel.app/
Todo list application: https://personal-todolist-chi.vercel.app/
BMI calculator app : https://bmi-calculator-lemon-ten.vercel.app/
Digital clock app : https://digital-clock-app-blond.vercel.app/
Random joke generator : https://random-joke-generator-olive.vercel.app/
Weather app : https://weather-app-puce-nu-45.vercel.app/
Tip calculator app : https://tip-calculator-pink-two.vercel.app/
HTML previewer app : https://html-previewer-one.vercel.app/
Calculator : https://calculator-lilac-delta.vercel.app/