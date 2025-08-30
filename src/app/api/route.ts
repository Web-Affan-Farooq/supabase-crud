import sanityClient from "@/lib/sanityClient";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const getData = async () => {
    const q = `    *[_type == "product"]{
  _id,
  tags,
  image {
    asset -> {
      url,
      _id,
    }
  },
  productName,
  shortDescription,
  longDescription[]{
    style,
    children[] {
      text,
    }
  },
  category,  
  price,
  discount,
  ratings,
  ratingsInCount,
  quantityAvailable,
  warranty,
  weight,
  tags,
  }`;

  const response = await sanityClient.fetch(q);
  return response;
}

export const GET = async(req:NextRequest) => {
    
    const data = await getData();
    return NextResponse.json({message:data});
}