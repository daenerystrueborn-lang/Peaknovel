import { useParams, Link } from "wouter";
import { useGetBook, useListChapters, useToggleBookmark, useRateBook, useFollowUser, useUnfollowUser, getGetBookQueryKey, getListChaptersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Bookmark, BookmarkCheck, Eye, BookOpen, Users, Crown, Lock, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id, 10);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: book, isLoading: bookLoading } = useGetBook(bookId, {
    query: { enabled: !isNaN(bookId), queryKey: getGetBookQueryKey(bookId) }
  });
  const { data: chapters = [], isLoading: chaptersLoading } = useListChapters(bookId, {
    query: { enabled: !isNaN(bookId), queryKey: getListChaptersQueryKey(bookId) }
  });

  const bookmarkMutation = useToggleBookmark();
  const rateMutation = useRateBook();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleBookmark = () => {
    if (!isAuthenticated) { toast({ title: "Sign in required", description: "Sign in to bookmark this book." }); return; }
    bookmarkMutation.mutate({ id: bookId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) }),
    });
  };

  const handleRate = (rating: number) => {
    if (!isAuthenticated) { toast({ title: "Sign in required", description: "Sign in to rate this book." }); return; }
    setUserRating(rating);
    rateMutation.mutate({ id: bookId, data: { score: rating } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) }),
    });
  };

  const handleFollow = () => {
    if (!isAuthenticated || !book) return;
    if (book.isFollowingAuthor) {
      unfollowMutation.mutate({ id: book.authorId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) }),
      });
    } else {
      followMutation.mutate({ id: book.authorId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) }),
      });
    }
  };

  if (bookLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-48 h-72 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-3"><Skeleton className="h-10 w-32" /><Skeleton className="h-10 w-32" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return <div className="container py-20 text-center text-muted-foreground">Book not found.</div>;
  }

  const firstChapter = chapters[0];
  const statusColor = book.status === "completed" ? "text-green-500" : book.status === "hiatus" ? "text-yellow-500" : "text-blue-500";

  return (
    <div className="container py-8 space-y-10">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="shrink-0 flex flex-col items-center gap-4">
          <div className="w-48 h-72 rounded-xl overflow-hidden border border-border shadow-xl relative">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground p-4 text-center">{book.title}</div>
            )}
            {book.isPremium && (
              <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 p-1.5 rounded-full">
                <Crown className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full">
            {firstChapter && (
              <Link href={`/book/${bookId}/chapter/${firstChapter.id}`}>
                <Button className="w-full gap-2">
                  <BookOpen className="w-4 h-4" /> Read Now
                </Button>
              </Link>
            )}
            <Button variant={book.isBookmarked ? "default" : "outline"} className="w-full gap-2" onClick={handleBookmark}>
              {book.isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              {book.isBookmarked ? "Bookmarked" : "Bookmark"}
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="capitalize">{book.genre}</Badge>
              <span className={`text-xs font-medium capitalize ${statusColor}`}>{book.status}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{book.title}</h1>
            <Link href={`/author/${book.authorId}`} className="text-muted-foreground hover:text-primary transition-colors text-sm">
              by {book.authorName}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold">{book.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">({(book.ratingCount ?? 0).toLocaleString()} ratings)</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{book.viewCount.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              <span>{book.chapterCount} chapters</span>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{book.synopsis}</p>

          {book.tags && book.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">Rate this book</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star className={`w-6 h-6 ${rating <= (hoveredRating || userRating) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {book.authorName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{book.authorName}</p>
                <p className="text-xs text-muted-foreground">{(book.authorFollowers ?? 0).toLocaleString()} followers</p>
              </div>
            </div>
            <Button size="sm" variant={book.isFollowingAuthor ? "secondary" : "outline"} onClick={handleFollow} className="ml-auto">
              <Users className="w-4 h-4 mr-1.5" />
              {book.isFollowingAuthor ? "Following" : "Follow"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Chapters ({chapters.length})</h2>
        {chaptersLoading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl">
            <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>No chapters yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 rounded-xl border border-border/50 overflow-hidden">
            {chapters.map((ch, idx) => (
              <Link key={ch.id} href={ch.isPremium && !user?.isPremium ? "/premium" : `/book/${bookId}/chapter/${ch.id}`}>
                <div className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <span className="text-sm text-muted-foreground w-8 shrink-0 text-right">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{ch.title}</p>
                    {ch.createdAt && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(ch.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {ch.isPremium && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                    {ch.isPremium && !user?.isPremium && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
