import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import mapboxgl from 'mapbox-gl';

const GEOJSON_SOURCE_TYPE = 'geojson';

@Component({
  selector: 'arlas-mapgl-layer-style-edit',
  templateUrl: './mapgl-layer-style-edit.component.html',
  styleUrls: ['./mapgl-layer-style-edit.component.scss']
})
export class MapglLayerStyleEditComponent implements OnInit, AfterViewInit {

  public id = 'layer-style-edit-map';

  public map: mapboxgl.Map;

  public firstDrawLayer: string;

  public layerStyle: mapboxgl.Layer;

  public constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialog: MatDialogRef<MapglLayerStyleEditComponent>
  ) { }

  public ngOnInit(): void {
    console.log(this.data);
    this.layerStyle = Object.assign({}, this.data.layerStyle);
  }

  public ngAfterViewInit(): void {
    // Get infos from Input ? URL ?
    const zoom = 5;
    const center: [number, number] = [8, 48];
    // Use extend ?
    const style = 'https://api.maptiler.com/maps/a1e62ee0-aca6-451a-a4b8-42250422a212/style.json?key=xIhbu1RwgdbxfZNmoXn4';

    this.map = new mapboxgl.Map({
      container: this.id,
      style: style,
      center: center,
      zoom: zoom,
      maxZoom: zoom + 1,
      minZoom: zoom,
    });

    this.map.on('load', () => {
      this.firstDrawLayer = this.map.getStyle().layers
        .map(layer => layer.id)
        .filter(id => id.indexOf('.cold') >= 0 || id.indexOf('.hot') >= 0)[0];

      this.map.addSource(this.data.layer, {type: 'geojson', data: this.data.layerData});
      this.addLayer(this.data.layerStyle);

      // setTimeout(() => {
      //   this.layerStyle.paint['line-width'] = 30;
      //   console.log('changing layer style');
      //   this.addLayer(this.layerStyle);
      // }, 0);
    });
  }

  public close() {
    this.dialog.close();
  }

  public validate() {
    this.dialog.close(this.layerStyle);
  }

  public editLayerStyle() {
    this.layerStyle.paint['fill-opacity'] = 1;
  }

  private addLayer(layer: mapboxgl.Layer): void {
    /** Add the layer if it is not already added */
    if (this.map.getLayer(layer.id) === undefined) {
      if (this.firstDrawLayer && this.firstDrawLayer.length > 0) {
        /** draw layers must be on the top of the layers */
        this.map.addLayer(<mapboxgl.AnyLayer>layer, this.firstDrawLayer);
      } else {
        this.map.addLayer(<mapboxgl.AnyLayer>layer);
      }
    } else {
      this.map.removeLayer(layer.id);
      this.addLayer(layer);
    }
  }
}
