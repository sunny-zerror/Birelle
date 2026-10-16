export interface SiteRoute {
  path: string;
  label?: string;
  title: string;
  description: string;
  priority: number;
}

export type ProductCategory = "tees" | "bottoms" | "shorts";

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  price: number;
  href: string;
  image: string; // packshot on hanger
  featured: string; // model shot
  colour: string;
  description: string;
  isNew?: boolean;
  pairsWith?: string; // product id shown in "Complete the look"
}
