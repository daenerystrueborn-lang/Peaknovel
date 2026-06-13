import { useState, useEffect, useCallback } from "react";
import { useGetHome, getGetHomeQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, ListOrdered, ChevronRight, Crown, Flame, Sparkles, BookOpen, CalendarDays, Users, ChevronLeft } from "lucide-react";

export default function Home() {
  const { data: homeData, isLoading } = useGetHome({
    query: { queryKey: getGetHomeQueryKey() }
  });

  if (isLoading) {
    return (
      <div className="space-y-14">
        <Skeleton className="h-[520px] w-full" />
        <div className="container space-y-12">
          <div className="space-y-5">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-5">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { trending = [], topRanked = [], newReleases = [], featuredBooks = [], topAuthors = [], genres = [] } = homeData || {};

  const heroBooks = [...featuredBooks, ...trending]
    .filter((b, i, arr) => arr.findIndex(x => x.id === b.id) === i)
    .slice(0, 5);

  const dailyPick = topRanked[2] || trending[3];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Auto-swipe Hero Carousel */}
      {heroBooks.length > 0 && <HeroCarousel books={heroBooks} />}

      {/* Main Content */}
      <div className="container py-14 space-y-16">

        {/* Ad Slot */}
        <div className="adsense-slot w-full h-[90px] bg-muted/40 flex items-center justify-center text-muted-foreground text-xs border border-dashed border-border/60 rounded-xl" data-ad-slot="home-banner">
          Advertisement
        </div>

        {/* Trending */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-primary" /> Trending Now
            </h2>
            <Link href="/browse?sort=trending" className="text-sm font-medium text-primary hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
            {trending.slice(0, 6).map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </section>

        {/* Top Ranked */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <ListOrdered className="w-6 h-6 text-primary" /> Top Ranked
            </h2>
            <Link href="/browse?sort=rating" className="text-sm font-medium text-primary hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topRanked.slice(0, 6).map((book, idx) => (
              <Link key={book.id} href={`/book/${book.id}`}>
                <Card className="hover:bg-muted/40 transition-colors cursor-pointer border-border/50 group">
                  <CardContent className="p-4 flex gap-4 items-center">
                    <div className="text-3xl font-black text-muted-foreground/20 w-8 shrink-0 text-center tabular-nums">{idx + 1}</div>
                    <div className="w-14 h-20 shrink-0 bg-muted rounded-lg overflow-hidden border border-border/50">
                      {book.coverUrl && <img src={book.coverUrl} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{book.authorName}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-primary text-primary" />
                          <span className="font-medium">{book.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">{book.genre}</span>
                        {book.isPremium && <Crown className="w-3 h-3 text-yellow-500" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Daily Pick */}
        {dailyPick && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <CalendarDays className="w-6 h-6 text-primary" /> Book of the Day
            </h2>
            <Link href={`/book/${dailyPick.id}`}>
              <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all group cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-48 h-48 md:h-auto shrink-0 bg-muted overflow-hidden">
                      {dailyPick.coverUrl ? (
                        <img src={dailyPick.coverUrl} alt={dailyPick.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 opacity-30" /></div>
                      )}
                    </div>
                    <div className="flex-1 p-6 md:p-8 space-y-4">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Today's Pick</Badge>
                      <div>
                        <h3 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">{dailyPick.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">by {dailyPick.authorName}</p>
                      </div>
                      <p className="text-muted-foreground leading-relaxed line-clamp-3 text-sm">{dailyPick.synopsis}</p>
                      <div className="flex flex-wrap items-center gap-5 text-sm">
                        <div className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-primary text-primary" /><span className="font-semibold">{dailyPick.rating.toFixed(1)}</span></div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Eye className="w-4 h-4" /><span>{dailyPick.viewCount.toLocaleString()} views</span></div>
                        <Badge variant="outline" className="text-xs">{dailyPick.genre}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </section>
        )}

        {/* New Releases */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-primary" /> New Releases
            </h2>
            <Link href="/browse?sort=new" className="text-sm font-medium text-primary hover:underline flex items-center gap-0.5">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-5">
            {newReleases.slice(0, 6).map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </section>

        {/* Top Authors */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2.5">
              <Users className="w-6 h-6 text-primary" /> Top Authors
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {topAuthors.filter((a: any) => a.bookCount > 0).slice(0, 5).map((author: any) => (
              <Link key={author.id} href={`/author/${author.id}`}>
                <Card className="hover:border-primary/40 transition-colors cursor-pointer border-border/50 group">
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary mx-auto group-hover:bg-primary/20 transition-colors">
                      {author.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm truncate">{author.username}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{author.followerCount.toLocaleString()} followers</p>
                      <p className="text-xs text-muted-foreground">{author.bookCount} works</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Genre Browser */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Browse by Genre</h2>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre: string) => (
              <Link key={genre} href={`/browse?genre=${encodeURIComponent(genre)}`}>
                <Badge variant="outline" className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-150">
                  {genre}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroCarousel({ books }: { books: any[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  const next = useCallback(() => goTo((currentIdx + 1) % books.length), [currentIdx, books.length, goTo]);
  const prev = useCallback(() => goTo((currentIdx - 1 + books.length) % books.length), [currentIdx, books.length, goTo]);

  useEffect(() => {
    if (isPaused || books.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, books.length, next]);

  const book = books[currentIdx];
  if (!book) return null;

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "520px" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background image — dimmed book cover, zoomed in */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: isTransitioning ? 0 : 1 }}
      >
        {book.coverUrl && (
          <img
            key={book.id}
            src={book.coverUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110"
            style={{ filter: "blur(2px)" }}
          />
        )}
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div
        className="relative container py-16 md:py-24 flex flex-col md:flex-row gap-10 items-center"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <div className="flex-1 space-y-5 max-w-2xl">
          <div className="flex items-center gap-3">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur px-3 py-1 text-xs font-semibold">
              ✦ {book.isFeatured ? "Featured" : "Trending"}
            </Badge>
            <Badge variant="outline" className="text-white/80 border-white/20 text-xs">{book.genre}</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white drop-shadow-lg">
            {book.title}
          </h1>
          <p className="text-base md:text-lg text-white/75 leading-relaxed line-clamp-3">
            {book.synopsis}
          </p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-semibold text-white">{book.rating.toFixed(1)}</span>
              <span>({book.ratingCount?.toLocaleString()} ratings)</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span>{book.chapterCount} Chapters</span>
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span>by {book.authorName}</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={`/book/${book.id}`}>
              <Button size="lg" className="px-8 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30">
                <BookOpen className="w-4 h-4" /> Read Now
              </Button>
            </Link>
            <Link href={`/book/${book.id}`}>
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur">
                Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Book cover */}
        <Link href={`/book/${book.id}`} className="shrink-0 hidden sm:block">
          <div className="w-44 md:w-64 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10 relative transition-transform hover:scale-[1.02] duration-300">
            <div className="aspect-[2/3] bg-muted/50 relative">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-sm p-4 text-center">{book.title}</div>
              )}
              {book.isPremium && (
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur text-yellow-400 p-2 rounded-full">
                  <Crown className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation arrows */}
      {books.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Progress dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {books.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === currentIdx
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>

      {/* Pause indicator */}
      {isPaused && books.length > 1 && (
        <div className="absolute top-4 right-4 text-[10px] text-white/40 font-medium tracking-wide z-10">
          PAUSED
        </div>
      )}
    </section>
  );
}

function BookCard({ book }: { book: any }) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted mb-3 border border-border/50 transition-transform group-hover:-translate-y-1.5 duration-200 shadow-sm group-hover:shadow-md group-hover:shadow-primary/10">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">{book.title}</div>
        )}
        {book.isPremium && (
          <div className="absolute top-2 right-2 bg-black/70 text-yellow-400 p-1 rounded-full">
            <Crown className="w-3 h-3" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-[10px] font-medium truncate">{book.genre}</p>
        </div>
      </div>
      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1">{book.title}</h3>
      <p className="text-xs text-muted-foreground truncate">{book.authorName}</p>
      <div className="flex items-center gap-1 mt-1.5">
        <Star className="w-3 h-3 fill-primary text-primary" />
        <span className="text-xs font-medium">{book.rating.toFixed(1)}</span>
      </div>
    </Link>
  );
}
