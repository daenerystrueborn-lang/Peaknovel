import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetBook, useListChapters, useCreateChapter, useUpdateChapter, useDeleteChapter, useUpdateBook, getListChaptersQueryKey, getGetBookQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, BookOpen, Edit, Trash2, Crown, ChevronLeft, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function BookEditor() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id, 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState<number | null>(null);
  const [chapterForm, setChapterForm] = useState({ title: "", content: "", isPremium: false });

  const { data: book } = useGetBook(bookId, { query: { enabled: !isNaN(bookId), queryKey: getGetBookQueryKey(bookId) } });
  const { data: chapters = [], isLoading } = useListChapters(bookId, { query: { enabled: !isNaN(bookId), queryKey: getListChaptersQueryKey(bookId) } });

  const createMutation = useCreateChapter();
  const updateMutation = useUpdateChapter();
  const deleteMutation = useDeleteChapter();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListChaptersQueryKey(bookId) });
    queryClient.invalidateQueries({ queryKey: getGetBookQueryKey(bookId) });
  };

  const handleSaveChapter = () => {
    if (!chapterForm.title.trim() || !chapterForm.content.trim()) {
      toast({ title: "Title and content are required.", variant: "destructive" }); return;
    }
    if (editingChapter !== null) {
      updateMutation.mutate(
        { id: editingChapter, data: { title: chapterForm.title, content: chapterForm.content, isPremium: chapterForm.isPremium } },
        { onSuccess: () => { toast({ title: "Chapter updated!" }); setEditingChapter(null); invalidate(); } }
      );
    } else {
      createMutation.mutate(
        { bookId, data: { title: chapterForm.title, content: chapterForm.content, isPremium: chapterForm.isPremium } },
        {
          onSuccess: () => {
            toast({ title: "Chapter added!" });
            setShowAddChapter(false);
            setChapterForm({ title: "", content: "", isPremium: false });
            invalidate();
          }
        }
      );
    }
  };

  const openEdit = (ch: any) => {
    setChapterForm({ title: ch.title, content: "", isPremium: ch.isPremium });
    setEditingChapter(ch.id);
  };

  const handleDelete = (chapterId: number) => {
    if (!confirm("Delete this chapter?")) return;
    deleteMutation.mutate({ id: chapterId }, { onSuccess: () => { toast({ title: "Chapter deleted" }); invalidate(); } });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/write">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{book?.title ?? "Book Editor"}</h1>
          <p className="text-sm text-muted-foreground">{chapters.length} chapters</p>
        </div>
        <div className="ml-auto">
          <Button onClick={() => { setShowAddChapter(true); setChapterForm({ title: "", content: "", isPremium: false }); }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Chapter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-2xl space-y-4">
          <BookOpen className="h-14 w-14 mx-auto text-primary opacity-30" />
          <h3 className="font-semibold text-lg">No chapters yet</h3>
          <Button onClick={() => setShowAddChapter(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Write First Chapter
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border/50 rounded-xl border border-border/50 overflow-hidden">
          {chapters.map((ch, idx) => (
            <div key={ch.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
              <span className="text-sm text-muted-foreground w-8 shrink-0 text-right">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{ch.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {ch.isPremium && (
                    <span className="flex items-center gap-1 text-xs text-yellow-500">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                  {ch.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(ch.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => openEdit(ch)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(ch.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddChapter || editingChapter !== null} onOpenChange={open => { if (!open) { setShowAddChapter(false); setEditingChapter(null); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingChapter !== null ? "Edit Chapter" : "New Chapter"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Chapter Title *</Label>
              <Input
                placeholder="Chapter 1: The Beginning"
                value={chapterForm.title}
                onChange={e => setChapterForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea
                placeholder="Write your chapter here..."
                value={chapterForm.content}
                onChange={e => setChapterForm(f => ({ ...f, content: e.target.value }))}
                rows={16}
                className="resize-none font-serif"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
              <div>
                <p className="font-medium text-sm">Premium Chapter</p>
                <p className="text-xs text-muted-foreground">Only premium subscribers can read this chapter</p>
              </div>
              <Switch
                checked={chapterForm.isPremium}
                onCheckedChange={v => setChapterForm(f => ({ ...f, isPremium: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowAddChapter(false); setEditingChapter(null); }}>Cancel</Button>
            <Button onClick={handleSaveChapter} disabled={isSaving} className="gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : editingChapter !== null ? "Update Chapter" : "Publish Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
