import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest } from "rxjs";
import { Errors } from "../../../../core/models/errors.model";
import { ArticlesService } from "../../services/articles.service";
import { UserService } from "../../../../core/auth/services/user.service";
import { ListErrorsComponent } from "../../../../shared/components/list-errors.component";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker'; // <-- AÑADIR

interface ArticleForm {
  title: FormControl<string>;
  description: FormControl<string>;
  body: FormControl<string>;
  publishDate: FormControl<Date | null>; // <-- AÑADIR
}

@Component({
  selector: "app-editor-page",
  templateUrl: "./editor.component.html",
  // Añade BsDatepickerModule a los imports
  imports: [
    CommonModule, // <-- 2. AÑADE CommonModule AQUÍ
    ListErrorsComponent,
    ReactiveFormsModule,
    BsDatepickerModule
  ],
  standalone: true, // <-- ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ (si no estaba)
})
export default class EditorComponent implements OnInit {
  tagList: string[] = [];
  articleForm: UntypedFormGroup = new FormGroup<ArticleForm>({
    title: new FormControl("", { validators: [Validators.required], nonNullable: true }),
    description: new FormControl("", { validators: [Validators.required], nonNullable: true }),
    body: new FormControl("", { validators: [Validators.required], nonNullable: true }), 
    publishDate: new FormControl<Date | null>(null),
  });
  tagField = new FormControl<string>("", { nonNullable: true });

  errors: Errors | null = null;
  isSubmitting = false;
  destroyRef = inject(DestroyRef);

  constructor(
    private readonly articleService: ArticlesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
  ) {}

  ngOnInit() {
    if (this.route.snapshot.params["slug"]) {
      combineLatest([
        this.articleService.get(this.route.snapshot.params["slug"]),
        this.userService.getCurrentUser(),
      ])
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(([article, { user }]) => {
          if (user.username === article.author.username) {
            this.tagList = article.tagList;

            // Convertimos el string a Date para el formulario
            const articleForForm = {
              ...article,
              publishDate: article.publishDate ? new Date(article.publishDate) : null
            };

            this.articleForm.patchValue(articleForForm);
          } else {
            void this.router.navigate(["/"]);
          }
        });
    }
  }

  addTag() {
    // retrieve tag control
    const tag = this.tagField.value;
    // only add tag if it does not exist yet
    if (tag != null && tag.trim() !== "" && this.tagList.indexOf(tag) < 0) {
      this.tagList.push(tag);
    }
    // clear the input
    this.tagField.reset("");
  }

  removeTag(tagName: string): void {
    this.tagList = this.tagList.filter((tag) => tag !== tagName);
  }

  submitForm(): void {
    // 1. PRIMERO, lee los valores mientras el formulario aún está HABILITADO.
    const formValue = this.articleForm.getRawValue();

    // 2. DESPUÉS, actualiza el estado para deshabilitar la UI.
    this.isSubmitting = true;

    // 3. El resto de la lógica sigue igual, usando el 'formValue' que ya capturaste.
    this.addTag();
    const slug = this.route.snapshot.params["slug"];

    const articleData = {
      title: formValue.title,
      description: formValue.description,
      body: formValue.body, // <-- ESTA LÍNEA FALTABA
      tagList: this.tagList,
      publishDate: formValue.publishDate
        ? formValue.publishDate.toISOString()
        : null,
    };

    const observable = slug
      ? this.articleService.update({ ...articleData, slug })
      : this.articleService.create(articleData);

    observable.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (article) => this.router.navigate(["/article/", article.slug]),
      error: (err) => {
        this.errors = err;
        this.isSubmitting = false; // Vuelve a habilitar el formulario en caso de error
      },
    });
  }
}
