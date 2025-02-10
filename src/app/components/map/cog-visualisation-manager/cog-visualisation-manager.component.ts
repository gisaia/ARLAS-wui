import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ResultCogVisualisationShortcutComponent } from 'arlas-web-components';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'arlas-cog-visualisation-manager',
  standalone: true,
  imports: [
    MatIcon,
    ResultCogVisualisationShortcutComponent
  ],
  templateUrl: './cog-visualisation-manager.component.html',
  styleUrl: './cog-visualisation-manager.component.scss'
})
export class CogVisualisationManagerComponent {
  protected dialog = inject(MatDialog);
  public openModal() {
    // this.dialog.open(ResultCogVisualisationModalComponent);
  }
}
