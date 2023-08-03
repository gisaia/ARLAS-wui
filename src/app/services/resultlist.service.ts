import { Injectable } from '@angular/core';
import { ResultListContributor } from 'arlas-web-contributors';
import { CollectionReferenceParameters } from 'arlas-api';
import {
  SortEnum
} from 'arlas-web-components';
@Injectable()
export class ResultlistService {
  public resultlistContributors: Array<ResultListContributor> = new Array();
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();
  public isGeoSortActivated = new Map<string, boolean>();
  public sortOutput = new Map<string, { fieldName: string; sortDirection: SortEnum; columnName?: string; }>();


  public setContributors(resultlistContributors: Array<ResultListContributor>) {
    this.resultlistContributors = resultlistContributors;
  }

  public setCollectionsDescription(collectionToDescription: Map<string, CollectionReferenceParameters>) {
    this.collectionToDescription = collectionToDescription;
  }

  public highlightItems(hoveredFeatures: any[]) {
    this.resultlistContributors.forEach(c => {
      const idFieldName = this.collectionToDescription.get(c.collection).id_path;
      const highLightItems = hoveredFeatures
        .filter(f => f.layer.metadata.collection === c.collection)
        .map(f => f.properties[idFieldName.replace(/\./g, '_')])
        .filter(id => id !== undefined)
        .map(id => id.toString());
      c.setHighlightItems(highLightItems);
    });
  }

  public clearHighlightedItems() {
    this.resultlistContributors.forEach(c => {
      c.setHighlightItems([]);
    });
  }
}
