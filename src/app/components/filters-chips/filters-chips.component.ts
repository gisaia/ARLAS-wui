import { Component } from '@angular/core';
import { ConfigService, projType } from 'arlas-web-core';
import { AppComponent } from '../../app.component';
import { ArlasWuiCollaborativesearchService, ArlasWuiConfigService } from '../../services/arlaswui.startup.service';
import { Hits } from 'arlas-api';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeAll';

@Component({
  selector: 'arlas-filters-chips',
  templateUrl: './filters-chips.component.html',
  styleUrls: ['./filters-chips.component.css']
})
export class FiltersChipsComponent {

  public contributors: Map<string, [string, boolean, number]> = new Map<string, [string, boolean, number]>();
  public contributorsId: Array<string> = new Array<string>();
  public checked = true;
  public color = 'primary';
  public mode = 'determinate';
  public iconLabel;

  constructor(private collaborativeService: ArlasWuiCollaborativesearchService, private configService: ArlasWuiConfigService) {
    this.displayList();
    this.collaborativeService.collaborationBus.subscribe(
      collaboration => {
        if (this) {
          this.displayList();
        }
      }
    );
  }

  public isEnabled(id: string) {
    return this.contributors.get(id)[1];
  }

  public getLabel(id: string) {
    return this.contributors.get(id)[0];
  }

  public removeContributor(item: any) {
    this.contributors.delete(item);
    this.contributorsId = Array.from(this.contributors.keys());
    this.collaborativeService.removeFilter(item);

  }

  public changeChipState(id) {
    if (this.isEnabled(id)) {
      this.collaborativeService.disable(id);
    } else {
      this.collaborativeService.enable(id);
    }
  }

  public getChipColor(id: string): string  {
    if (this.isEnabled(id)) {
      return '#2326CC';
    } else {
      return '#7C7979';
    }
  }

  public getIcon(id: string): string {
    return this.collaborativeService.registry.get(id).getConfigValue('icon');
  }

  public displayList() {
    const tabOfCount: Array<Observable<{ identifier: string, hits: Hits }>> = [];
    this.collaborativeService.getAllContributors().forEach(i => {
      const countData: Observable<Hits> = this.collaborativeService.resolveButNotHits([projType.count, {}], i);
      tabOfCount.push(countData.map(c => {
        return { identifier: i, hits: c };
      }));
    });
    if (tabOfCount.length === 0) {
      this.contributors.clear();
    }
    Observable.from(tabOfCount).mergeAll().subscribe(
      result => {
        let label = this.collaborativeService.registry.get(result.identifier).getFilterDisplayName();
        const labelSplited = label.split('<=');
        if (labelSplited.length === 3) {
          label = labelSplited[1];
        }

        const filter = this.collaborativeService.getFilter(result.identifier);
        if (filter != null) {
          this.contributors.set(result.identifier,
            [label, this.collaborativeService.isEnable(result.identifier),
              result.hits.totalnb]);
        } else {
          this.contributors.delete(result.identifier);
        }
      },
      error => {
        this.collaborativeService.collaborationErrorBus.next(error);
      },
      () => {
        this.contributorsId = new Array<string>();
        this.contributors.forEach((k, v) => {
          if (this.collaborativeService.getFilter(v) !== null) {
            this.contributorsId.push(v);
          }
        });
      }
    );
  }

  private getHitNumberWithOut(id: string): number {
    return this.contributors.get(id)[2];
  }

}
