import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ArticleListComponent } from "../../article/components/article-list.component";
import { ProfileService } from "../services/profile.service";
import { Profile } from "../models/profile.model";
import { ArticleListConfig } from "../../article/models/article-list-config.model";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-profile-articles",
  template: `<app-article-list [limit]="10" [config]="articlesConfig" />`,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [ArticleListComponent],
})
export default class ProfileArticlesComponent implements OnInit {
  profile!: Profile;
  articlesConfig!: ArticleListConfig;
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);

  ngOnInit(): void {
    const isFavorites = this.route.snapshot.url.some(
      (segment) => segment.path === "favorites",
    );
    const username =
      this.route.parent?.snapshot.params["username"] ||
      this.route.snapshot.params["username"];

    this.profileService
      .get(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile: Profile) => {
          this.profile = profile;
          this.articlesConfig = {
            type: "all",
            filters: isFavorites
              ? { favorited: this.profile.username }
              : { author: this.profile.username },
          };
        },
      });
  }
}
