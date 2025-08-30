import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import type { NextRequest } from "next/server";

// Define product types
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

export async function GET() {
    try {
        // Fetch data from Sanity API
        const sanityRes = await fetch(`http://localhost:3000/api`);
        const mockData = await sanityRes.json();
        const sanityData: SanityProduct[] = mockData.message;

        if (!sanityData || sanityData.length === 0) {
            return NextResponse.json({ error: "No data found from Sanity" }, { status: 404 });
        }

        let failedUploads: { productName: string; error: string }[] = [];
        let uploadedProducts: { productName: string; image: string | null }[] = [];

        for (const product of sanityData) {
            // Extract product data
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
            const arr:any[] = [];
            if(tags) {
                tags.forEach((tag:string) => {
                    arr.push(JSON.stringify({name:tag}))
                });
            }

            const imageUrl = product?.image?.asset?.url || null;

            let uploadedImageUrl: string | null = null;

            // Upload image to Supabase Storage
            if (imageUrl) {
                try {
                    const imageResponse = await fetch(imageUrl);
                    const imageBuffer = await imageResponse.arrayBuffer();

                    // Extract file extension
                    const fileExtension = imageUrl.split(".").pop()?.split("?")[0]?.toLowerCase() || "png";
                    const contentType = contentTypeMap[fileExtension] || "image/png"; // Default to PNG

                    // Generate unique file name
                    const fileName = `uploads/${Date.now()}.${fileExtension}`;

                    // Upload image to Supabase Storage
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from("comforty-products-images")
                        .upload(fileName, imageBuffer, {
                            contentType,
                        });

                    if (uploadError) {
                        console.error("Image Upload Failed:", uploadError.message);
                        failedUploads.push({ productName, error: uploadError.message });
                        continue;
                    }

                    uploadedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/comforty-products-images/${fileName}`;
                } catch (imgError: any) {
                    console.error("Image Fetch Failed:", imgError.message);
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
                long_description: JSON.stringify(longDescription), // Store as JSON string
                image: uploadedImageUrl,
                ratings,
                rating_count: ratingsInCount,
                // Tags: tags && tags.length > 0 ? JSON.stringify({name:tags}) : null, // Store as JSON string
                Tags: tags? arr: null, // Store as JSON string
                weight,
            };

            // Insert product into Supabase
            const { error } = await supabase.from("Products").insert([newProduct]);

            if (error) {
                console.error("Database Insert Failed:", error.message);   // error
                failedUploads.push({ productName, error: error.message });
            } else {
                uploadedProducts.push({ productName, image: uploadedImageUrl });
            }
        }

        return NextResponse.json({ message: "Import completed", uploadedProducts, failedUploads }, { status: 200 });
    } catch (error: any) {
        console.error("Error importing data:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
