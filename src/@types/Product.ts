export interface Product {
    category:string;
    discount:number;
    image: {
        asset: {
            url:string;
            _id:string;
        }
    };
    longDescription:[
        {
            style:string;
            children:[
                {
                text:string;
            }
        ]
        }
    ];
    price:number;
    productName:string;
    quantityAvailable:number;
ratings:number;
ratingsInCount:number;
shortDescription:string;
weight:number;
_id:string;
tags:string[];
}