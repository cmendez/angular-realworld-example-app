import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { Errors } from "../../core/models/errors.model";

@Component({
  selector: "app-list-errors",
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: "./list-errors.component.html",
})
export class ListErrorsComponent {
  errorList: string[] = [];

  @Input() set errors(errorList: Errors | null) {
    this.errorList = errorList
      ? Object.keys(errorList.errors || {}).map(
          (key) => `${key} ${errorList.errors[key]}`,
        )
      : [];
  }
}
