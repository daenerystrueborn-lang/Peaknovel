import { useState } from "react";
import { Link } from "wouter";
import { useGetLibrary, useGetReadingHistory, getGetLibraryQueryKey, getGetReadingHistoryQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BookMarked, History, Crown, Star, BookOpen, Clock } from "lucide-react";

export default function Library() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"bookmarks" | "history">("bookmarks");

  const { data: bookmarks = [], isLoading: bookmarksLoading } = useGetLibrary({
    query: { enabled: isAuthenticated, queryKey: getGetLibraryQueryKey() }
  });
  const { data: history = [], isLoading: historyLoading } = useGetReadingHistory({
    query: { enabled: isAuthenticated, queryKey: getGetReadingHistoryQueryKey() }
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center space-y-4">
        <BookMarked className="h-16 w-16 text-primary mx-auto opacity-50" />
        <h2 className="text-2xl font-bold">Your Library</h2>
        <p className="text-muted-foreground">Sign in to access your bookmarks and reading history.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Library</h1>
        <p className="text-muted-foreground mt-1">Your personal reading collection</p>
      </div>

      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        <button
          onClick={() => setTab("bookmarks")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "bookmarks" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <BookMarked className="w-4 h-4" /> Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "history" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <History className="w-4 h-4" /> History ({history.length})
        </button>
      </div>

      {tab === "bookmarks" && (
        bookmarksLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-lg" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl space-y-3">
            <BookMarked className="h-14 w-14 mx-auto text-primary opacity-30" />
            <h3 className="font-semibold text-lg">No bookmarks yet</h3>
            <p className="text-muted-foreground text-sm">Bookmark novels to keep track of your reading list.</p>
            <Link href="/browse"><Button variant="outline" className="mt-2">Browse Novels</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {bookmarks.map((book: any) => (
              <Link key={book.id} href={`/book/${book.id}`} className="group block">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-3 border border-border/50 transition-transform group-hover:-translate-y-1 duration-200">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">{book.title}</div>
                  )}
                  {book.isPremium && (
                    <div className="absolute top-1.5 right-1.5 bg-black/70 text-yellow-400 p-1 rounded-full">
                      <Crown className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1">{book.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{book.authorName}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs">{book.rating.toFixed(1)}</span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}

      {tab === "history" && (
        historyLoading ? (
          <div className="space-y-3">{Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        ) : history.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-2xl space-y-3">
            <History className="h-14 w-14 mx-auto text-primary opacity-30" />
            <h3 className="font-semibold text-lg">No reading history</h3>
            <p className="text-muted-foreground text-sm">Your reading progress will appear here.</p>
            <Link href="/browse"><Button variant="outline" className="mt-2">Start Reading</Button></Link>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item: any, i: number) => (
              <Link key={i} href={`/book/${item.bookId}/chapter/${item.chapterId}`}>
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-colors cursor-pointer">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.bookTitle}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{item.chapterTitle}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(item.readAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
