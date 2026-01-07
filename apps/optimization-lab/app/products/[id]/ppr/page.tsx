import { Button } from "@repo/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/design-system/components/ui/card";
import { ArrowLeft, ShoppingCart, Star, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductById } from "@/app/lib/mock-data";

// PPR - Partial Pre-Rendering
// Static parts are pre-rendered, dynamic parts stream in

// Static content - pre-rendered at build time
async function getStaticProductInfo(id: string) {
  const product = getProductById(id);
  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    image: product.image,
    images: product.images,
    category: product.category,
    tags: product.tags,
  };
}

// Dynamic content - rendered on demand (simulates slow API)
async function getDynamicProductData(id: string) {
  // Simulate slow API call (pricing, inventory, recommendations)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const product = getProductById(id);
  if (!product) return null;

  return {
    price: product.price,
    originalPrice: product.originalPrice,
    inStock: product.inStock,
    stock: product.stock,
    rating: product.rating,
    reviewCount: product.reviewCount,
    updatedAt: product.updatedAt,
    // Simulated recommendations
    recommendations: [
      getProductById("2"),
      getProductById("4"),
    ].filter(Boolean),
  };
}

// Dynamic reviews component
async function ProductReviews({ productId }: { productId: string }) {
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
    {
      id: "3",
      author: "Emily R.",
      rating: 5,
      comment: "Perfect! Exceeded my expectations.",
      date: "2024-01-15",
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

const PPRProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  // Static content - available immediately
  const staticInfo = await getStaticProductInfo(id);

  if (!staticInfo) {
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
          <div className="rounded-lg bg-blue-500/10 p-4">
            <p className="font-semibold text-blue-600 dark:text-blue-400">
              PPR Demo: Static content loads immediately, dynamic content
              streams in (using Suspense boundaries)
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Static Images - Pre-rendered */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
              <Image
                src={staticInfo.image}
                alt={staticInfo.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {staticInfo.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square w-full overflow-hidden rounded-lg border"
                >
                  <Image
                    src={img}
                    alt={`${staticInfo.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info - Static + Dynamic */}
          <div className="space-y-6">
            {/* Static Info - Available Immediately */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-primary/10 px-2 py-1 text-primary text-xs font-medium">
                  {staticInfo.category}
                </span>
              </div>
              <h1 className="text-4xl font-bold">{staticInfo.name}</h1>
              <p className="mt-2 text-muted-foreground">
                {staticInfo.description}
              </p>
            </div>

            {/* Dynamic Pricing/Stock - Streams In */}
            <Suspense
              fallback={
                <div className="flex items-center justify-center rounded-lg border p-8">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">
                    Loading pricing and inventory...
                  </span>
                </div>
              }
            >
              <DynamicProductInfo productId={id} />
            </Suspense>

            {/* Static Tags */}
            <div className="space-y-2">
              <h3 className="font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {staticInfo.tags.map((tag) => (
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

        {/* Dynamic Reviews - Streams In */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>
              Customer reviews (loaded dynamically with Suspense)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground">
                    Loading reviews...
                  </span>
                </div>
              }
            >
              <ProductReviews productId={id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

// Dynamic component for pricing/inventory
async function DynamicProductInfo({ productId }: { productId: string }) {
  const dynamicData = await getDynamicProductData(productId);

  if (!dynamicData) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div className="flex items-baseline gap-4">
        <span className="text-4xl font-bold">${dynamicData.price}</span>
        {dynamicData.originalPrice && (
          <>
            <span className="text-muted-foreground text-xl line-through">
              ${dynamicData.originalPrice}
            </span>
            <span className="rounded bg-red-500/10 px-2 py-1 text-red-600 text-sm font-medium dark:text-red-400">
              {Math.round(
                ((dynamicData.originalPrice - dynamicData.price) /
                  dynamicData.originalPrice) *
                  100
              )}
              % OFF
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{dynamicData.rating}</span>
        <span className="text-muted-foreground text-sm">
          ({dynamicData.reviewCount} reviews)
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Stock:</span>
          <span
            className={`font-medium ${
              dynamicData.inStock ? "text-green-600" : "text-red-600"
            }`}
          >
            {dynamicData.inStock
              ? `${dynamicData.stock} available`
              : "Out of Stock"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Last Updated:</span>
          <span className="text-muted-foreground text-sm">
            {new Date(dynamicData.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <Button className="w-full" size="lg" disabled={!dynamicData.inStock}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        {dynamicData.inStock ? "Add to Cart" : "Out of Stock"}
      </Button>

      <p className="text-muted-foreground text-xs">
        This pricing and inventory data streams in dynamically. The product
        info above was pre-rendered.
      </p>
    </div>
  );
}

export default PPRProductPage;

