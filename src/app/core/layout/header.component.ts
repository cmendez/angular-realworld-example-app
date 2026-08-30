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
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [RouterLinkActive, RouterLink, AsyncPipe, IfAuthenticatedDirective],
  styles: `
    .navbar-brand-custom {
      display: flex;
      align-items: center;
    }
    .brand-logo {
      height: 32px;
      border-radius: 8px;
      margin-right: 8px;
    }
    .dropdown-container {
      position: relative;
    }
    .pointer-cursor {
      cursor: pointer;
    }
    .dropdown-menu-custom {
      position: absolute;
      right: 0;
      margin-top: 0;
    }
    .logout-item {
      color: #b85c5c;
    }
  `,
})
export class HeaderComponent {
  userService = inject(UserService);
  elementRef = inject(ElementRef);
  currentUser$ = this.userService.currentUser;

  isDropdownOpen = false;

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  onImageError(event: Event) {
    (event.target as HTMLImageElement).src = "assets/default-avatar.jpg";
  }

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
