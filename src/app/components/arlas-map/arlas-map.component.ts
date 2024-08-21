/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GeocodingResult } from '@services/geocoding.service';
import { MapService } from '@services/map.service';
import { ResultlistService } from '@services/resultlist.service';
import { VisualizeService } from '@services/visualize.service';
import {
  AoiEdition,
  BasemapStyle,
  BboxGeneratorComponent, GeoQuery, MapglComponent, MapglImportComponent, MapglSettingsComponent, SCROLLABLE_ARLAS_ID
} from 'arlas-web-components';
import { ElementIdentifier, MapContributor } from 'arlas-web-contributors';
import { LegendData } from 'arlas-web-contributors/contributors/MapContributor';
import {
  ArlasCollaborativesearchService, ArlasConfigService, ArlasMapService, ArlasMapSettings, ArlasSettingsService, ArlasStartupService, getParamValue
} from 'arlas-wui-toolkit';
import * as mapboxgl from 'mapbox-gl';
import { BehaviorSubject, debounceTime, fromEvent, merge, mergeMap, Observable, of, Subject, takeUntil, takeWhile } from 'rxjs';

const DEFAULT_BASEMAP: BasemapStyle = {
  styleFile: 'https://api.maptiler.com/maps/basic/style.json?key=xIhbu1RwgdbxfZNmoXn4',
  name: 'Basic'
};

@Component({
  selector: 'arlas-map',
  templateUrl: './arlas-map.component.html',
  styleUrls: ['./arlas-map.component.scss']
})
export class ArlasMapComponent implements OnInit {
  /** Map definition */
  public mapComponentConfig: any;
  public mapId = 'mapgl';
  public defaultBasemap: BasemapStyle;
  public mainMapContributor: MapContributor;
  public mainCollection: string;
  public mapAttributionPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  public mapLoaded = false;

  /** Map interactions */
  public featuresToSelect: Array<ElementIdentifier> = [];

  /** Map move */
  public centerLatLng: { lat: number; lng: number; } = { lat: 0, lng: 0 };
  public fitbounds: Array<Array<number>> = [];
  public recalculateExtend = true;
  public zoomChanged = false;
  public zoomStart: number;
  private disableRecalculateExtend = false;

  /** Extent in url */
  private allowMapExtend: boolean;
  private mapBounds: mapboxgl.LngLatBounds;
  private mapEventListener = new Subject();
  private mapExtendTimer: number;
  private MAP_EXTEND_PARAM = 'extend';

  /** Map data  */
  public mapDataSources;
  public mapRedrawSources;
  public mapLegendUpdater = new Subject<Map<string, Map<string, LegendData>>>();
  public mapVisibilityUpdater;
  /** Visibility status of layers on the map */
  public layersVisibilityStatus: Map<string, boolean> = new Map();

  /** Geo-filters */
  public isMapMenuOpen = false;
  public shouldCloseMapMenu = true;
  public aoiEdition: AoiEdition;
  public geojsondraw: { type: string; features: Array<any>; } = {
    'type': 'FeatureCollection',
    'features': []
  };

  /** Import geometries */
  public nbVerticesLimit = 50;
  public maxFeatures = 100;

  /** Geocoding */
  protected showGeocodingPopup = new BehaviorSubject(false);
  protected enableGeocodingFeature = !!this.settingsService.getGeocodingSettings()?.enabled;

  /** Destroy subscriptions */
  private _onDestroy$ = new Subject<boolean>();

  @ViewChild('map', { static: false }) public mapglComponent: MapglComponent;
  @ViewChild('import', { static: false }) public mapImportComponent: MapglImportComponent;
  @ViewChild('mapSettings', { static: false }) public mapSettings: MapglSettingsComponent;

  public constructor(
    protected mapService: MapService,
    private toolkitMapService: ArlasMapService,
    protected visualizeService: VisualizeService,
    private configService: ArlasConfigService,
    private collaborativeService: ArlasCollaborativesearchService,
    protected arlasStartupService: ArlasStartupService,
    private settingsService: ArlasSettingsService,
    private generateAoiDialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private mapSettingsService: ArlasMapSettings,
    private resultlistService: ResultlistService,
    private translate: TranslateService,
    private snackbar: MatSnackBar,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      /** resize the map */
      fromEvent(window, 'resize')
        .pipe(debounceTime(100), takeUntil(this._onDestroy$))
        .subscribe((event: Event) => {
          this.mapService.resize();
        });

      this.mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
      if (!!this.mapComponentConfig) {
        this.mapService.setMapConfig(this.mapComponentConfig);
        this.defaultBasemap = this.mapComponentConfig.defaultBasemapStyle ?? DEFAULT_BASEMAP;
        const mapExtendTimer = this.configService.getValue('arlas.web.components.mapgl.mapExtendTimer');
        this.mapExtendTimer = (mapExtendTimer !== undefined) ? mapExtendTimer : 4000;
        this.allowMapExtend = this.configService.getValue('arlas.web.components.mapgl.allowMapExtend');
        this.nbVerticesLimit = this.configService.getValue('arlas.web.components.mapgl.nbVerticesLimit');

        /** init from url */
        const queryParamVisibleVisualisations = getParamValue('vs');
        if (queryParamVisibleVisualisations) {
          const visibleVisuSet = new Set(queryParamVisibleVisualisations.split(';').map(n => decodeURI(n)));
          this.mapComponentConfig.visualisations_sets.forEach(v => v.enabled = visibleVisuSet.has(v.name));
        }
      } else {
        this.defaultBasemap = DEFAULT_BASEMAP;
      }
    } else {
      this.defaultBasemap = DEFAULT_BASEMAP;
    }
  }

  public ngOnInit(): void {
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      /** Prepare map data */
      this.mainCollection = this.configService.getValue('arlas.server.collection.name');
      this.mainMapContributor = this.mapService.mapContributors.filter(m => !!m.collection || m.collection === this.mainCollection)[0];
      this.mapDataSources = this.mapService.mapContributors.map(c => c.dataSources).length > 0 ?
        this.mapService.mapContributors.map(c => c.dataSources).reduce((set1, set2) => new Set([...set1, ...set2])) : new Set();
      this.mapRedrawSources = merge(...this.mapService.mapContributors.map(c => c.redrawSource));

      const legendUpdaters: Observable<{ collection: string; legendData: Map<string, LegendData>; }> =
        merge(...this.mapService.mapContributors
          .map(c => c.legendUpdater
            .pipe(mergeMap(m => of({ collection: c.collection, legendData: m })))
          ));
      const legendData = new Map<string, Map<string, LegendData>>();
      legendUpdaters
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(lg => {
          legendData.set(lg.collection, lg.legendData);
          this.mapLegendUpdater.next(legendData);
        });

      this.mapVisibilityUpdater = merge(...this.mapService.mapContributors.map(c => c.visibilityUpdater));
      this.mapService.mapContributors.forEach(contrib => contrib.drawingsUpdate.subscribe(() => {
        this.geojsondraw = {
          'type': 'FeatureCollection',
          'features': this.mapService.mapContributors.map(c => c.geojsondraw.features).reduce((a, b) => a.concat(b))
            .filter((v, i, a) => a.findIndex(t => (t.properties.arlas_id === v.properties.arlas_id)) === i)
        };
      }));

      if (this.allowMapExtend) {
        const extendValue = getParamValue(this.MAP_EXTEND_PARAM);
        if (extendValue) {
          const stringBounds = extendValue.split(',');
          if (stringBounds.length === 4) {
            this.mapBounds = new mapboxgl.LngLatBounds(
              new mapboxgl.LngLat(+stringBounds[0], +stringBounds[1]),
              new mapboxgl.LngLat(+stringBounds[2], +stringBounds[3])
            );
          }
        }
      }

      // eslint-disable-next-line max-len
      this.iconRegistry.addSvgIconLiteral('bbox', this.domSanitizer.bypassSecurityTrustHtml('<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'));

      // eslint-disable-next-line max-len
      this.iconRegistry.addSvgIconLiteral('draw_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"   width="20"   height="20"   viewBox="0 0 20 20"   id="svg19167"   version="1.1"   inkscape:version="0.91+devel+osxmenu r12911"   sodipodi:docname="square.svg">  <defs     id="defs19169" />  <sodipodi:namedview     id="base"     pagecolor="#ffffff"     bordercolor="#666666"     borderopacity="1.0"     inkscape:pageopacity="0.0"     inkscape:pageshadow="2"     inkscape:zoom="11.313708"     inkscape:cx="11.681634"     inkscape:cy="9.2857143"     inkscape:document-units="px"     inkscape:current-layer="layer1"     showgrid="true"     units="px"     inkscape:window-width="1280"     inkscape:window-height="751"     inkscape:window-x="0"     inkscape:window-y="23"     inkscape:window-maximized="0"     inkscape:object-nodes="true">    <inkscape:grid       type="xygrid"       id="grid19715" />  </sodipodi:namedview>  <metadata     id="metadata19172">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />        <dc:title />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-1032.3622)">    <path       inkscape:connector-curvature="0"       style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.5;marker:none;enable-background:accumulate"       d="m 5,1039.3622 0,6 2,2 6,0 2,-2 0,-6 -2,-2 -6,0 z m 3,0 4,0 1,1 0,4 -1,1 -4,0 -1,-1 0,-4 z" id="rect7797" sodipodi:nodetypes="cccccccccccccccccc" /><circle style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" id="path4364" cx="6" cy="1046.3622" r="2" /><circle id="path4368" style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" cx="14" cy="1046.3622" r="2" /><circle id="path4370" style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" cx="6" cy="1038.3622" r="2" /><circle style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" id="path4372" cx="14" cy="1038.3622" r="2" /> </g></svg>'));

      // eslint-disable-next-line max-len
      this.iconRegistry.addSvgIconLiteral('remove_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"   width="20"   height="20"   id="svg5738"   version="1.1"   inkscape:version="0.91+devel+osxmenu r12911"   sodipodi:docname="trash.svg"   viewBox="0 0 20 20">  <defs     id="defs5740" />  <sodipodi:namedview     id="base"     pagecolor="#ffffff"     bordercolor="#666666"     borderopacity="1.0"     inkscape:pageopacity="0.0"     inkscape:pageshadow="2"     inkscape:zoom="22.627417"     inkscape:cx="12.128184"     inkscape:cy="8.8461307"     inkscape:document-units="px"     inkscape:current-layer="layer1"     showgrid="true"     inkscape:window-width="1033"     inkscape:window-height="751"     inkscape:window-x="20"     inkscape:window-y="23"     inkscape:window-maximized="0"     inkscape:snap-smooth-nodes="true"     inkscape:object-nodes="true">    <inkscape:grid       type="xygrid"       id="grid5746"       empspacing="5"       visible="true"       enabled="true"       snapvisiblegridlinesonly="true" />  </sodipodi:namedview>  <metadata     id="metadata5743">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />        <dc:title />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-1032.3622)">    <path       style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.99999982;marker:none;enable-background:accumulate" d="m 10,1035.7743 c -0.7849253,8e-4 -1.4968376,0.4606 -1.8203125,1.1758 l -3.1796875,0 -1,1 0,1 12,0 0,-1 -1,-1 -3.179688,0 c -0.323475,-0.7152 -1.035387,-1.175 -1.820312,-1.1758 z m -5,4.5879 0,7 c 0,1 1,2 2,2 l 6,0 c 1,0 2,-1 2,-2 l 0,-7 -2,0 0,5.5 -1.5,0 0,-5.5 -3,0 0,5.5 -1.5,0 0,-5.5 z"       id="rect2439-7"       inkscape:connector-curvature="0"       sodipodi:nodetypes="ccccccccccccccccccccccccc" />  </g></svg>'));

      // eslint-disable-next-line max-len
      this.iconRegistry.addSvgIconLiteral('import_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24pt" height="24pt" viewBox="0 0 24 24" version="1.1"><g id="surface1"><path style=" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;" d="M 9 16 L 15 16 L 15 10 L 19 10 L 12 3 L 5 10 L 9 10 Z M 5 18 L 19 18 L 19 20 L 5 20 Z M 5 18 "/></g></svg>'));

      // eslint-disable-next-line max-len
      this.iconRegistry.addSvgIconLiteral('map_settings', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22px" height="22px" viewBox="0 0 22 22" version="1.1"><g id="surface1"><path style=" stroke:none;fill-rule:evenodd;fill:rgb(0%,0%,0%);fill-opacity:1;" d="M 0.554688 1.101562 C 0.25 1.097656 0 1.34375 0 1.648438 L 0 17.113281 C 0 17.328125 0.125 17.523438 0.320312 17.613281 L 7.285156 20.847656 C 7.359375 20.882812 7.441406 20.902344 7.523438 20.898438 C 7.601562 20.898438 7.675781 20.882812 7.75 20.847656 L 14.484375 17.71875 L 21.21875 20.847656 C 21.582031 21.019531 22 20.75 22 20.351562 L 22 7.988281 L 20.898438 9.34375 L 20.898438 19.488281 L 14.8125 16.660156 L 14.769531 9.792969 L 14.113281 9.917969 L 14.152344 16.660156 L 7.84375 19.59375 L 7.761719 5.378906 L 11.335938 3.71875 L 12.074219 2.160156 L 7.515625 4.28125 L 0.78125 1.152344 C 0.710938 1.117188 0.632812 1.101562 0.554688 1.101562 Z M 1.101562 2.511719 L 7.101562 5.300781 L 7.183594 19.589844 L 1.101562 16.761719 Z M 1.101562 2.511719 "/><path style=" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;" d="M 16.308594 0 C 16.171875 0 16.058594 0.109375 16.058594 0.246094 L 16.058594 1.632812 C 15.832031 1.699219 15.613281 1.792969 15.40625 1.90625 L 14.425781 0.925781 C 14.378906 0.878906 14.3125 0.851562 14.246094 0.851562 C 14.183594 0.851562 14.121094 0.878906 14.074219 0.925781 L 13.023438 1.976562 C 12.929688 2.070312 12.929688 2.226562 13.023438 2.324219 L 14.003906 3.304688 C 13.890625 3.511719 13.800781 3.730469 13.730469 3.960938 L 12.347656 3.960938 C 12.210938 3.960938 12.101562 4.070312 12.101562 4.207031 L 12.101562 5.691406 C 12.101562 5.828125 12.210938 5.941406 12.347656 5.941406 L 13.730469 5.941406 C 13.800781 6.167969 13.890625 6.386719 14.003906 6.59375 L 13.023438 7.574219 C 12.929688 7.671875 12.929688 7.828125 13.023438 7.925781 L 14.074219 8.976562 C 14.171875 9.070312 14.328125 9.070312 14.425781 8.976562 L 15.40625 7.996094 C 15.613281 8.109375 15.832031 8.199219 16.058594 8.269531 L 16.058594 9.652344 C 16.058594 9.789062 16.171875 9.898438 16.308594 9.898438 L 17.792969 9.898438 C 17.929688 9.898438 18.039062 9.789062 18.039062 9.652344 L 18.039062 8.269531 C 18.269531 8.199219 18.488281 8.109375 18.695312 7.996094 L 19.675781 8.976562 C 19.773438 9.070312 19.929688 9.070312 20.023438 8.976562 L 21.074219 7.925781 C 21.171875 7.828125 21.171875 7.671875 21.074219 7.574219 L 20.09375 6.59375 C 20.207031 6.386719 20.300781 6.167969 20.367188 5.941406 L 21.753906 5.941406 C 21.890625 5.941406 22 5.828125 22 5.691406 L 22 4.207031 C 22 4.070312 21.890625 3.960938 21.753906 3.960938 L 20.367188 3.960938 C 20.300781 3.730469 20.207031 3.511719 20.09375 3.304688 L 21.074219 2.324219 C 21.171875 2.226562 21.171875 2.070312 21.074219 1.976562 L 20.023438 0.925781 C 19.976562 0.878906 19.914062 0.851562 19.847656 0.851562 C 19.78125 0.851562 19.722656 0.878906 19.675781 0.925781 L 18.695312 1.90625 C 18.488281 1.792969 18.269531 1.699219 18.039062 1.632812 L 18.039062 0.246094 C 18.039062 0.109375 17.929688 0 17.792969 0 Z M 17.050781 3.21875 C 18.015625 3.21875 18.78125 3.984375 18.78125 4.949219 C 18.78125 5.917969 18.015625 6.683594 17.050781 6.683594 C 16.082031 6.683594 15.316406 5.917969 15.316406 4.949219 C 15.316406 3.984375 16.082031 3.21875 17.050781 3.21875 Z M 17.050781 3.21875 "/></g></svg>'));
    }
  }

  public ngAfterViewInit() {
    if (!this.arlasStartupService.emptyMode) {
      this.mapService.adjustCoordinates();

      this.mapEventListener
        .pipe(
          takeUntil(this._onDestroy$),
          debounceTime(this.mapExtendTimer))
        .subscribe(() => {
          /** Change map extent in the url */
          const bounds = (<mapboxgl.Map>this.mapglComponent.map).getBounds();
          const extend = bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth();
          const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
          queryParams[this.MAP_EXTEND_PARAM] = extend;
          this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
        });
    }
  }

  /**
   * Wait until the map component is loaded before fetching the data
   * @param isLoaded Whether the map has loaded
   */
  public onMapLoaded(isLoaded: boolean): void {
    if (isLoaded && !this.arlasStartupService.emptyMode) {
      this.mapLoaded = true;
      this.mapService.setMapComponent(this.mapglComponent);
      this.toolkitMapService.setMap(this.mapglComponent.map);
      this.visualizeService.setMap(this.mapglComponent.map);
      if (this.mapBounds && this.allowMapExtend) {
        (<mapboxgl.Map>this.mapglComponent.map).fitBounds(this.mapBounds, { duration: 0 });
        this.mapBounds = null;
      }
      this.mapglComponent.map.on('movestart', (e) => {
        this.zoomStart = this.mapglComponent.map.getZoom();
      });
      this.mapglComponent.map.on('moveend', (e) => {
        if (Math.abs(this.mapglComponent.map.getZoom() - this.zoomStart) > 1) {
          this.zoomChanged = true;
        }
        if (this.allowMapExtend) {
          this.mapEventListener.next(null);
        }
      });
      this.adjustMapOffset();
      this.mapService.adjustCoordinates();
      this.mapService.mapContributors.forEach(mapglContributor => {
        mapglContributor.updateData = true;
        mapglContributor.fetchData(null);
        mapglContributor.setSelection(null, this.collaborativeService.getCollaboration(mapglContributor.identifier));
      });

      if (!!this.resultlistService.previewListContrib && this.resultlistService.previewListContrib.data.length > 0 &&
          this.mapComponentConfig.mapLayers.events.onHover.filter(l => this.mapglComponent.map.getLayer(l)).length > 0) {
        this.resultlistService.updateVisibleItems();
      }
    }
  }

  public ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.complete();
  }

  public openAoiGenerator() {
    this.generateAoiDialog.open(BboxGeneratorComponent, {
      data: {
        initCorner: {
          lat: this.mapComponentConfig.initCenter ? this.mapComponentConfig.initCenter[1] : 0,
          lng: this.mapComponentConfig.initCenter ? this.mapComponentConfig.initCenter[0] : 0,
        }
      }
    });
  }

  public downloadLayerSource(d) {
    const mc = this.mapService.mapContributors.find(mc => mc.collection === d.collection);
    if (mc) {
      mc.downloadLayerSource(d.sourceName, d.layerName, d.downloadType);
    }
  }

  public openMapSettings(): void {
    this.mapSettingsService.mapContributors = this.mapService.mapContributors;
    this.mapSettings.openDialog(this.mapSettingsService);
  }

  /**
   * Applies the selected geo query
   */
  public applySelectedGeoQuery(geoQueries: Map<string, GeoQuery>) {
    const configDebounceTime = this.configService.getValue('arlas.server.debounceCollaborationTime');
    const debounceDuration = configDebounceTime !== undefined ? configDebounceTime : 750;
    const changedMapContributors = this.mapService.mapContributors.filter(mc => !!geoQueries.has(mc.collection));
    for (let i = 0; i < changedMapContributors.length; i++) {
      setTimeout(() => {
        const collection = changedMapContributors[i].collection;
        const geoQuery = geoQueries.get(collection);
        changedMapContributors[i].setGeoQueryOperation(geoQuery.operation);
        changedMapContributors[i].setGeoQueryField(geoQuery.geometry_path);
        changedMapContributors[i].onChangeGeoQuery();
        this.snackbar.open(this.translate.instant('Updating Geo-query of') + ' ' + changedMapContributors[i].collection);
        if (i === changedMapContributors.length - 1) {
          setTimeout(() => this.snackbar.dismiss(), 1000);
        }

      }, (i) * (debounceDuration * 1.5));
    }

  }

  public setLayersVisibilityStatus(event) {
    this.layersVisibilityStatus = event;
  }

  public reloadMapImages() {
    this.visualizeService.setMap(this.mapglComponent.map);
  }

  public onAoiEdit(aoiEdit: AoiEdition) {
    this.aoiEdition = aoiEdit;
  }

  public onMove(event) {
    // Update data only when the collections info are presents
    if (this.resultlistService.collectionToDescription.size > 0) {
      /** Change map extend in the url */
      const bounds = (<mapboxgl.Map>this.mapglComponent.map).getBounds();
      const extend = bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth();
      const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
      const visibileVisus = this.mapglComponent.visualisationSetsConfig.filter(v => v.enabled).map(v => v.name).join(';');
      queryParams[this.MAP_EXTEND_PARAM] = extend;
      queryParams['vs'] = visibileVisus;
      this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
      localStorage.setItem('currentExtent', JSON.stringify(bounds));

      const ratioToAutoSort = 0.1;
      this.centerLatLng['lat'] = event.centerWithOffset[1];
      this.centerLatLng['lng'] = event.centerWithOffset[0];
      if ((event.xMoveRatio > ratioToAutoSort || event.yMoveRatio > ratioToAutoSort || this.zoomChanged)) {
        this.recalculateExtend = true;
      }
      const newMapExtent = event.extendWithOffset;
      const newMapExtentRaw = event.rawExtendWithOffset;
      const pwithin = newMapExtent[1] + ',' + newMapExtent[2] + ',' + newMapExtent[3] + ',' + newMapExtent[0];
      const pwithinRaw = newMapExtentRaw[1] + ',' + newMapExtentRaw[2] + ',' + newMapExtentRaw[3] + ',' + newMapExtentRaw[0];
      if (this.recalculateExtend && !this.disableRecalculateExtend) {
        this.resultlistService.applyMapExtent(pwithinRaw, pwithin);

        this.mapService.mapContributors.forEach(c => {
          if (!!this.resultlistService.resultlistContributors) {
            const resultlistContrbutor = this.resultlistService.resultlistContributors.find(v => v.collection === c.collection);
            if (!!resultlistContrbutor) {
              if (this.resultlistService.isGeoSortActivated.get(c.identifier)) {
                c.searchSort = resultlistContrbutor.geoOrderSort;
              } else {
                c.searchSort = resultlistContrbutor.sort;
              }
              this.collaborativeService.registry.set(c.identifier, c);
            }
          }
          this.mapService.clearWindowData(c);
        });
        this.zoomChanged = false;
      }
      event.extendForTest = newMapExtent;
      event.rawExtendForTest = newMapExtentRaw;
      this.mapService.mapContributors.forEach(contrib => contrib.onMove(event, this.recalculateExtend));
      this.recalculateExtend = false;
    }
  }

  public onChangeAoi(event) {
    const configDebounceTime = this.configService.getValue('arlas.server.debounceCollaborationTime');
    const debounceDuration = configDebounceTime !== undefined ? configDebounceTime : 750;
    for (let i = 0; i < this.mapService.mapContributors.length; i++) {
      setTimeout(() => {
        this.snackbar.open(this.translate.instant('Loading data of') + ' ' + this.mapService.mapContributors[i].collection);
        this.mapService.mapContributors[i].onChangeAoi(event);
        if (i === this.mapService.mapContributors.length - 1) {
          setTimeout(() => this.snackbar.dismiss(), 1000);
        }
      }, (i) * ((debounceDuration + 100) * 1.5));
    }
  }

  public changeVisualisation(event) {
    this.mapService.mapContributors.forEach(contrib => contrib.changeVisualisation(event));
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    const visibileVisus = this.mapglComponent.visualisationSetsConfig.filter(v => v.enabled).map(v => v.name).join(';');
    queryParams['vs'] = visibileVisus;
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
  }

  public emitFeaturesOnHover(event) {
    if (event.features) {
      this.mapService.setCursor('pointer');
      this.resultlistService.highlightItems(event.features);
    } else {
      this.mapService.setCursor('');
      this.resultlistService.clearHighlightedItems();
    }
  }

  public emitFeaturesOnClic(event) {
    if (event.features) {
      const feature = event.features[0];
      const resultListContributor = this.resultlistService.resultlistContributors
        .filter(c => feature.layer.metadata.collection === c.collection
          && !feature.layer.id.includes(SCROLLABLE_ARLAS_ID))[0];
      if (!!resultListContributor) {
        const idFieldName = this.resultlistService.collectionToDescription.get(resultListContributor.collection).id_path;
        const id = feature.properties[idFieldName.replace(/\./g, '_')];
        // Open the list panel if it's closed
        this.disableRecalculateExtend = true;
        if (!this.resultlistService.listOpen) {
          this.resultlistService.toggleList();
        }

        // Get index of list to display
        const contributorIds = this.resultlistService.resultlistContributors.map(c => c.identifier);
        const listIdx = contributorIds.findIndex(id => id === resultListContributor.identifier);
        this.resultlistService.selectedListTabIndex = listIdx;

        // Set Timeout to wait for the detail to be open
        setTimeout(() => {
          let isDone = false;
          this.resultlistService.openDetail$(id)
            .pipe(takeUntil(this._onDestroy$), takeWhile(() => !isDone))
            .subscribe(r => {
              if (r) {
                this.disableRecalculateExtend = false;
                isDone = true;
              }
            });
        }, 250);
      }
    }
  }

  public closeMapMenu() {
    setTimeout(() => {
      if (this.shouldCloseMapMenu) {
        this.isMapMenuOpen = false;
      }
    }, 100);
  }

  protected goToLocation(event: GeocodingResult) {
    const bbox = this.visualizeService.getBbox(event.geojson);
    this.visualizeService.handleGeojsonPreview(event.geojson);
    if (event.geojson.type === 'Point') {
      const zoom = this.settingsService.getGeocodingSettings().find_place_zoom_to;
      this.mapglComponent.map.fitBounds(bbox, { maxZoom: zoom });
    } else {
      this.mapglComponent.map.fitBounds(bbox);
    }
  }

  private adjustMapOffset() {
    this.recalculateExtend = true;
    this.mapglComponent.map.fitBounds(this.mapglComponent.map.getBounds());
  }
}
