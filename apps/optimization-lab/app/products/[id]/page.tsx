import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductById } from "@/app/lib/mock-data";

// ISR - regenerate every 5 minutes for fresh pricing/inventory
export const revalidate = 300; // 5 minutes

// Generate static params for top products at build time
export async function generateStaticParams() {
  // In a real app, fetch top products
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
  ];
}

// Dynamic component for reviews (could be slow)
async function ProductReviews({ productId }: { productId: string }) {
  // Simulate slow API call
  await new Promise((resolve) => setTimeout(resolve, 800));

  const reviews = [
    {
      id: "1",
      author: "Sarah M.",
      rating: 5,
      comment: "Excellent product! Highly recommend.",
      date: "2024-01-20",
    },
    {
      id: "2",
      author: "John D.",
      rating: 4,
      comment: "Great quality, fast shipping.",
      date: "2024-01-18",
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customer Reviews</h3>
      {reviews.map((review) => (
        <div key={review.id} className="rounded-lg border p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="font-medium">{review.author}</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">
              {review.date}
            </span>
          </div>
          <p className="text-muted-foreground text-sm">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}

const ProductDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-muted/50">
        <div className="mx-auto max-w-7xl px-8 py-8">
          <Link href="/products">
            <Button className="mb-4" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square w-full overflow-hidden rounded-lg border"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-1 text-primary text-xs font-medium">
                  {product.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <p className="mt-2 text-muted-foreground">{product.description}</p>
            </div>

            <div className="space-y-4 rounded-lg border p-6">
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold">${product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="text-muted-foreground text-xl line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="rounded bg-red-500/10 px-2 py-1 text-red-600 text-sm font-medium dark:text-red-400">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Stock:</span>
                  <span
                    className={`font-medium ${
                      product.inStock ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.inStock
                      ? `${product.stock} available`
                      : "Out of Stock"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Last Updated:
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!product.inStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>

              <p className="text-muted-foreground text-xs">
                This page uses ISR - regenerated every 5 minutes for fresh
                pricing and inventory.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-muted px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section - Using Suspense for PPR-like behavior */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>
              Customer reviews (loaded dynamically)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Loading reviews...</p>
                </div>
              }
            >
              <ProductReviews productId={product.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default ProductDetailPage;

