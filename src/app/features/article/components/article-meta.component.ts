import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { Article } from "../models/article.model";
import { RouterLink } from "@angular/router";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-article-meta",
  template: `
    <div class="article-meta">
      <a [routerLink]="['/profile', article.author.username]">
        @if (article.author.image) {
          <img [src]="article.author.image" (error)="onImageError($event)" />
        } @else {
          <img src="assets/default-avatar.jpg" />
        }
      </a>

      <div class="info">
        <a class="author" [routerLink]="['/profile', article.author.username]">
          {{ article.author.username }}
        </a>
        <span class="date">
          {{ article.createdAt | date: "longDate" }}
        </span>
      </div>

      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe],
})
export class ArticleMetaComponent {
  @Input() article!: Article;
  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = "assets/default-avatar.jpg";
  }
}
