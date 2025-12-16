import { ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  affiliateLink: string;
}

interface ShopThisLookProps {
  styleName: string;
}

// Placeholder products - these would come from an API or database in production
const getProductsForStyle = (style: string): Product[] => {
  const baseProducts: Product[] = [
    {
      id: "1",
      name: "Modern Accent Chair",
      category: "Furniture",
      price: "$349",
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300&h=300&fit=crop",
      affiliateLink: "#",
    },
    {
      id: "2",
      name: "Designer Floor Lamp",
      category: "Lighting",
      price: "$189",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop",
      affiliateLink: "#",
    },
    {
      id: "3",
      name: "Premium Wall Paint",
      category: "Paint",
      price: "$64/gallon",
      image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&h=300&fit=crop",
      affiliateLink: "#",
    },
    {
      id: "4",
      name: "Decorative Throw Pillows",
      category: "Decor",
      price: "$45/set",
      image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&h=300&fit=crop",
      affiliateLink: "#",
    },
    {
      id: "5",
      name: "Minimalist Side Table",
      category: "Furniture",
      price: "$179",
      image: "https://images.unsplash.com/photo-1499933374294-4584851497cc?w=300&h=300&fit=crop",
      affiliateLink: "#",
    },
    {
      id: "6",
      name: "Ceramic Vase Set",
      category: "Decor",
      price: "$89",
      image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=300&h=300&fit=crop",
      affiliateLink: "#",
    },
  ];

  return baseProducts;
};

export const ShopThisLook = ({ styleName }: ShopThisLookProps) => {
  const products = getProductsForStyle(styleName);

  return (
    <div className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-semibold">Shop This Look</h3>
        </div>
        <span className="text-sm text-muted-foreground">Curated for {styleName} style</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-3">
              <span className="text-xs text-primary font-medium uppercase tracking-wide">
                {product.category}
              </span>
              <h4 className="font-medium text-sm mt-1 line-clamp-2">{product.name}</h4>
              <p className="text-primary font-semibold mt-1">{product.price}</p>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full mt-2 text-xs"
              >
                <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                  Shop Now
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        * We may earn a commission from purchases made through these links
      </p>
    </div>
  );
};
