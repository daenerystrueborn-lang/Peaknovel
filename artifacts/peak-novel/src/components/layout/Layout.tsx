import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Link } from "wouter";
import { BookOpen, Github, Twitter } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 py-14 bg-muted/20 mt-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg tracking-tight">PeakNovel</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The home for web novel readers and writers. Discover epic stories or share your own.
              </p>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-sm">Discover</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><Link href="/browse" className="hover:text-foreground transition-colors">Browse Novels</Link></div>
                <div><Link href="/browse?sort=trending" className="hover:text-foreground transition-colors">Trending</Link></div>
                <div><Link href="/browse?sort=rating" className="hover:text-foreground transition-colors">Top Rated</Link></div>
                <div><Link href="/browse?sort=new" className="hover:text-foreground transition-colors">New Releases</Link></div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-sm">Write</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><Link href="/write" className="hover:text-foreground transition-colors">Writing Studio</Link></div>
                <div><Link href="/register" className="hover:text-foreground transition-colors">Create Account</Link></div>
                <div><Link href="/premium" className="hover:text-foreground transition-colors">Premium</Link></div>
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-sm">Account</p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></div>
                <div><Link href="/library" className="hover:text-foreground transition-colors">My Library</Link></div>
                <div><Link href="/settings" className="hover:text-foreground transition-colors">Settings</Link></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} PeakNovel. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
