import { Injectable, NgZone } from "@angular/core";
import { MatSnackBar, MatSnackBarRef } from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private displayTime = 5000;

  constructor(private snackBar: MatSnackBar, private ngZone: NgZone) {}

  showSuccess(message: string): MatSnackBarRef<any> {
    return this.run(() =>
      this.snackBar.open(message, 'Close', {
        duration: this.displayTime,
        panelClass: ['snackbar-success'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
    );
  }

  showError(message: string, classes: string[] = ['notification-error']) {
    this.run(() =>
      this.snackBar.open(message, 'Close', {
        duration: this.displayTime,
        panelClass: classes,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
    );
  }

  showInfo(message: string) {
    this.run(() =>
      this.snackBar.open(message, 'Close', {
        duration: this.displayTime,
        panelClass: ['snackbar-info'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      })
    );
  }

  private run<T>(fn: () => T): T {
    return this.ngZone.run(() => fn());
  }
}
