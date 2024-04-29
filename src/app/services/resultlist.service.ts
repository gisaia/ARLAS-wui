import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CellBackgroundStyleEnum } from 'arlas-web-components';
import { ResultListContributor } from 'arlas-web-contributors';
import { getParamValue } from 'arlas-wui-toolkit';


@Injectable({
  providedIn: 'root'
})
export class ResultlistService {

  public resultlistContributors: Array<ResultListContributor> = new Array();
  public resultlistConfigs = [];
  public resultlistConfigPerContId = new Map<string, any>();
  public previewlistContrib: ResultListContributor = null;

  public selectedListTabIndex = 0;
  public listOpen = false;

  public constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    const resultlistOpenString = getParamValue('ro');
    if (resultlistOpenString) {
      this.listOpen = (resultlistOpenString === 'true');
    }
  }

  public setContributors(resultlistContributors: Array<ResultListContributor>, resultlistConfigs: string[]) {
    this.resultlistContributors = resultlistContributors;
    if (this.resultlistContributors.length > 0) {
      this.resultlistConfigs = resultlistConfigs;

      this.resultlistConfigs.forEach(rlConf => {
        rlConf.input.cellBackgroundStyle = !!rlConf.input.cellBackgroundStyle ?
          CellBackgroundStyleEnum[rlConf.input.cellBackgroundStyle] : undefined;
        this.resultlistConfigPerContId.set(rlConf.contributorId, rlConf.input);
      });
    }
  }

  public toggleList() {
    this.listOpen = !this.listOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], {replaceUrl: true, queryParams: queryParams});
  }

  public isThumbnailProtected(): boolean {
    return this.resultlistContributors[this.selectedListTabIndex].fieldsConfiguration?.useHttpThumbnails ?? false;
  }
}
