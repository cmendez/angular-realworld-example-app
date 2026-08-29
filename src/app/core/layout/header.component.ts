import {
  Component,
  inject,
  HostListener,
  ElementRef,
  ChangeDetectionStrategy,
} from "@angular/core";
import { UserService } from "../auth/services/user.service";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AsyncPipe } from "@angular/common";
import { IfAuthenticatedDirective } from "../auth/if-authenticated.directive";

@Component({
  selector: "app-layout-header",
  templateUrl: "./header.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLinkActive, RouterLink, AsyncPipe, IfAuthenticatedDirective],
})
export class HeaderComponent {
  userService = inject(UserService);
  elementRef = inject(ElementRef);
  currentUser$ = this.userService.currentUser;

  isDropdownOpen = false;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.userService.logout();
    this.isDropdownOpen = false;
  }

  @HostListener("document:click", ["$event"])
  onClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }
}
