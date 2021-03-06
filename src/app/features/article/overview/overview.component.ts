import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";

import {Store} from "@ngxs/store";

import {File, Post} from "../../../core/redux/models";
import {AuthState, PostState} from "../../../core/redux/states";
import {PostCreateAction, PostUpdateAction} from "../../../core/redux/actions";
import {SelectImageModalComponent} from "./select-image-modal/select-image-modal.component";
import {environment} from "../../../../environments/environment";
import {normalizeImageUrl} from "../../../core/utils/url-utils";

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

    post: Post = {
        body: ''
    } as Post;

    articleForm = new FormGroup({
        body: new FormControl(''),
        enable: new FormControl(''),
        description: new FormControl(''),
        title: new FormControl('')
    });

    constructor(
        private store: Store,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog
    ) {
    }

    ngOnInit() {
        if (this.isNewPost()) {

        } else {
            this.store.select(PostState.post).subscribe(post => {
                if (post) {
                    const newPost = {...post};
                    if (newPost.banner) {
                        newPost.banner = {...newPost.banner};
                        newPost.banner.url = normalizeImageUrl(newPost.banner.url);
                    }
                    this.post = newPost;
                    this.articleForm.controls.body.setValue(this.post.body);
                    this.articleForm.controls.description.setValue(this.post.description);
                    this.articleForm.controls.title.setValue(this.post.title);
                    this.articleForm.controls.enable.setValue(Boolean(this.post.enable));
                }
            });
        }
    }

    normalizeUrl(url) {
        return normalizeImageUrl(url);
    }

    isNewPost() {
        return !this.activatedRoute.snapshot.params.id;
    }

    onBodyChange() {
        this.post.body = this.articleForm.controls.body.value;
    }

    submitPost() {
        this.post.body = this.articleForm.controls.body.value;
        this.post.description = this.articleForm.controls.description.value;
        this.post.title = this.articleForm.controls.title.value;
        this.post.enable = !!this.articleForm.controls.enable.value;

        if (this.isNewPost()) {
            this.store.dispatch(new PostCreateAction(this.post, this.store.selectSnapshot(AuthState.me))).subscribe(() => {
                this.router.navigate([`/articles/update/${this.store.selectSnapshot(PostState.newPostId)}`]);
            });
        } else {
            this.store.dispatch(new PostUpdateAction(this.post)).subscribe(() => {
            });
        }
    }

    openImageSectorModal() {
        const dialog = this.dialog.open(SelectImageModalComponent, {
            height: '50vh',
            width: '50vw',
        });

        dialog.afterClosed().subscribe((image: File) => {
            if (image) {
                this.post.banner = image;
            }
        });
    }
}
