
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Welcome to Your Next.js App
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
          This is a clean starting point. Let's build something amazing together.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="#">Get Started</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
