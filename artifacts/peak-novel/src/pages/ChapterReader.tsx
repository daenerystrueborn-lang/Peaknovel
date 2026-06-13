import { useParams, Link } from "wouter";
import { useGetChapter, useListComments, useCreateComment, useLikeComment, useDeleteComment } from "@workspace/api-client-react";
import { getListCommentsQueryKey, getGetChapterQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, ChevronLeft, ChevronRight, Heart, Trash2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function ChapterReader() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const bookId = parseInt(id, 10);
  const chId = parseInt(chapterId, 10);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: chapter, isLoading } = useGetChapter(chId, {
    query: { enabled: !isNaN(chId), queryKey: getGetChapterQueryKey(chId) }
  });
  const { data: comments = [] } = useListComments(chId, {
    query: { enabled: !isNaN(chId), queryKey: getListCommentsQueryKey(chId) }
  });

  const createCommentMutation = useCreateComment();
  const likeCommentMutation = useLikeComment();
  const deleteCommentMutation = useDeleteComment();

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!isAuthenticated) { toast({ title: "Sign in required" }); return; }
    createCommentMutation.mutate(
      { chapterId: chId, data: { content: comment } },
      {
        onSuccess: () => {
          setComment("");
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(chId) });
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error || "Failed to post comment";
          toast({ title: "Error", description: msg, variant: "destructive" });
        }
      }
    );
  };

  const handleLike = (commentId: number) => {
    if (!isAuthenticated) return;
    likeCommentMutation.mutate({ id: commentId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(chId) }),
    });
  };

  const handleDelete = (commentId: number) => {
    deleteCommentMutation.mutate({ id: commentId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(chId) }),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="space-y-3">
          {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <Crown className="h-16 w-16 text-yellow-500 mx-auto" />
        <h2 className="text-2xl font-bold">Premium Chapter</h2>
        <p className="text-muted-foreground">This chapter requires a Premium subscription.</p>
        <Link href="/premium">
          <Button className="gap-2"><Crown className="w-4 h-4" /> Upgrade to Premium</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div className="space-y-2 text-center">
        <Link href={`/book/${bookId}`} className="text-sm text-muted-foreground hover:text-primary">
          ← Back to book
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">{chapter.title}</h1>
        {chapter.isPremium && (
          <div className="inline-flex items-center gap-1.5 text-yellow-500 text-sm">
            <Crown className="w-4 h-4" /> Premium Chapter
          </div>
        )}
      </div>

      <div className="adsense-slot w-full h-[90px] bg-muted/30 flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded-lg" data-ad-slot="chapter-banner">
        Advertisement
      </div>

      <div className="prose prose-lg max-w-none dark:prose-invert prose-p:leading-8 prose-p:text-base prose-p:text-foreground">
        {chapter.content.split("\n").filter(Boolean).map((para, i) => (
          <p key={i} className="mb-5 leading-8 text-foreground/90">{para}</p>
        ))}
      </div>

      <div className="flex justify-between pt-8 border-t border-border/50">
        {chapter.prevChapterId ? (
          <Link href={`/book/${bookId}/chapter/${chapter.prevChapterId}`}>
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
          </Link>
        ) : <div />}
        {chapter.nextChapterId ? (
          <Link href={`/book/${bookId}/chapter/${chapter.nextChapterId}`}>
            <Button className="gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        ) : (
          <Link href={`/book/${bookId}`}>
            <Button variant="outline">Back to book</Button>
          </Link>
        )}
      </div>

      <div className="space-y-6 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
        </div>

        {isAuthenticated && (
          <form onSubmit={handleComment} className="space-y-3">
            <Textarea
              placeholder="Share your thoughts on this chapter..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={createCommentMutation.isPending || !comment.trim()}>
                {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        )}

        {!isAuthenticated && (
          <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
            <Link href="/login" className="text-primary hover:underline">Sign in</Link> to leave a comment
          </div>
        )}

        <div className="space-y-4">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="text-xs bg-primary/20 text-primary">
                  {c.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.username}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{c.content}</p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleLike(c.id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${c.isLiked ? "fill-primary text-primary" : ""}`} />
                    {c.likes > 0 && <span>{c.likes}</span>}
                  </button>
                  {user?.id === c.userId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No comments yet. Be the first!</p>
          )}
        </div>
      </div>
    </div>
  );
}
