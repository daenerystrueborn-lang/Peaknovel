import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListBooks, useCreateBook, useDeleteBook, useUpdateBook, getListBooksQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenTool, Plus, BookOpen, Eye, Star, Trash2, Edit, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const GENRES = ["Fantasy", "Romance", "Action", "Sci-Fi", "Horror", "Mystery", "Martial Arts", "Xianxia", "System", "Isekai", "Slice of Life", "Comedy"];

export default function WriteDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", synopsis: "", genre: "Fantasy", coverUrl: "", tags: "" });

  const { data: booksData, isLoading } = useListBooks(
    { authorId: user?.id },
    { query: { enabled: !!user?.id, queryKey: getListBooksQueryKey({ authorId: user?.id }) } }
  );

  const createMutation = useCreateBook();
  const deleteMutation = useDeleteBook();

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center space-y-4">
        <PenTool className="h-16 w-16 text-primary mx-auto opacity-50" />
        <h2 className="text-2xl font-bold">Sign in to Write</h2>
        <p className="text-muted-foreground">Create an account to start publishing your stories.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  const books = booksData?.books ?? [];

  const handleCreate = () => {
    if (!form.title.trim() || !form.genre) return;
    const tags = form.tags.split(",").map(t => t.trim()).filter(Boolean);
    createMutation.mutate(
      { data: { title: form.title, synopsis: form.synopsis, genre: form.genre, coverUrl: form.coverUrl || undefined, tags } },
      {
        onSuccess: () => {
          setShowCreate(false);
          setForm({ title: "", synopsis: "", genre: "Fantasy", coverUrl: "", tags: "" });
          queryClient.invalidateQueries({ queryKey: getListBooksQueryKey({ authorId: user?.id }) });
          toast({ title: "Book created!", description: "Start adding chapters to your new book." });
        },
        onError: () => toast({ title: "Error", description: "Failed to create book.", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBooksQueryKey({ authorId: user?.id }) });
        toast({ title: "Book deleted" });
      },
    });
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <PenTool className="w-8 h-8 text-primary" /> Writing Studio
          </h1>
          <p className="text-muted-foreground mt-1">Manage your published works</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Book
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}</div>
      ) : books.length === 0 ? (
        <div className="text-center py-24 space-y-4 border border-dashed rounded-2xl">
          <BookOpen className="h-16 w-16 text-primary mx-auto opacity-30" />
          <h3 className="text-xl font-semibold">No books yet</h3>
          <p className="text-muted-foreground">Write your first story and share it with the world.</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2 mt-2">
            <Plus className="w-4 h-4" /> Create Your First Book
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {books.map(book => (
            <Card key={book.id} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-5 flex gap-5 items-center">
                <div className="w-16 h-24 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-1 text-center">{book.title}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg truncate">{book.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                        <Badge variant="outline" className="text-xs">{book.genre}</Badge>
                        <span className="capitalize">{book.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{book.viewCount.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-primary text-primary" />
                      <span>{book.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" />
                      <span>{book.chapterCount} chapters</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/write/book/${book.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Edit className="w-3.5 h-3.5" /> Manage
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(book.id, book.title)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder="Your epic title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Genre *</Label>
              <Select value={form.genre} onValueChange={v => setForm(f => ({ ...f, genre: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENRES.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Synopsis</Label>
              <Textarea
                placeholder="What is your story about?"
                value={form.synopsis}
                onChange={e => setForm(f => ({ ...f, synopsis: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Cover Image URL</Label>
              <Input
                placeholder="https://..."
                value={form.coverUrl}
                onChange={e => setForm(f => ({ ...f, coverUrl: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="magic, adventure, isekai"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.title.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
