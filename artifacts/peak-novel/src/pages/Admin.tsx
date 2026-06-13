import { useState } from "react";
import { useGetAdminStats, useListAdminUsers, useListAdminBooks, useUpdateAdminUser, useUpdateAdminBook, useDeleteAdminUser, useDeleteAdminBook, getGetAdminStatsQueryKey, getListAdminUsersQueryKey, getListAdminBooksQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Users, BookOpen, MessageSquare, DollarSign, TrendingUp, Ban, Star, Eye, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"stats" | "users" | "books">("stats");
  const [userSearch, setUserSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({ query: { enabled: user?.role === "admin", queryKey: getGetAdminStatsQueryKey() } });
  const { data: usersData, isLoading: usersLoading } = useListAdminUsers(
    { q: userSearch },
    { query: { enabled: user?.role === "admin", queryKey: getListAdminUsersQueryKey({ q: userSearch }) } }
  );
  const { data: booksData, isLoading: booksLoading } = useListAdminBooks(
    { q: bookSearch },
    { query: { enabled: user?.role === "admin", queryKey: getListAdminBooksQueryKey({ q: bookSearch }) } }
  );

  const updateUserMutation = useUpdateAdminUser();
  const deleteUserMutation = useDeleteAdminUser();
  const updateBookMutation = useUpdateAdminBook();
  const deleteBookMutation = useDeleteAdminBook();

  if (user?.role !== "admin") {
    return (
      <div className="container py-20 text-center space-y-4">
        <Shield className="h-16 w-16 text-destructive mx-auto opacity-50" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to view this page.</p>
        <Link href="/"><Button variant="outline">Go Home</Button></Link>
      </div>
    );
  }

  const handleBanUser = (id: number, isBanned: boolean) => {
    updateUserMutation.mutate(
      { id, data: { isBanned: !isBanned } },
      {
        onSuccess: () => {
          toast({ title: isBanned ? "User unbanned" : "User banned" });
          queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
        }
      }
    );
  };

  const handleDeleteUser = (id: number) => {
    if (!confirm("Delete this user permanently?")) return;
    deleteUserMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "User deleted" });
        queryClient.invalidateQueries({ queryKey: getListAdminUsersQueryKey() });
      }
    });
  };

  const handleFeatureBook = (id: number, isFeatured: boolean) => {
    updateBookMutation.mutate(
      { id, data: { isFeatured: !isFeatured } },
      {
        onSuccess: () => {
          toast({ title: isFeatured ? "Book unfeatured" : "Book featured!" });
          queryClient.invalidateQueries({ queryKey: getListAdminBooksQueryKey() });
        }
      }
    );
  };

  const handleHideBook = (id: number, isHidden: boolean) => {
    updateBookMutation.mutate(
      { id, data: { isHidden: !isHidden } },
      {
        onSuccess: () => {
          toast({ title: isHidden ? "Book visible" : "Book hidden" });
          queryClient.invalidateQueries({ queryKey: getListAdminBooksQueryKey() });
        }
      }
    );
  };

  const STAT_CARDS = statsLoading ? [] : [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Total Books", value: stats?.totalBooks ?? 0, icon: BookOpen, color: "text-green-500" },
    { label: "Total Chapters", value: stats?.totalChapters ?? 0, icon: MessageSquare, color: "text-purple-500" },
    { label: "Premium Users", value: stats?.premiumUsers ?? 0, icon: Star, color: "text-yellow-500" },
    { label: "New Users Today", value: stats?.newUsersToday ?? 0, icon: TrendingUp, color: "text-primary" },
    { label: "Revenue", value: `$${((stats?.totalRevenue ?? 0) / 100).toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
  ];

  const users = usersData?.users ?? [];
  const books = booksData?.books ?? [];

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground text-sm">Manage the PeakNovel platform</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        {(["stats", "users", "books"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-border/50">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-muted/50 ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-4">
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="max-w-sm"
          />
          {usersLoading ? (
            <div className="space-y-2">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
              {users.map(u => (
                <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{u.username}</span>
                      {u.role === "admin" && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                      {u.isPremium && <Badge className="text-xs bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Premium</Badge>}
                      {u.isBanned && <Badge variant="destructive" className="text-xs">Banned</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.bookCount} books</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={u.isBanned ? "outline" : "ghost"}
                      className={u.isBanned ? "text-green-500" : "text-orange-500"}
                      onClick={() => handleBanUser(u.id, u.isBanned)}
                    >
                      {u.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={u.id === user?.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-10 text-center text-muted-foreground text-sm">No users found</div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "books" && (
        <div className="space-y-4">
          <Input
            placeholder="Search books..."
            value={bookSearch}
            onChange={e => setBookSearch(e.target.value)}
            className="max-w-sm"
          />
          {booksLoading ? (
            <div className="space-y-2">{Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (
            <div className="rounded-xl border border-border/50 overflow-hidden divide-y divide-border/50">
              {books.map((b: any) => (
                <div key={b.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                  <div className="w-10 h-14 rounded overflow-hidden bg-muted shrink-0">
                    {b.coverUrl && <img src={b.coverUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{b.title}</span>
                      {b.isFeatured && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Featured</Badge>}
                      {b.isHidden && <Badge variant="secondary" className="text-xs">Hidden</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{b.authorName}</span>
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{b.viewCount.toLocaleString()}</span>
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-primary text-primary" />{b.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={b.isFeatured ? "default" : "outline"}
                      className="text-xs h-8 px-2"
                      onClick={() => handleFeatureBook(b.id, b.isFeatured)}
                    >
                      {b.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-8 px-2"
                      onClick={() => handleHideBook(b.id, b.isHidden)}
                    >
                      {b.isHidden ? <Eye className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              ))}
              {books.length === 0 && (
                <div className="py-10 text-center text-muted-foreground text-sm">No books found</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
