import { useParams, Link } from "wouter";
import { useGetUser, useListBooks, useFollowUser, useUnfollowUser, getGetUserQueryKey, getListBooksQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Users, BookOpen, Crown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthorProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id, 10);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: author, isLoading: authorLoading } = useGetUser(userId, {
    query: { enabled: !isNaN(userId), queryKey: getGetUserQueryKey(userId) }
  });
  const { data: booksData, isLoading: booksLoading } = useListBooks({ authorId: userId }, {
    query: { enabled: !isNaN(userId), queryKey: getListBooksQueryKey({ authorId: userId }) }
  });

  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollow = () => {
    if (!isAuthenticated || !author) return;
    if (author.isFollowing) {
      unfollowMutation.mutate({ id: userId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId) }),
      });
    } else {
      followMutation.mutate({ id: userId }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetUserQueryKey(userId) }),
      });
    }
  };

  const books = booksData?.books ?? [];

  if (authorLoading) {
    return (
      <div className="container py-8 space-y-8">
        <div className="flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return <div className="container py-20 text-center text-muted-foreground">Author not found.</div>;
  }

  return (
    <div className="container py-8 space-y-10">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary shrink-0 border-2 border-primary/30">
          {author.username[0].toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{author.username}</h1>
            <p className="text-muted-foreground mt-1 max-w-xl">{author.bio || "No bio yet."}</p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-semibold">{author.followerCount.toLocaleString()}</span>
              <span className="text-muted-foreground">followers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-semibold">{author.bookCount}</span>
              <span className="text-muted-foreground">works</span>
            </div>
          </div>
          {isAuthenticated && (
            <Button
              variant={author.isFollowing ? "secondary" : "default"}
              className="gap-2"
              onClick={handleFollow}
            >
              <Users className="w-4 h-4" />
              {author.isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="text-xl font-bold">Published Works ({books.length})</h2>
        {booksLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-lg" />)}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No published works yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map(book => (
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
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs font-medium">{book.rating.toFixed(1)}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-1">{book.genre}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
