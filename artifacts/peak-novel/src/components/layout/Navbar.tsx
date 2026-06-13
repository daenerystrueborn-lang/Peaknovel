import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { useLogout, useListNotifications, useMarkAllNotificationsRead, useDeleteNotification, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { BookOpen, Search, PenTool, BookMarked, Shield, Sun, Moon, Menu, Crown, Bell, BellRing, MessageSquare, Heart, UserPlus, Bookmark, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  if (type === "comment") return <MessageSquare className={`${cls} text-blue-400`} />;
  if (type === "bookmark") return <Bookmark className={`${cls} text-yellow-400`} />;
  if (type === "follow") return <UserPlus className={`${cls} text-green-400`} />;
  return <Bell className={`${cls} text-primary`} />;
}

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useListNotifications({ query: { enabled: isAuthenticated, refetchInterval: 30000, queryKey: getListNotificationsQueryKey() } });
  const markAllMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleOpen = (val: boolean) => {
    setOpen(val);
    if (val && unreadCount > 0) {
      markAllMutation.mutate(undefined, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
      });
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
    });
  };

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          {unreadCount > 0 ? <BellRing className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4" />}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0" forceMount>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="font-semibold text-sm">Notifications</p>
          {notifications.length > 0 && (
            <button
              onClick={() => {
                markAllMutation.mutate(undefined, {
                  onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() }),
                });
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-10 text-center">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors group ${!n.isRead ? "bg-primary/5" : ""}`}
                >
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-full bg-muted">
                    <NotificationIcon type={n.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-tight ${!n.isRead ? "text-foreground" : "text-foreground/80"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, n.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive shrink-0 mt-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const { user, isAuthenticated, refetch } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const logoutMutation = useLogout();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { refetch(); setMobileOpen(false); },
    });
  };

  const navLinks = [
    { href: "/browse", label: "Browse" },
    { href: "/premium", label: "Premium" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg tracking-tight hidden sm:inline-block">PeakNovel</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className={`transition-colors hover:text-primary ${location === l.href ? "text-primary" : "text-muted-foreground"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          <Link href="/browse">
            <Button variant="ghost" size="icon" className="shrink-0"><Search className="h-4 w-4" /></Button>
          </Link>

          <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <NotificationBell />

          {isAuthenticated ? (
            <>
              <Link href="/write" className="hidden sm:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <PenTool className="h-4 w-4" /> Write
                </Button>
              </Link>
              <Link href="/library" className="hidden sm:block">
                <Button variant="ghost" size="icon"><BookMarked className="h-4 w-4" /></Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.username} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                        {user?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-3 p-3 border-b border-border">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={user?.avatar || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        {user?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-none min-w-0">
                      <p className="font-semibold text-sm truncate">{user?.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  {user?.isPremium && (
                    <div className="px-3 py-2 flex items-center gap-1.5 text-xs text-yellow-500">
                      <Crown className="w-3.5 h-3.5" /> Premium Member
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/author/${user?.id}`} className="cursor-pointer">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/library" className="cursor-pointer">My Library</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/write" className="cursor-pointer">
                      <PenTool className="w-4 h-4 mr-2" /> Writing Studio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">Settings</Link>
                  </DropdownMenuItem>
                  {!user?.isPremium && (
                    <DropdownMenuItem asChild>
                      <Link href="/premium" className="cursor-pointer text-primary">
                        <Crown className="w-4 h-4 mr-2" /> Upgrade to Premium
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="w-4 h-4 mr-2 text-primary" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:text-destructive">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
              <Link href="/register"><Button size="sm">Sign Up</Button></Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 p-4 border-b border-border">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-bold">PeakNovel</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                  {isAuthenticated && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-4">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user?.avatar || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-semibold">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{user?.username}</p>
                        {user?.isPremium && <p className="text-xs text-yellow-500 flex items-center gap-1"><Crown className="w-3 h-3" /> Premium</p>}
                      </div>
                    </div>
                  )}
                  {navLinks.map(l => (
                    <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                      {l.label}
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <>
                      <Link href="/write" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                        <PenTool className="w-4 h-4 text-primary" /> Writing Studio
                      </Link>
                      <Link href="/library" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                        <BookMarked className="w-4 h-4 text-primary" /> My Library
                      </Link>
                      <Link href={`/author/${user?.id}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                        My Profile
                      </Link>
                      <Link href="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-muted transition-colors">
                        Settings
                      </Link>
                      {user?.role === "admin" && (
                        <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium hover:bg-muted text-primary transition-colors">
                          <Shield className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                    </>
                  )}
                </div>
                <div className="p-4 border-t border-border space-y-2">
                  <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-full justify-start gap-3">
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </Button>
                  {isAuthenticated ? (
                    <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full">Log out</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                        <Button size="sm" className="w-full">Sign Up</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
