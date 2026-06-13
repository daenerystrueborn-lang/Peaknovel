import { useState, useEffect } from "react";
import { useUpdateMe } from "@workspace/api-client-react";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, User, Crown, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function Settings() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio((user as any).bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const updateMutation = useUpdateMe();

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center space-y-4">
        <SettingsIcon className="h-16 w-16 text-primary mx-auto opacity-50" />
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Sign in to manage your account settings.</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(
      { data: { username: username || undefined, bio: bio || undefined, avatar: avatar || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Settings saved!" });
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        },
        onError: () => toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="container py-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Profile</CardTitle>
          <CardDescription>Update your public profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={avatar || undefined} />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="font-medium">{user?.username}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs capitalize">{user?.role}</Badge>
                {user?.isPremium && <Badge className="text-xs bg-yellow-500/20 text-yellow-500 border-yellow-500/30"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" maxLength={30} />
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell readers about yourself..."
              rows={3}
              maxLength={300}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
          </div>

          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." />
          </div>

          <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look of PeakNovel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              <div>
                <p className="font-medium">{theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
                <p className="text-xs text-muted-foreground">Currently using {theme} theme</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              Switch to {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {!user?.isPremium && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="font-semibold">Upgrade to Premium</p>
                <p className="text-sm text-muted-foreground">Unlock all chapters, ad-free reading, and more.</p>
              </div>
            </div>
            <Link href="/premium"><Button className="shrink-0">Upgrade</Button></Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
