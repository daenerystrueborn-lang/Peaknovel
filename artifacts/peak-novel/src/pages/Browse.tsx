import { useState } from "react";
import { useSearch, useListBooks, getSearchQueryKey, getListBooksQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Star, Crown, SlidersHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GENRES = ["All", "Fantasy", "Romance", "Action", "Sci-Fi", "Horror", "Mystery", "Martial Arts", "Xianxia", "System", "Isekai", "Slice of Life", "Comedy"];
const STATUSES = ["All", "ongoing", "completed", "hiatus"];

export default function Browse() {
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("trending");

  const isSearching = query.length > 0;

  const { data: searchData, isLoading: searchLoading } = useSearch(
    { q: query, genre, status, sort },
    { query: { enabled: isSearching, queryKey: getSearchQueryKey({ q: query, genre, status, sort }) } }
  );

  const { data: browseData, isLoading: browseLoading } = useListBooks(
    { genre, status, sort },
    { query: { enabled: !isSearching, queryKey: getListBooksQueryKey({ genre, status, sort }) } }
  );

  const isLoading = isSearching ? searchLoading : browseLoading;
  const books = isSearching ? (searchData?.books ?? []) : (browseData?.books ?? []);
  const authors = isSearching ? (searchData?.authors ?? []) : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Browse Novels</h1>
        <p className="text-muted-foreground">Discover thousands of original web novels</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or author..."
            className="pl-9"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
        {query && (
          <Button type="button" variant="ghost" onClick={() => { setQuery(""); setSearchInput(""); }}>
            Clear
          </Button>
        )}
      </form>

      <div className="flex flex-wrap gap-3 items-center">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={genre || "all"} onValueChange={v => setGenre(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRES.map(g => (
              <SelectItem key={g} value={g === "All" ? "all" : g}>{g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status || "all"} onValueChange={v => setStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => (
              <SelectItem key={s} value={s === "All" ? "all" : s}>
                {s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="rating">Top Rated</SelectItem>
            <SelectItem value="new">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {authors.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Authors</h2>
              <div className="flex flex-wrap gap-3">
                {authors.map(a => (
                  <Link key={a.id} href={`/author/${a.id}`}>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {a.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{a.username}</span>
                      <span className="text-xs text-muted-foreground">{a.bookCount} books</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {books.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No novels found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {query && <p className="text-sm text-muted-foreground">{books.length} results for "<span className="font-medium text-foreground">{query}</span>"</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map(book => (
                  <Link key={book.id} href={`/book/${book.id}`} className="group block">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-3 border border-border/50 transition-transform group-hover:-translate-y-1 duration-200">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                          {book.title}
                        </div>
                      )}
                      {book.isPremium && (
                        <div className="absolute top-1.5 right-1.5 bg-black/70 text-yellow-400 p-1 rounded-full">
                          <Crown className="w-3 h-3" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-black/50 text-white border-0">
                          {book.genre}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1">
                      {book.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{book.authorName}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-primary text-primary" />
                      <span className="text-xs font-medium">{book.rating.toFixed(1)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
