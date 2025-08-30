"use client";

import React, { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient';
import { Product } from '@/@types/Product';

const fetchIDs = async () => {
    let arrayOfIds:number[] = [];
    const response = await supabase.from("Products").select("id");
    const {data} = response;
    data?.forEach((obj:any) => {
        arrayOfIds.push(obj.id)
    });
    console.log(arrayOfIds)
}

const updateData = async () => {
    const sanityApiResponse = await fetch("/api");
    const ids = await fetchIDs();
    const {message}:{message:Product[]} = await sanityApiResponse.json();
}

const Edit = () => {
    useEffect(() => {
        const authenticate = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                alert("Error in authentication. Letting you sign in");
            }
            // updateData();
            // fetchIDs();
        }
        authenticate();
    }, []);
    return (
        <div>Edit</div>
    )
}

export default Edit;