import { Injectable } from '@angular/core';
import { MapglLayerStyleEditComponent } from '../../components/mapgl-layer-style-edit/mapgl-layer-style-edit.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LayerSourceConfig } from 'arlas-web-contributors';

export interface LayerEditConfig {
  style: mapboxgl.Layer;
  source: LayerSourceConfig;
}

@Injectable({
  providedIn: 'root'
})
export class LayerStyleManagerService {
  private editDialogRef: MatDialogRef<MapglLayerStyleEditComponent, LayerEditConfig>;

  public constructor(
    private dialog: MatDialog
  ) { }

  /**
   * Opens the component to edit a layer's style
   * @param data Something
   * @returns An observable of the new value of the layer style
   */
  public openLayerStyleEditComponent(data) {
    this.editDialogRef = this.dialog.open(MapglLayerStyleEditComponent, {
      data,
      height: '100%',
      width: '100vw',
      maxWidth: '100vw',
      maxHeight: '100%',
      panelClass: 'layer-style-dialog'
    });

    return this.editDialogRef.afterClosed();
  }
}
