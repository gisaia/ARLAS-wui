/*
 * Licensed to Gisaïa under one or more contributor
 * license agreements. See the NOTICE.txt file distributed with
 * this work for additional information regarding copyright
 * ownership. Gisaïa licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
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
  AoiEdition, BasemapStyle, BboxGeneratorComponent, GeoQuery, MapglComponent,
  MapglImportComponent, MapglSettingsComponent, SCROLLABLE_ARLAS_ID
} from 'arlas-web-components';
import { MapContributor } from 'arlas-web-contributors';
import { LegendData } from 'arlas-web-contributors/contributors/MapContributor';
import {
  ArlasCollaborativesearchService, ArlasCollectionService, ArlasConfigService, ArlasIamService, ArlasMapService,
  ArlasMapSettings, ArlasSettingsService, ArlasStartupService, AuthentificationService, getParamValue
} from 'arlas-wui-toolkit';
import * as mapboxgl from 'mapbox-gl';
import { BehaviorSubject, debounceTime, fromEvent, merge, mergeMap, Observable, of, Subject, takeUntil } from 'rxjs';

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

  /** Map move */
  public fitbounds: Array<Array<number>> = [];
  public recalculateExtent = true;
  public zoomChanged = false;
  public zoomStart: number;
  private disableRecalculateExtent = false;
  private cumulatedXMoveRatio = 0;
  private cumulatedYMoveRatio = 0;

  /** Extent in url */
  private readonly allowMapExtent: boolean;
  private mapBounds: mapboxgl.LngLatBounds;
  private readonly mapEventListener = new Subject();
  private readonly mapExtentTimer: number;
  private MAP_EXTENT_PARAM = 'extend';

  /** Map data  */
  public mapDataSources;
  public mapRedrawSources;
  public mapLegendUpdater = new Subject<Map<string, Map<string, LegendData>>>();
  public mapVisibilityUpdater;

  /** Map Url enricher */
  public transformMapRequest;
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
  public maxFileSize = 5000000; // bytes
  public maxLoadingTime = 30000; // s

  /** Geocoding */
  protected showGeocodingPopup = new BehaviorSubject(false);
  protected enableGeocodingFeature = !!this.settingsService.getGeocodingSettings()?.enabled;

  /** Destroy subscriptions */
  private readonly _onDestroy$ = new Subject<boolean>();

  @ViewChild('map', { static: false }) public mapglComponent: MapglComponent;
  @ViewChild('import', { static: false }) public mapImportComponent: MapglImportComponent;
  @ViewChild('mapSettings', { static: false }) public mapSettings: MapglSettingsComponent;

  public constructor(
    protected mapService: MapService,
    private readonly toolkitMapService: ArlasMapService,
    protected visualizeService: VisualizeService,
    private readonly configService: ArlasConfigService,
    private readonly collaborativeService: ArlasCollaborativesearchService,
    protected arlasStartupService: ArlasStartupService,
    private readonly settingsService: ArlasSettingsService,
    private readonly generateAoiDialog: MatDialog,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly mapSettingsService: ArlasMapSettings,
    private readonly resultlistService: ResultlistService,
    private readonly translate: TranslateService,
    private readonly snackbar: MatSnackBar,
    private readonly iconRegistry: MatIconRegistry,
    private readonly domSanitizer: DomSanitizer,
    private readonly collectionService: ArlasCollectionService,
    private readonly authentService: AuthentificationService,
    private readonly arlasIamService: ArlasIamService
  ) {
    if (this.arlasStartupService.shouldRunApp && !this.arlasStartupService.emptyMode) {
      /** resize the map */
      fromEvent(window, 'resize')
        .pipe(debounceTime(100), takeUntil(this._onDestroy$))
        .subscribe((event: Event) => {
          this.mapService.resize();
        });

      this.mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
      if (this.mapComponentConfig) {
        this.mapService.setMapConfig(this.mapComponentConfig);
        this.defaultBasemap = this.mapComponentConfig.defaultBasemapStyle ?? DEFAULT_BASEMAP;
        this.mapExtentTimer = this.configService.getValue('arlas.web.components.mapgl.mapExtendTimer') ?? 4000;
        this.allowMapExtent = this.configService.getValue('arlas.web.components.mapgl.allowMapExtend');
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

      if (this.allowMapExtent) {
        const extentValue = getParamValue(this.MAP_EXTENT_PARAM);
        if (extentValue) {
          const stringBounds = extentValue.split(',');
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
      this.iconRegistry.addSvgIconLiteral('draw_circle', this.domSanitizer.bypassSecurityTrustHtml('<svg width="24" height="24" version="1.1" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="black" fill="transparent" stroke-width="3"/><circle r="2" cx="12" cy="12" fill="black" /></svg>'));

      // eslint-disable-next-line max-len
      this.iconRegistry.addSvgIconLiteral('remove_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"   width="20"   height="20"   id="svg5738"   version="1.1"   inkscape:version="0.91+devel+osxmenu r12911"   sodipodi:docname="trash.svg"   viewBox="0 0 20 20">  <defs     id="defs5740" />  <sodipodi:namedview     id="base"     pagecolor="#ffffff"     bordercolor="#666666"     borderopacity="1.0"     inkscape:pageopacity="0.0"     inkscape:pageshadow="2"     inkscape:zoom="22.627417"     inkscape:cx="12.128184"     inkscape:cy="8.8461307"     inkscape:document-units="px"     inkscape:current-layer="layer1"     showgrid="true"     inkscape:window-width="1033"     inkscape:window-height="751"     inkscape:window-x="20"     inkscape:window-y="23"     inkscape:window-maximized="0"     inkscape:snap-smooth-nodes="true"     inkscape:object-nodes="true">    <inkscape:grid       type="xygrid"       id="grid5746"       empspacing="5"       visible="true"       enabled="true"       snapvisiblegridlinesonly="true" />  </sodipodi:namedview>  <metadata     id="metadata5743">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />        <dc:title />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-1032.3622)">    <path       style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.99999982;marker:none;enable-background:accumulate" d="m 10,1035.7743 c -0.7849253,8e-4 -1.4968376,0.4606 -1.8203125,1.1758 l -3.1796875,0 -1,1 0,1 12,0 0,-1 -1,-1 -3.179688,0 c -0.323475,-0.7152 -1.035387,-1.175 -1.820312,-1.1758 z m -5,4.5879 0,7 c 0,1 1,2 2,2 l 6,0 c 1,0 2,-1 2,-2 l 0,-7 -2,0 0,5.5 -1.5,0 0,-5.5 -3,0 0,5.5 -1.5,0 0,-5.5 z"       id="rect2439-7"       inkscape:connector-curvature="0"       sodipodi:nodetypes="ccccccccccccccccccccccccc" />  </g></svg>'));

      // eslint-disable-next-line max-len
      this.iconRegistry.addSvgIconLiteral('import_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24pt" height="24pt" viewBox="0 0 24 24" version="1.1"><g id="surface1"><path style=" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;" d="M 9 16 L 15 16 L 15 10 L 19 10 L 12 3 L 5 10 L 9 10 Z M 5 18 L 19 18 L 19 20 L 5 20 Z M 5 18 "/></g></svg>'));
    }

    this.updateMapTransformRequest();

  }

  public ngAfterViewInit() {
    if (!this.arlasStartupService.emptyMode) {
      this.mapService.adjustCoordinates();

      this.mapEventListener
        .pipe(
          takeUntil(this._onDestroy$),
          debounceTime(this.mapExtentTimer))
        .subscribe(() => {
          /** Change map extent in the url */
          const bounds = (<mapboxgl.Map>this.mapglComponent.map).getBounds();
          const extent = bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth();
          const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
          queryParams[this.MAP_EXTENT_PARAM] = extent;
          this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
        });
    }
  }

  /** Updates the map url headers at each refresh.*/
  public updateMapTransformRequest() {
    const authentMode = this.settingsService.getAuthentSettings()?.auth_mode;
    const isAuthentActivated = !!this.settingsService.getAuthentSettings() && !!this.settingsService.getAuthentSettings().use_authent;
    if (isAuthentActivated) {
      if (authentMode === 'iam') {
        this.arlasIamService.tokenRefreshed$.pipe(takeUntil(this._onDestroy$)).subscribe({
          next: (loginData) => {
            if (loginData) {
              const org = this.arlasIamService.getOrganisation();
              const iamHeader = {
                Authorization: 'Bearer ' + loginData.access_token,
              };
              // Set the org filter only if the organisation is defined
              if (org) {
                iamHeader['arlas-org-filter'] = org;
              }
              this.setMapTransformRequest(iamHeader);
            } else {
              this.setMapTransformRequest();
            }
          }
        });
      } else {
        this.authentService.canActivateProtectedRoutes.pipe(takeUntil(this._onDestroy$)).subscribe(isConnected => {
          if (isConnected) {
            const headers = {
              Authorization: 'Bearer ' + this.authentService.accessToken
            };
            this.setMapTransformRequest(headers);
          } else {
            this.setMapTransformRequest();
          }
        });
      }
    } else {
      this.setMapTransformRequest();
    }
  }

  /** Enriches map url by an ARLAS header only if the map url is provided by ARLAS. */
  public setMapTransformRequest(headers?: any) {
    this.transformMapRequest = (url, resourceType) => {
      /** Wrapping with a try block because the URL() mdn docs says : 'Throws if the passed arguments don't define a valid URL.' */
      try {
        const mapServiceUrl = new URL(url);
        const appUrl = new URL(window.location.href);
        const mapServiceOrigin = mapServiceUrl.origin;
        const appOrigin = appUrl.origin;
        /** We enrich map url by an ARLAS header only if the map url is provided by ARLAS. */
        if (appOrigin === mapServiceOrigin && !!headers) {
          return ({
            url,
            headers,
          });
        } else {
          return ({ url });
        }
      } catch {
        return ({ url });
      }
    };
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
      if (this.mapBounds && this.allowMapExtent) {
        this.mapglComponent.map.fitBounds(this.mapBounds, { duration: 0 });
        this.mapBounds = null;
      }
      this.mapglComponent.map.on('movestart', (e) => {
        this.zoomStart = this.mapglComponent.map.getZoom();
      });
      this.mapglComponent.map.on('moveend', (e) => {
        if (Math.abs(this.mapglComponent.map.getZoom() - this.zoomStart) > 1) {
          this.zoomChanged = true;
        }
        if (this.allowMapExtent) {
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
      mc.downloadLayerSource(d.sourceName, d.layerName, d.downloadType, this.collectionService.displayFieldName);
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
        this.snackbar.open(this.translate.instant('Updating Geo-query of ',
          { collection: this.translate.instant(this.collectionService.getDisplayName(changedMapContributors[i].collection)) }));
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
      /** Change map extent in the url */
      const bounds = this.mapglComponent.map.getBounds();
      const extent = bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth();
      const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
      const visibileVisus = this.mapglComponent.visualisationSetsConfig.filter(v => v.enabled).map(v => v.name).join(';');
      queryParams[this.MAP_EXTENT_PARAM] = extent;
      queryParams['vs'] = visibileVisus;
      this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
      localStorage.setItem('currentExtent', JSON.stringify(bounds));

      const ratioToAutoSort = 0.1;
      this.mapService.centerLatLng.lat = event.centerWithOffset[1];
      this.mapService.centerLatLng.lng = event.centerWithOffset[0];
      this.cumulatedXMoveRatio += event.xMoveRatio;
      this.cumulatedYMoveRatio += event.yMoveRatio;
      if ((this.cumulatedXMoveRatio > ratioToAutoSort || this.cumulatedYMoveRatio > ratioToAutoSort || this.zoomChanged)) {
        this.recalculateExtent = true;
        this.cumulatedXMoveRatio = 0;
        this.cumulatedYMoveRatio = 0;
      }
      const newMapExtent = event.extendWithOffset;
      const newMapExtentRaw = event.rawExtendWithOffset;
      const pwithin = newMapExtent[1] + ',' + newMapExtent[2] + ',' + newMapExtent[3] + ',' + newMapExtent[0];
      const pwithinRaw = newMapExtentRaw[1] + ',' + newMapExtentRaw[2] + ',' + newMapExtentRaw[3] + ',' + newMapExtentRaw[0];
      if (this.recalculateExtent && !this.disableRecalculateExtent) {
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
      this.mapService.mapContributors.forEach(contrib => contrib.onMove(event, this.recalculateExtent));
      this.recalculateExtent = false;
    }
  }

  public onChangeAoi(event) {
    const configDebounceTime = this.configService.getValue('arlas.server.debounceCollaborationTime');
    const debounceDuration = configDebounceTime !== undefined ? configDebounceTime : 750;
    for (let i = 0; i < this.mapService.mapContributors.length; i++) {
      setTimeout(() => {
        this.snackbar.open(this.translate.instant('Loading data of ',
          { collection: this.translate.instant(this.collectionService.getDisplayName(this.mapService.mapContributors[i].collection)) }));
        this.mapService.mapContributors[i].onChangeAoi(event);
        if (i === this.mapService.mapContributors.length - 1) {
          setTimeout(() => this.snackbar.dismiss(), 1000);
        }
      }, (i) * ((debounceDuration + 100) * 1.5));
    }
  }

  public changeVisualisation(layers: Set<string>) {
    this.mapService.mapContributors.forEach(contrib => contrib.changeVisualisation(layers));
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

  public emitFeaturesOnClick(event) {
    if (event.features) {
      const feature = event.features[0];
      const resultListContributor = this.resultlistService.resultlistContributors
        .filter(c => feature.layer.metadata.collection === c.collection
          && !feature.layer.id.includes(SCROLLABLE_ARLAS_ID))[0];
      if (!!resultListContributor) {
        const idFieldName = this.resultlistService.collectionToDescription.get(resultListContributor.collection).id_path;
        const id = feature.properties[idFieldName.replace(/\./g, '_')];
        // Open the list panel if it's closed
        this.disableRecalculateExtent = true;
        if (!this.resultlistService.listOpen) {
          this.resultlistService.toggleList();
        }

        // Get index of list to display
        const contributorIds = this.resultlistService.resultlistContributors.map(c => c.identifier);
        const listIdx = contributorIds.findIndex(id => id === resultListContributor.identifier);
        this.resultlistService.selectedListTabIndex = listIdx;

        // Select the good tab if we have several
        // No tabs case
        if (this.resultlistService.resultlistContributors.length === 1) {
          this.resultlistService.waitForList(() => this.resultlistService.openDetail(id));
          this.disableRecalculateExtent = false;
        } else {
          this.resultlistService.waitForList(() => {
            // retrieve list
            const tab = document.querySelector('[aria-label="' + resultListContributor.identifier + '"]') as any;
            tab.click();
            // Set Timeout to wait the new tab
            setTimeout(() => this.resultlistService.openDetail(id), 250);
            this.disableRecalculateExtent = false;
          });
        }
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

  public drawCircle() {
    this.mapglComponent.switchToDrawMode('draw_radius_circle', { isFixedRadius: false, steps: 12 });
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
    this.recalculateExtent = true;
    this.mapglComponent.map.fitBounds(this.mapglComponent.map.getBounds());
  }
}
