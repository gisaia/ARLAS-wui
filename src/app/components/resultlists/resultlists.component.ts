import { Component, Input, OnInit, AfterViewInit, Output, ViewChild } from '@angular/core';
import { ResultListContributor } from 'arlas-web-contributors';
import { ArlasStartupService, ArlasCollaborativesearchService } from 'arlas-wui-toolkit';
import { SortEnum, CellBackgroundStyleEnum, ModeEnum, PageQuery, Column } from 'arlas-web-components';
import { Subject, zip } from 'rxjs';
import { MatTabGroup } from '@angular/material/tabs';
import { CollectionReferenceParameters } from 'arlas-api';

@Component({
  selector: 'arlas-resultlists',
  templateUrl: './resultlists.component.html',
  styleUrls: ['./resultlists.component.css']
})
export class ResultlistsComponent implements OnInit, AfterViewInit {

  @Input() public isDisplayed = true;
  @Input() public resultListsConfig = [];

  @Output() public listsLoaded: Subject<ResultListContributor[]> = new Subject();

  public resultListConfigPerContId = new Map<string, any>();
  public rightListContributors: Array<ResultListContributor> = new Array();
  public resultlistContributors: Array<ResultListContributor> = new Array();
  public sortOutput = new Map<string, { fieldName: string; sortDirection: SortEnum; columnName?: string; }>();
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();

  @ViewChild('tabsList', { static: false }) public tabsList: MatTabGroup;

  public constructor(public arlasStartUpService: ArlasStartupService,
    private collaborativeService: ArlasCollaborativesearchService) { }

  public ngAfterViewInit(): void {
  }

  public ngOnInit(): void {
    const ids = new Set(this.resultListsConfig.map(c => c.contributorId));
    this.arlasStartUpService.contributorRegistry.forEach((v, k) => {
      if (v instanceof ResultListContributor) {
        v.updateData = ids.has(v.identifier);
        this.resultlistContributors.push(v);
      }
    });
    if (this.resultlistContributors.length > 0) {
      this.rightListContributors = this.resultlistContributors
        .filter(c => this.resultListsConfig.some((rc) => c.identifier === rc.contributorId))
        .map(rlcontrib => {
          (rlcontrib as any).name = rlcontrib.getName();
          const sortColumn = rlcontrib.fieldsList.find(c => !!(c as any).sort && (c as any).sort !== '');
          if (!!sortColumn) {
            this.sortOutput.set(rlcontrib.identifier, {
              columnName: sortColumn.columnName,
              fieldName: sortColumn.fieldName,
              sortDirection: (sortColumn as any).sort === 'asc' ? SortEnum.asc : SortEnum.desc
            });
          }
          return rlcontrib;
        });

      this.resultListsConfig.forEach(rlConf => {
        rlConf.input.cellBackgroundStyle = !!rlConf.input.cellBackgroundStyle ?
          CellBackgroundStyleEnum[rlConf.input.cellBackgroundStyle] : undefined;
        this.resultListConfigPerContId.set(rlConf.contributorId, rlConf.input);
      });
      const collections = new Set(Array.from(this.collaborativeService.registry.values()).map(c => c.collection));
      zip(...Array.from(collections).map(c => this.collaborativeService.describe(c)))
        .subscribe(cdrs => {
          cdrs.forEach(cdr => {
            this.collectionToDescription.set(cdr.collection_name, cdr.params);
          });
          if (this.resultlistContributors.length > 0) {
            this.resultlistContributors.forEach(c => c.sort = this.collectionToDescription.get(c.collection).id_path);
          }
        });
    }

    this.listsLoaded.next(this.resultlistContributors);
  }

  public changeListResultMode(mode: ModeEnum, identifier: string) {
    const config = this.resultListConfigPerContId.get(identifier);
    config.defautMode = mode;
    this.resultListConfigPerContId.set(identifier, config);
  }

  public paginate(contributor, eventPaginate: PageQuery): void {
    console.log(eventPaginate)
    console.log(contributor.fetchState)
    contributor.getPage(eventPaginate.reference, eventPaginate.whichPage);
  }

  public sortColumnEvent(contributorId: string, sortOutput: Column) {
    const resultlistContributor = this.resultlistContributors.find(r => r.identifier === contributorId);
    if (!!resultlistContributor) {
      /** Save the sorted column */
      this.sortOutput.set(contributorId, sortOutput);
      /** Sort the list by the selected column and the id field name */
      resultlistContributor.sortColumn(sortOutput, true);
    }

  }


}
