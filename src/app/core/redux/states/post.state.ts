import {Action, Selector, State, StateContext} from '@ngxs/store';
import {tap} from 'rxjs/operators';
import {Observable} from "rxjs";

import {PostService} from '../services';
import {
    PostAction,
    FetchPostsAction,
    NextPageAction,
    PreviousPageAction,
    PostUpdateAction,
    PostCreateAction
} from '../actions';
import {initPostStateModel, PostStateModel} from './post-state.model';
import {Post} from '../models';
import {MINIMUM_PAGE, PaginationBaseClass, ResponseData} from "./pagination-base.class";

@State<PostStateModel>({
    name: 'post',
    defaults: initPostStateModel()
})
export class PostState extends PaginationBaseClass<PostStateModel> {

    @Selector()
    static posts(state: PostStateModel): Post[] {
        return state.elements;
    }

    @Selector()
    static post(state: PostStateModel): Post {
        return state.post;
    }

    @Selector()
    static firstPage(state: PostStateModel): boolean {
        return state.firstPage;
    }

    @Selector()
    static lastPage(state: PostStateModel): boolean {
        return state.lastPage;
    }

    @Selector()
    static newPostId(state: PostStateModel): string {
        return state.newPostId;
    }

    constructor(private postService: PostService) {
        super();
    }

    @Action(FetchPostsAction)
    fetchPostsAction(ctx: StateContext<PostStateModel>) {
        const pageSize = ctx.getState().pageSize;
        const start = ctx.getState().page * pageSize;
        return this.fetchPage(pageSize, start, ctx);
    }

    @Action(NextPageAction)
    nextPageAction(ctx: StateContext<PostStateModel>) {
        const pageSize = ctx.getState().pageSize;
        const currentPage = this.nextPageNumber(ctx.getState().page, ctx.getState().count, pageSize);
        const start = currentPage * pageSize;
        return this.fetchPage(pageSize, start, ctx, currentPage).pipe(tap(() => {
            ctx.patchState({page: currentPage});
        }));
    }

    @Action(PreviousPageAction)
    previousPageAction(ctx: StateContext<PostStateModel>) {
        const pageSize = ctx.getState().pageSize;
        const currentPage = Math.max(ctx.getState().page - 1, MINIMUM_PAGE);
        const start = currentPage * pageSize;
        return this.fetchPage(pageSize, start, ctx, currentPage).pipe(tap(() => {
            ctx.patchState({page: currentPage});
        }));
    }

    @Action(PostAction)
    fetchPostAction(ctx: StateContext<PostStateModel>, action: PostAction) {
        return this.postService.fetchPost(action.postId).pipe(tap(post => ctx.patchState({post})));
    }

    @Action(PostUpdateAction)
    postUpdateAction(ctx: StateContext<PostStateModel>, action: PostUpdateAction) {
        return this.postService.updatePost(action.post);
    }

    @Action(PostCreateAction)
    postCreateAction(ctx: StateContext<PostStateModel>, action: PostCreateAction) {
        return this.postService.createPost(action.post).pipe(tap(post => ctx.patchState({newPostId: post.id})));
    }

    fetchElements(pageSize, start): Observable<ResponseData> {
        return this.postService.fetchPosts(pageSize, start);
    }

}
