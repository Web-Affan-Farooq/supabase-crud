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
