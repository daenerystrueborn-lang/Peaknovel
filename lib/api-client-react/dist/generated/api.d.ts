import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminBookList, AdminBookUpdate, AdminStats, AdminUserList, AdminUserUpdate, AuthUser, Book, BookDetail, BookInput, BookList, BookUpdate, BookmarkStatus, Chapter, ChapterInput, ChapterRead, ChapterSummary, ChapterUpdate, CheckoutInput, CheckoutSession, Comment, CommentInput, FollowStatus, HealthStatus, HomeData, ListAdminBooksParams, ListAdminUsersParams, ListBooksParams, LoginInput, MarkAllNotificationsRead200, NotificationList, PremiumPlan, ProfileUpdate, RatingInput, ReadingHistory, RegisterInput, SearchParams, SearchResults, UserProfile } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRegisterUrl: () => string;
/**
 * @summary Register a new user
 */
export declare const register: (registerInput: RegisterInput, options?: RequestInit) => Promise<AuthUser>;
export declare const getRegisterMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export type RegisterMutationResult = NonNullable<Awaited<ReturnType<typeof register>>>;
export type RegisterMutationBody = BodyType<RegisterInput>;
export type RegisterMutationError = ErrorType<void>;
/**
* @summary Register a new user
*/
export declare const useRegister: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof register>>, TError, {
        data: BodyType<RegisterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof register>>, TError, {
    data: BodyType<RegisterInput>;
}, TContext>;
export declare const getLoginUrl: () => string;
/**
 * @summary Login
 */
export declare const login: (loginInput: LoginInput, options?: RequestInit) => Promise<AuthUser>;
export declare const getLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export type LoginMutationResult = NonNullable<Awaited<ReturnType<typeof login>>>;
export type LoginMutationBody = BodyType<LoginInput>;
export type LoginMutationError = ErrorType<void>;
/**
* @summary Login
*/
export declare const useLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof login>>, TError, {
        data: BodyType<LoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof login>>, TError, {
    data: BodyType<LoginInput>;
}, TContext>;
export declare const getLogoutUrl: () => string;
/**
 * @summary Logout
 */
export declare const logout: (options?: RequestInit) => Promise<void>;
export declare const getLogoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export type LogoutMutationResult = NonNullable<Awaited<ReturnType<typeof logout>>>;
export type LogoutMutationError = ErrorType<unknown>;
/**
* @summary Logout
*/
export declare const useLogout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logout>>, TError, void, TContext>;
export declare const getGetMeUrl: () => string;
/**
 * @summary Get current user
 */
export declare const getMe: (options?: RequestInit) => Promise<AuthUser>;
export declare const getGetMeQueryKey: () => readonly ["/api/auth/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetHomeUrl: () => string;
/**
 * @summary Home page data
 */
export declare const getHome: (options?: RequestInit) => Promise<HomeData>;
export declare const getGetHomeQueryKey: () => readonly ["/api/home"];
export declare const getGetHomeQueryOptions: <TData = Awaited<ReturnType<typeof getHome>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHome>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getHome>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetHomeQueryResult = NonNullable<Awaited<ReturnType<typeof getHome>>>;
export type GetHomeQueryError = ErrorType<unknown>;
/**
 * @summary Home page data
 */
export declare function useGetHome<TData = Awaited<ReturnType<typeof getHome>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getHome>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getSearchUrl: (params?: SearchParams) => string;
/**
 * @summary Search books and authors
 */
export declare const search: (params?: SearchParams, options?: RequestInit) => Promise<SearchResults>;
export declare const getSearchQueryKey: (params?: SearchParams) => readonly ["/api/search", ...SearchParams[]];
export declare const getSearchQueryOptions: <TData = Awaited<ReturnType<typeof search>>, TError = ErrorType<unknown>>(params?: SearchParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData> & {
    queryKey: QueryKey;
};
export type SearchQueryResult = NonNullable<Awaited<ReturnType<typeof search>>>;
export type SearchQueryError = ErrorType<unknown>;
/**
 * @summary Search books and authors
 */
export declare function useSearch<TData = Awaited<ReturnType<typeof search>>, TError = ErrorType<unknown>>(params?: SearchParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListBooksUrl: (params?: ListBooksParams) => string;
/**
 * @summary List books
 */
export declare const listBooks: (params?: ListBooksParams, options?: RequestInit) => Promise<BookList>;
export declare const getListBooksQueryKey: (params?: ListBooksParams) => readonly ["/api/books", ...ListBooksParams[]];
export declare const getListBooksQueryOptions: <TData = Awaited<ReturnType<typeof listBooks>>, TError = ErrorType<unknown>>(params?: ListBooksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBooks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listBooks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListBooksQueryResult = NonNullable<Awaited<ReturnType<typeof listBooks>>>;
export type ListBooksQueryError = ErrorType<unknown>;
/**
 * @summary List books
 */
export declare function useListBooks<TData = Awaited<ReturnType<typeof listBooks>>, TError = ErrorType<unknown>>(params?: ListBooksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listBooks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateBookUrl: () => string;
/**
 * @summary Create a book
 */
export declare const createBook: (bookInput: BookInput, options?: RequestInit) => Promise<Book>;
export declare const getCreateBookMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBook>>, TError, {
        data: BodyType<BookInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createBook>>, TError, {
    data: BodyType<BookInput>;
}, TContext>;
export type CreateBookMutationResult = NonNullable<Awaited<ReturnType<typeof createBook>>>;
export type CreateBookMutationBody = BodyType<BookInput>;
export type CreateBookMutationError = ErrorType<unknown>;
/**
* @summary Create a book
*/
export declare const useCreateBook: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createBook>>, TError, {
        data: BodyType<BookInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createBook>>, TError, {
    data: BodyType<BookInput>;
}, TContext>;
export declare const getGetBookUrl: (id: number) => string;
/**
 * @summary Get a book
 */
export declare const getBook: (id: number, options?: RequestInit) => Promise<BookDetail>;
export declare const getGetBookQueryKey: (id: number) => readonly [`/api/books/${number}`];
export declare const getGetBookQueryOptions: <TData = Awaited<ReturnType<typeof getBook>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBook>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBook>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBookQueryResult = NonNullable<Awaited<ReturnType<typeof getBook>>>;
export type GetBookQueryError = ErrorType<void>;
/**
 * @summary Get a book
 */
export declare function useGetBook<TData = Awaited<ReturnType<typeof getBook>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBook>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateBookUrl: (id: number) => string;
/**
 * @summary Update a book
 */
export declare const updateBook: (id: number, bookUpdate: BookUpdate, options?: RequestInit) => Promise<Book>;
export declare const getUpdateBookMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBook>>, TError, {
        id: number;
        data: BodyType<BookUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateBook>>, TError, {
    id: number;
    data: BodyType<BookUpdate>;
}, TContext>;
export type UpdateBookMutationResult = NonNullable<Awaited<ReturnType<typeof updateBook>>>;
export type UpdateBookMutationBody = BodyType<BookUpdate>;
export type UpdateBookMutationError = ErrorType<unknown>;
/**
* @summary Update a book
*/
export declare const useUpdateBook: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateBook>>, TError, {
        id: number;
        data: BodyType<BookUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateBook>>, TError, {
    id: number;
    data: BodyType<BookUpdate>;
}, TContext>;
export declare const getDeleteBookUrl: (id: number) => string;
/**
 * @summary Delete a book
 */
export declare const deleteBook: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteBookMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBook>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteBook>>, TError, {
    id: number;
}, TContext>;
export type DeleteBookMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBook>>>;
export type DeleteBookMutationError = ErrorType<unknown>;
/**
* @summary Delete a book
*/
export declare const useDeleteBook: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteBook>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteBook>>, TError, {
    id: number;
}, TContext>;
export declare const getRateBookUrl: (id: number) => string;
/**
 * @summary Rate a book
 */
export declare const rateBook: (id: number, ratingInput: RatingInput, options?: RequestInit) => Promise<void>;
export declare const getRateBookMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rateBook>>, TError, {
        id: number;
        data: BodyType<RatingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof rateBook>>, TError, {
    id: number;
    data: BodyType<RatingInput>;
}, TContext>;
export type RateBookMutationResult = NonNullable<Awaited<ReturnType<typeof rateBook>>>;
export type RateBookMutationBody = BodyType<RatingInput>;
export type RateBookMutationError = ErrorType<unknown>;
/**
* @summary Rate a book
*/
export declare const useRateBook: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof rateBook>>, TError, {
        id: number;
        data: BodyType<RatingInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof rateBook>>, TError, {
    id: number;
    data: BodyType<RatingInput>;
}, TContext>;
export declare const getToggleBookmarkUrl: (id: number) => string;
/**
 * @summary Toggle bookmark
 */
export declare const toggleBookmark: (id: number, options?: RequestInit) => Promise<BookmarkStatus>;
export declare const getToggleBookmarkMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleBookmark>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof toggleBookmark>>, TError, {
    id: number;
}, TContext>;
export type ToggleBookmarkMutationResult = NonNullable<Awaited<ReturnType<typeof toggleBookmark>>>;
export type ToggleBookmarkMutationError = ErrorType<unknown>;
/**
* @summary Toggle bookmark
*/
export declare const useToggleBookmark: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof toggleBookmark>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof toggleBookmark>>, TError, {
    id: number;
}, TContext>;
export declare const getListChaptersUrl: (bookId: number) => string;
/**
 * @summary List chapters of a book
 */
export declare const listChapters: (bookId: number, options?: RequestInit) => Promise<ChapterSummary[]>;
export declare const getListChaptersQueryKey: (bookId: number) => readonly [`/api/books/${number}/chapters`];
export declare const getListChaptersQueryOptions: <TData = Awaited<ReturnType<typeof listChapters>>, TError = ErrorType<unknown>>(bookId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChapters>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listChapters>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListChaptersQueryResult = NonNullable<Awaited<ReturnType<typeof listChapters>>>;
export type ListChaptersQueryError = ErrorType<unknown>;
/**
 * @summary List chapters of a book
 */
export declare function useListChapters<TData = Awaited<ReturnType<typeof listChapters>>, TError = ErrorType<unknown>>(bookId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChapters>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateChapterUrl: (bookId: number) => string;
/**
 * @summary Create a chapter
 */
export declare const createChapter: (bookId: number, chapterInput: ChapterInput, options?: RequestInit) => Promise<Chapter>;
export declare const getCreateChapterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChapter>>, TError, {
        bookId: number;
        data: BodyType<ChapterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createChapter>>, TError, {
    bookId: number;
    data: BodyType<ChapterInput>;
}, TContext>;
export type CreateChapterMutationResult = NonNullable<Awaited<ReturnType<typeof createChapter>>>;
export type CreateChapterMutationBody = BodyType<ChapterInput>;
export type CreateChapterMutationError = ErrorType<unknown>;
/**
* @summary Create a chapter
*/
export declare const useCreateChapter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChapter>>, TError, {
        bookId: number;
        data: BodyType<ChapterInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createChapter>>, TError, {
    bookId: number;
    data: BodyType<ChapterInput>;
}, TContext>;
export declare const getGetChapterUrl: (id: number) => string;
/**
 * @summary Read a chapter
 */
export declare const getChapter: (id: number, options?: RequestInit) => Promise<ChapterRead>;
export declare const getGetChapterQueryKey: (id: number) => readonly [`/api/chapters/${number}`];
export declare const getGetChapterQueryOptions: <TData = Awaited<ReturnType<typeof getChapter>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChapter>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getChapter>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetChapterQueryResult = NonNullable<Awaited<ReturnType<typeof getChapter>>>;
export type GetChapterQueryError = ErrorType<void>;
/**
 * @summary Read a chapter
 */
export declare function useGetChapter<TData = Awaited<ReturnType<typeof getChapter>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChapter>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateChapterUrl: (id: number) => string;
/**
 * @summary Update a chapter
 */
export declare const updateChapter: (id: number, chapterUpdate: ChapterUpdate, options?: RequestInit) => Promise<Chapter>;
export declare const getUpdateChapterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateChapter>>, TError, {
        id: number;
        data: BodyType<ChapterUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateChapter>>, TError, {
    id: number;
    data: BodyType<ChapterUpdate>;
}, TContext>;
export type UpdateChapterMutationResult = NonNullable<Awaited<ReturnType<typeof updateChapter>>>;
export type UpdateChapterMutationBody = BodyType<ChapterUpdate>;
export type UpdateChapterMutationError = ErrorType<unknown>;
/**
* @summary Update a chapter
*/
export declare const useUpdateChapter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateChapter>>, TError, {
        id: number;
        data: BodyType<ChapterUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateChapter>>, TError, {
    id: number;
    data: BodyType<ChapterUpdate>;
}, TContext>;
export declare const getDeleteChapterUrl: (id: number) => string;
/**
 * @summary Delete a chapter
 */
export declare const deleteChapter: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteChapterMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteChapter>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteChapter>>, TError, {
    id: number;
}, TContext>;
export type DeleteChapterMutationResult = NonNullable<Awaited<ReturnType<typeof deleteChapter>>>;
export type DeleteChapterMutationError = ErrorType<unknown>;
/**
* @summary Delete a chapter
*/
export declare const useDeleteChapter: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteChapter>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteChapter>>, TError, {
    id: number;
}, TContext>;
export declare const getListCommentsUrl: (chapterId: number) => string;
/**
 * @summary Get comments for a chapter
 */
export declare const listComments: (chapterId: number, options?: RequestInit) => Promise<Comment[]>;
export declare const getListCommentsQueryKey: (chapterId: number) => readonly [`/api/chapters/${number}/comments`];
export declare const getListCommentsQueryOptions: <TData = Awaited<ReturnType<typeof listComments>>, TError = ErrorType<unknown>>(chapterId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCommentsQueryResult = NonNullable<Awaited<ReturnType<typeof listComments>>>;
export type ListCommentsQueryError = ErrorType<unknown>;
/**
 * @summary Get comments for a chapter
 */
export declare function useListComments<TData = Awaited<ReturnType<typeof listComments>>, TError = ErrorType<unknown>>(chapterId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCommentUrl: (chapterId: number) => string;
/**
 * @summary Post a comment
 */
export declare const createComment: (chapterId: number, commentInput: CommentInput, options?: RequestInit) => Promise<Comment>;
export declare const getCreateCommentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComment>>, TError, {
        chapterId: number;
        data: BodyType<CommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createComment>>, TError, {
    chapterId: number;
    data: BodyType<CommentInput>;
}, TContext>;
export type CreateCommentMutationResult = NonNullable<Awaited<ReturnType<typeof createComment>>>;
export type CreateCommentMutationBody = BodyType<CommentInput>;
export type CreateCommentMutationError = ErrorType<unknown>;
/**
* @summary Post a comment
*/
export declare const useCreateComment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComment>>, TError, {
        chapterId: number;
        data: BodyType<CommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createComment>>, TError, {
    chapterId: number;
    data: BodyType<CommentInput>;
}, TContext>;
export declare const getDeleteCommentUrl: (id: number) => string;
/**
 * @summary Delete a comment
 */
export declare const deleteComment: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteCommentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteComment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteComment>>, TError, {
    id: number;
}, TContext>;
export type DeleteCommentMutationResult = NonNullable<Awaited<ReturnType<typeof deleteComment>>>;
export type DeleteCommentMutationError = ErrorType<unknown>;
/**
* @summary Delete a comment
*/
export declare const useDeleteComment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteComment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteComment>>, TError, {
    id: number;
}, TContext>;
export declare const getLikeCommentUrl: (id: number) => string;
/**
 * @summary Like a comment
 */
export declare const likeComment: (id: number, options?: RequestInit) => Promise<void>;
export declare const getLikeCommentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof likeComment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof likeComment>>, TError, {
    id: number;
}, TContext>;
export type LikeCommentMutationResult = NonNullable<Awaited<ReturnType<typeof likeComment>>>;
export type LikeCommentMutationError = ErrorType<unknown>;
/**
* @summary Like a comment
*/
export declare const useLikeComment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof likeComment>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof likeComment>>, TError, {
    id: number;
}, TContext>;
export declare const getUpdateMeUrl: () => string;
/**
 * @summary Update own profile
 */
export declare const updateMe: (profileUpdate: ProfileUpdate, options?: RequestInit) => Promise<AuthUser>;
export declare const getUpdateMeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<ProfileUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<ProfileUpdate>;
}, TContext>;
export type UpdateMeMutationResult = NonNullable<Awaited<ReturnType<typeof updateMe>>>;
export type UpdateMeMutationBody = BodyType<ProfileUpdate>;
export type UpdateMeMutationError = ErrorType<unknown>;
/**
* @summary Update own profile
*/
export declare const useUpdateMe: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateMe>>, TError, {
        data: BodyType<ProfileUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateMe>>, TError, {
    data: BodyType<ProfileUpdate>;
}, TContext>;
export declare const getGetLibraryUrl: () => string;
/**
 * @summary Get user's bookmarked books
 */
export declare const getLibrary: (options?: RequestInit) => Promise<Book[]>;
export declare const getGetLibraryQueryKey: () => readonly ["/api/users/me/library"];
export declare const getGetLibraryQueryOptions: <TData = Awaited<ReturnType<typeof getLibrary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLibrary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLibrary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLibraryQueryResult = NonNullable<Awaited<ReturnType<typeof getLibrary>>>;
export type GetLibraryQueryError = ErrorType<unknown>;
/**
 * @summary Get user's bookmarked books
 */
export declare function useGetLibrary<TData = Awaited<ReturnType<typeof getLibrary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLibrary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetReadingHistoryUrl: () => string;
/**
 * @summary Get reading history
 */
export declare const getReadingHistory: (options?: RequestInit) => Promise<ReadingHistory[]>;
export declare const getGetReadingHistoryQueryKey: () => readonly ["/api/users/me/reading-history"];
export declare const getGetReadingHistoryQueryOptions: <TData = Awaited<ReturnType<typeof getReadingHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReadingHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getReadingHistory>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetReadingHistoryQueryResult = NonNullable<Awaited<ReturnType<typeof getReadingHistory>>>;
export type GetReadingHistoryQueryError = ErrorType<unknown>;
/**
 * @summary Get reading history
 */
export declare function useGetReadingHistory<TData = Awaited<ReturnType<typeof getReadingHistory>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getReadingHistory>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUserUrl: (id: number) => string;
/**
 * @summary Get a user profile
 */
export declare const getUser: (id: number, options?: RequestInit) => Promise<UserProfile>;
export declare const getGetUserQueryKey: (id: number) => readonly [`/api/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<void>;
/**
 * @summary Get a user profile
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getFollowUserUrl: (id: number) => string;
/**
 * @summary Follow an author
 */
export declare const followUser: (id: number, options?: RequestInit) => Promise<FollowStatus>;
export declare const getFollowUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
    id: number;
}, TContext>;
export type FollowUserMutationResult = NonNullable<Awaited<ReturnType<typeof followUser>>>;
export type FollowUserMutationError = ErrorType<unknown>;
/**
* @summary Follow an author
*/
export declare const useFollowUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof followUser>>, TError, {
    id: number;
}, TContext>;
export declare const getUnfollowUserUrl: (id: number) => string;
/**
 * @summary Unfollow an author
 */
export declare const unfollowUser: (id: number, options?: RequestInit) => Promise<void>;
export declare const getUnfollowUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unfollowUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof unfollowUser>>, TError, {
    id: number;
}, TContext>;
export type UnfollowUserMutationResult = NonNullable<Awaited<ReturnType<typeof unfollowUser>>>;
export type UnfollowUserMutationError = ErrorType<unknown>;
/**
* @summary Unfollow an author
*/
export declare const useUnfollowUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unfollowUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof unfollowUser>>, TError, {
    id: number;
}, TContext>;
export declare const getGetPremiumPlansUrl: () => string;
/**
 * @summary Get premium plans
 */
export declare const getPremiumPlans: (options?: RequestInit) => Promise<PremiumPlan[]>;
export declare const getGetPremiumPlansQueryKey: () => readonly ["/api/premium/plans"];
export declare const getGetPremiumPlansQueryOptions: <TData = Awaited<ReturnType<typeof getPremiumPlans>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPremiumPlans>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPremiumPlans>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPremiumPlansQueryResult = NonNullable<Awaited<ReturnType<typeof getPremiumPlans>>>;
export type GetPremiumPlansQueryError = ErrorType<unknown>;
/**
 * @summary Get premium plans
 */
export declare function useGetPremiumPlans<TData = Awaited<ReturnType<typeof getPremiumPlans>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPremiumPlans>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCheckoutUrl: () => string;
/**
 * @summary Create Stripe checkout session
 */
export declare const createCheckout: (checkoutInput: CheckoutInput, options?: RequestInit) => Promise<CheckoutSession>;
export declare const getCreateCheckoutMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCheckout>>, TError, {
        data: BodyType<CheckoutInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createCheckout>>, TError, {
    data: BodyType<CheckoutInput>;
}, TContext>;
export type CreateCheckoutMutationResult = NonNullable<Awaited<ReturnType<typeof createCheckout>>>;
export type CreateCheckoutMutationBody = BodyType<CheckoutInput>;
export type CreateCheckoutMutationError = ErrorType<unknown>;
/**
* @summary Create Stripe checkout session
*/
export declare const useCreateCheckout: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createCheckout>>, TError, {
        data: BodyType<CheckoutInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createCheckout>>, TError, {
    data: BodyType<CheckoutInput>;
}, TContext>;
export declare const getGetAdminStatsUrl: () => string;
/**
 * @summary Platform stats
 */
export declare const getAdminStats: (options?: RequestInit) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Platform stats
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAdminUsersUrl: (params?: ListAdminUsersParams) => string;
/**
 * @summary List all users
 */
export declare const listAdminUsers: (params?: ListAdminUsersParams, options?: RequestInit) => Promise<AdminUserList>;
export declare const getListAdminUsersQueryKey: (params?: ListAdminUsersParams) => readonly ["/api/admin/users", ...ListAdminUsersParams[]];
export declare const getListAdminUsersQueryOptions: <TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<unknown>>(params?: ListAdminUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminUsers>>>;
export type ListAdminUsersQueryError = ErrorType<unknown>;
/**
 * @summary List all users
 */
export declare function useListAdminUsers<TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<unknown>>(params?: ListAdminUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAdminUserUrl: (id: number) => string;
/**
 * @summary Ban/unban or promote user
 */
export declare const updateAdminUser: (id: number, adminUserUpdate: AdminUserUpdate, options?: RequestInit) => Promise<void>;
export declare const getUpdateAdminUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminUser>>, TError, {
        id: number;
        data: BodyType<AdminUserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAdminUser>>, TError, {
    id: number;
    data: BodyType<AdminUserUpdate>;
}, TContext>;
export type UpdateAdminUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateAdminUser>>>;
export type UpdateAdminUserMutationBody = BodyType<AdminUserUpdate>;
export type UpdateAdminUserMutationError = ErrorType<unknown>;
/**
* @summary Ban/unban or promote user
*/
export declare const useUpdateAdminUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminUser>>, TError, {
        id: number;
        data: BodyType<AdminUserUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAdminUser>>, TError, {
    id: number;
    data: BodyType<AdminUserUpdate>;
}, TContext>;
export declare const getDeleteAdminUserUrl: (id: number) => string;
/**
 * @summary Delete a user
 */
export declare const deleteAdminUser: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteAdminUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAdminUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAdminUser>>, TError, {
    id: number;
}, TContext>;
export type DeleteAdminUserMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAdminUser>>>;
export type DeleteAdminUserMutationError = ErrorType<unknown>;
/**
* @summary Delete a user
*/
export declare const useDeleteAdminUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAdminUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAdminUser>>, TError, {
    id: number;
}, TContext>;
export declare const getListAdminBooksUrl: (params?: ListAdminBooksParams) => string;
/**
 * @summary List all books for admin
 */
export declare const listAdminBooks: (params?: ListAdminBooksParams, options?: RequestInit) => Promise<AdminBookList>;
export declare const getListAdminBooksQueryKey: (params?: ListAdminBooksParams) => readonly ["/api/admin/books", ...ListAdminBooksParams[]];
export declare const getListAdminBooksQueryOptions: <TData = Awaited<ReturnType<typeof listAdminBooks>>, TError = ErrorType<unknown>>(params?: ListAdminBooksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminBooks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminBooks>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminBooksQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminBooks>>>;
export type ListAdminBooksQueryError = ErrorType<unknown>;
/**
 * @summary List all books for admin
 */
export declare function useListAdminBooks<TData = Awaited<ReturnType<typeof listAdminBooks>>, TError = ErrorType<unknown>>(params?: ListAdminBooksParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminBooks>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAdminBookUrl: (id: number) => string;
/**
 * @summary Feature/hide a book
 */
export declare const updateAdminBook: (id: number, adminBookUpdate: AdminBookUpdate, options?: RequestInit) => Promise<void>;
export declare const getUpdateAdminBookMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminBook>>, TError, {
        id: number;
        data: BodyType<AdminBookUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAdminBook>>, TError, {
    id: number;
    data: BodyType<AdminBookUpdate>;
}, TContext>;
export type UpdateAdminBookMutationResult = NonNullable<Awaited<ReturnType<typeof updateAdminBook>>>;
export type UpdateAdminBookMutationBody = BodyType<AdminBookUpdate>;
export type UpdateAdminBookMutationError = ErrorType<unknown>;
/**
* @summary Feature/hide a book
*/
export declare const useUpdateAdminBook: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminBook>>, TError, {
        id: number;
        data: BodyType<AdminBookUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAdminBook>>, TError, {
    id: number;
    data: BodyType<AdminBookUpdate>;
}, TContext>;
export declare const getDeleteAdminBookUrl: (id: number) => string;
/**
 * @summary Delete a book
 */
export declare const deleteAdminBook: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteAdminBookMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAdminBook>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAdminBook>>, TError, {
    id: number;
}, TContext>;
export type DeleteAdminBookMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAdminBook>>>;
export type DeleteAdminBookMutationError = ErrorType<unknown>;
/**
* @summary Delete a book
*/
export declare const useDeleteAdminBook: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAdminBook>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAdminBook>>, TError, {
    id: number;
}, TContext>;
export declare const getListNotificationsUrl: () => string;
/**
 * @summary Get user notifications
 */
export declare const listNotifications: (options?: RequestInit) => Promise<NotificationList>;
export declare const getListNotificationsQueryKey: () => readonly ["/api/notifications"];
export declare const getListNotificationsQueryOptions: <TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListNotificationsQueryResult = NonNullable<Awaited<ReturnType<typeof listNotifications>>>;
export type ListNotificationsQueryError = ErrorType<unknown>;
/**
 * @summary Get user notifications
 */
export declare function useListNotifications<TData = Awaited<ReturnType<typeof listNotifications>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listNotifications>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getMarkAllNotificationsReadUrl: () => string;
/**
 * @summary Mark all notifications as read
 */
export declare const markAllNotificationsRead: (options?: RequestInit) => Promise<MarkAllNotificationsRead200>;
export declare const getMarkAllNotificationsReadMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export type MarkAllNotificationsReadMutationResult = NonNullable<Awaited<ReturnType<typeof markAllNotificationsRead>>>;
export type MarkAllNotificationsReadMutationError = ErrorType<unknown>;
/**
* @summary Mark all notifications as read
*/
export declare const useMarkAllNotificationsRead: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof markAllNotificationsRead>>, TError, void, TContext>;
export declare const getDeleteNotificationUrl: (id: number) => string;
/**
 * @summary Delete a notification
 */
export declare const deleteNotification: (id: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteNotificationMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteNotification>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteNotification>>, TError, {
    id: number;
}, TContext>;
export type DeleteNotificationMutationResult = NonNullable<Awaited<ReturnType<typeof deleteNotification>>>;
export type DeleteNotificationMutationError = ErrorType<unknown>;
/**
* @summary Delete a notification
*/
export declare const useDeleteNotification: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteNotification>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteNotification>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map