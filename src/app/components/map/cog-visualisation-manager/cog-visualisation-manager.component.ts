import { Component, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ResultCogVisualisationShortcutComponent } from 'arlas-web-components';
import { VisualisationInterface } from '../../../tools/visualisation.interface';
import { ResultlistService } from '@services/resultlist.service';
import { first } from 'rxjs';

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
  public visualisation = input<VisualisationInterface>();
  protected resultListService = inject(ResultlistService);
  public openModal() {
    this.resultListService.openCogSelectionDialog()
      .afterClosed()
      .pipe(first())
      .subscribe(cogStyle =>  {
        this.resultListService.setCongVisualisationSelectList(cogStyle);
      });
  }

  public deleteVisualisation() {
    this.resultListService.setCongVisualisationSelectList(null);
  }
}
