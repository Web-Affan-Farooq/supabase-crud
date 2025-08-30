import React from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image';

const Home = async () => {
  const response = await supabase.from("Products").select("*");
  const data = response.data;
  console.log(data);
  return (
    <div>
      <ul>
        {
                  data?.map((product:any, index:number) => {
                    return <li key={index}>{product.name}</li>
                  })
        }
        {
                  data?.map((product:any, index:number) => {
                    if(product.image) {
                      return <Image src={product.image} alt={product.name} width={100} height={100} key={index}/>
                    } else {
                      return <div key={index}></div>
                    }
                  })
        }
        
      </ul>
    </div>
  )
}

export default Home;
