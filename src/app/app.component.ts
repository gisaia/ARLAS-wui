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
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatTabGroup } from '@angular/material/tabs';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionReferenceParameters } from 'arlas-api';
import {
  BasemapStyle, CellBackgroundStyleEnum, ChartType, DataType, GeoQuery, MapglComponent, MapglImportComponent,
  MapglSettingsComponent, ModeEnum, Position, SCROLLABLE_ARLAS_ID, SortEnum
} from 'arlas-web-components';
import { Item } from 'arlas-web-components/components/results/model/item';
import { ResultDetailedItemComponent } from 'arlas-web-components/components/results/result-detailed-item/result-detailed-item.component';
import { PageQuery } from 'arlas-web-components/components/results/utils/results.utils';
import {
  AnalyticsContributor, ChipsSearchContributor,
  ElementIdentifier, FeatureRenderMode, HistogramContributor,
  MapContributor,
  ResultListContributor
} from 'arlas-web-contributors';
import {
  ArlasCollaborativesearchService, ArlasColorGeneratorLoader, ArlasConfigService,
  ArlasMapService, ArlasMapSettings, ArlasStartupService, CollectionUnit
} from 'arlas-wui-toolkit';
import { TimelineComponent } from 'arlas-wui-toolkit/components/timeline/timeline/timeline.component';
import * as mapboxgl from 'mapbox-gl';
import { fromEvent, merge, Subject, timer, zip } from 'rxjs';
import { debounceTime, takeWhile } from 'rxjs/operators';
import { MenuState } from './components/left-menu/left-menu.component';
import { ContributorService } from './services/contributors.service';
import { DynamicComponentService } from './services/dynamicComponent.service';
import { SidenavService } from './services/sidenav.service';
import { VisualizeService } from './services/visualize.service';
import { ArlasSettingsService } from 'arlas-wui-toolkit/services/settings/arlas.settings.service';

@Component({
  selector: 'arlas-wui-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class ArlasWuiComponent implements OnInit, AfterViewInit {
  @Input() public version: string;
  @Output() public actionOnPopup = new Subject<{
    action: {
      id: string;
      label: string;
      collection: string,
      cssClass?: string | string[];
      tooltip?: string;
    };
    elementidentifier: ElementIdentifier;
  }>();
  @Output() public actionOnList = new Subject<{ origin: string, event: string, data: any }>();


  public modeEnum = ModeEnum;
  public mapglContributors: Array<MapContributor> = new Array();
  public chipsSearchContributor: ChipsSearchContributor;
  public timelineContributor: HistogramContributor;
  public resultlistContributors: Array<ResultListContributor> = new Array();
  public analyticsContributor: AnalyticsContributor;

  public sortOutput = new Map<string, { fieldName: string, sortDirection: SortEnum }>();

  public analytics: Array<any>;
  public refreshButton: any;
  public dataType = DataType;
  public chartType = ChartType;
  public position = Position;

  public appName: string;
  public appUnits: CollectionUnit[];
  public appNameBackgroundColor: string;

  // component config
  public mapComponentConfig: any;
  public timelineComponentConfig: any;
  public detailedTimelineComponentConfig: any;
  public resultListsConfig = [];
  public resultListConfigPerContId = new Map<string, any>();

  public fitbounds: Array<Array<number>> = [];
  public featureToHightLight: {
    isleaving: boolean,
    elementidentifier: ElementIdentifier
  };
  public featuresToSelect: Array<ElementIdentifier> = [];
  private allowMapExtend: boolean;
  private mapBounds: mapboxgl.LngLatBounds;
  private mapEventListener = new Subject();
  private mapExtendTimer: number;
  private MAP_EXTEND_PARAM = 'extend';

  public nbVerticesLimit = 50;
  public isMapMenuOpen = false;

  public menuState: MenuState;
  public analyticsOpen = true;
  public searchOpen = true;

  public centerLatLng: { lat: number; lng: number } = { lat: 0, lng: 0 };
  public offset = { north: 0, east: 0, south: -128, west: 465 };

  public listOpen = false;
  public selectedListTabIndex = 0;
  public previewListContrib: ResultListContributor = null;
  public rightListContributors: Array<ResultListContributor> = new Array();

  /* Options */
  public spinner: { show: boolean, diameter: string, color: string, strokeWidth: number }
    = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };

  public showZoomToData = false;
  public showIndicators = false;
  public onSideNavChange: boolean;

  public defaultBaseMap;

  public mapDataSources;

  public mapRedrawSources;
  public mapLegendUpdater;
  public mapVisibilityUpdater;
  /** Visibility status of layers on the map */
  public layersVisibilityStatus: Map<string, boolean> = new Map();
  public mainMapContributor;
  public mainCollection;
  public geojsondraw: { type: string, features: Array<any> } = {
    'type': 'FeatureCollection',
    'features': []
  };

  public recalculateExtend = true;
  public zoomChanged = false;
  public zoomStart: number;

  public isGeoSortActivated = new Map<string, boolean>();
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();
  public apploading = true;
  @ViewChild('map', { static: false }) public mapglComponent: MapglComponent;
  @ViewChild('import', { static: false }) public mapImportComponent: MapglImportComponent;
  @ViewChild('mapSettings', { static: false }) public mapSettings: MapglSettingsComponent;
  @ViewChild('tabsList', { static: false }) public tabsList: MatTabGroup;
  @ViewChild('timeline', { static: false }) public timelineComponent: TimelineComponent;

  constructor(
    private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    public arlasStartUpService: ArlasStartupService,
    private mapSettingsService: ArlasMapSettings,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private mapService: ArlasMapService,
    private colorGenerator: ArlasColorGeneratorLoader,
    private sidenavService: SidenavService,
    private titleService: Title,
    private arlasSettingsService: ArlasSettingsService,
    private dynamicComponentService: DynamicComponentService,
    public visualizeService: VisualizeService
  ) {
    this.menuState = {
      configs: false
    };
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      /** resize the map */
      fromEvent(window, 'resize').pipe(debounceTime(100))
        .subscribe((event: Event) => {
          this.mapglComponent.map.resize();
        });
      /** trigger 'resize' event after toggling sidenav  */
      this.sidenavService.sideNavState.subscribe(res => {
        this.onSideNavChange = res;
        window.dispatchEvent(new Event('resize'));
      });

      this.appName = !!this.configService.appName ? this.configService.appName :
        this.configService.getValue('arlas-wui.web.app.name') ?
          this.configService.getValue('arlas-wui.web.app.name') : 'ARLAS';

      this.appUnits = this.configService.getValue('arlas-wui.web.app.units') ?
        this.configService.getValue('arlas-wui.web.app.units') : [];
      /** retrocompatibility code for unit*/
      const appUnit = this.configService.getValue('arlas-wui.web.app.unit');
      if (appUnit) {
        this.appUnits.push({
          collection: this.collaborativeService.defaultCollection,
          unit: appUnit,
          ignored: false
        });
      }
      /** end of retrocompatibility code */
      this.appNameBackgroundColor = this.configService.getValue('arlas-wui.web.app.name_background_color') ?
        this.configService.getValue('arlas-wui.web.app.name_background_color') : '#FF4081';
      this.analyticsContributor = this.arlasStartUpService.contributorRegistry.get('analytics');
      this.mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
      this.resultListsConfig = this.configService.getValue('arlas.web.components.resultlists') ?
        this.configService.getValue('arlas.web.components.resultlists') : [];
      const mapExtendTimer = this.configService.getValue('arlas.web.components.mapgl.mapExtendTimer');
      this.mapExtendTimer = (mapExtendTimer !== undefined) ? mapExtendTimer : 4000;
      this.allowMapExtend = this.configService.getValue('arlas.web.components.mapgl.allowMapExtend');
      this.nbVerticesLimit = this.configService.getValue('arlas.web.components.mapgl.nbVerticesLimit');
      this.timelineComponentConfig = this.configService.getValue('arlas.web.components.timeline');
      this.detailedTimelineComponentConfig = this.configService.getValue('arlas.web.components.detailedTimeline');
      this.analytics = this.configService.getValue('arlas.web.analytics');
      this.refreshButton = this.configService.getValue('arlas-wui.web.app.refresh');
      this.mainCollection = this.configService.getValue('arlas.server.collection.name');
      this.defaultBaseMap = !!this.mapComponentConfig.defaultBasemapStyle ? this.mapComponentConfig.defaultBasemapStyle :
        {
          styleFile: 'http://demo.arlas.io:82/styles/positron/style.json',
          name: 'Positron'
        };

      if (this.configService.getValue('arlas.web.options.spinner')) {
        this.spinner = Object.assign(this.spinner, this.configService.getValue('arlas.web.options.spinner'));
      }
      if (this.configService.getValue('arlas.web.options.zoom_to_data')) {
        this.showZoomToData = true;
      }
      if (this.configService.getValue('arlas.web.options.indicators')) {
        this.showIndicators = true;
      }
    } else {
      this.defaultBaseMap = {
        styleFile: 'http://demo.arlas.io:82/styles/positron/style.json',
        name: 'Positron'
      };
    }
  }


  public ngOnInit() {
    this.setAppTitle();
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      this.mapglContributors = this.contributorService.getMapContributors();
      this.mainMapContributor = this.mapglContributors.filter(m => !!m.collection || m.collection === this.mainCollection)[0];
      this.mapDataSources = this.mapglContributors.map(c => c.dataSources).length > 0 ?
        this.mapglContributors.map(c => c.dataSources).reduce((set1, set2) => new Set([...set1, ...set2])) : new Set();
      this.mapRedrawSources = merge(...this.mapglContributors.map(c => c.redrawSource));
      this.mapLegendUpdater = merge(...this.mapglContributors.map(c => c.legendUpdater));
      this.mapVisibilityUpdater = merge(...this.mapglContributors.map(c => c.visibilityUpdater));
      this.mapglContributors.forEach(contrib => contrib.drawingsUpdate.subscribe(() => {
        this.geojsondraw = {
          'type': 'FeatureCollection',
          'features': this.mapglContributors.map(c => c.geojsondraw.features).reduce((a, b) => a.concat(b))
            .filter((v, i, a) => a.findIndex(t => (t.properties.arlas_id === v.properties.arlas_id)) === i)
        };
      }));

      this.chipsSearchContributor = this.contributorService.getChipSearchContributor();
      this.arlasStartUpService.contributorRegistry.forEach((v, k) => {
        if (v instanceof ResultListContributor) {
          this.resultlistContributors.push(v);
        }
      });
      if (this.resultlistContributors.length > 0) {
        this.rightListContributors = this.resultlistContributors
          .filter(c => this.resultListsConfig.some((rc) => c.identifier === rc.contributorId))
          .map(rlcontrib => {
            (rlcontrib as any).name = rlcontrib.getName();
            return rlcontrib;
          });

        this.resultListsConfig.forEach(rlConf => {
          rlConf.input.cellBackgroundStyle = !!rlConf.input.cellBackgroundStyle ?
            CellBackgroundStyleEnum[rlConf.input.cellBackgroundStyle] : undefined;
          this.resultListConfigPerContId.set(rlConf.contributorId, rlConf.input);
        });

        this.resultlistContributors.forEach(c => {
          const mapcontributor = this.mapglContributors.find(mc => mc.collection === c.collection);
          if (!!mapcontributor) {
            c.addAction({ id: 'zoomToFeature', label: 'Zoom to', cssClass: '', tooltip: 'Zoom to product' });
          }
          if (!!this.resultListConfigPerContId.get(c.identifier)) {
            if (!!this.resultListConfigPerContId.get(c.identifier).visualisationLink) {
              c.addAction({ id: 'visualize', label: 'Visualize', cssClass: '', tooltip: 'Visualize on the map' });
            }
            if (!!this.resultListConfigPerContId.get(c.identifier).downloadLink) {
              c.addAction({ id: 'download', label: 'Download', cssClass: '', tooltip: 'Download' });
            }
          }
        });
        this.previewListContrib = this.rightListContributors[0];
      }
      this.actionOnPopup.subscribe(data => {
        const collection = data.action.collection;
        const mapContributor = this.mapglContributors.filter(m => m.collection === collection)[0];
        const listContributor = this.resultlistContributors.filter(m => m.collection === collection)[0];
        this.actionOnItemEvent(data, mapContributor, listContributor, collection);
      });

      if (this.allowMapExtend) {
        const extendValue = this.getParamValue(this.MAP_EXTEND_PARAM);
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
      const collections = new Set(Array.from(this.collaborativeService.registry.values()).map(c => c.collection));
      zip(...Array.from(collections).map(c => this.collaborativeService.describe(c)))
        .subscribe(cdrs => {
          cdrs.forEach(cdr => {
            this.collectionToDescription.set(cdr.collection_name, cdr.params);
          });
          const bounds = (<mapboxgl.Map>this.mapglComponent.map).getBounds();
          (<mapboxgl.Map>this.mapglComponent.map).fitBounds(bounds, { duration: 0 });
          if (this.resultlistContributors.length > 0) {
            this.resultlistContributors.forEach(c => c.sort = this.collectionToDescription.get(c.collection).id_path);
          }
          this.mapglContributors.forEach(mapContrib => {
            mapContrib.colorGenerator = this.colorGenerator;
            if (!!this.resultlistContributors) {
              const resultlistContrbutor: ResultListContributor = this.resultlistContributors
                .find(resultlistContrib => resultlistContrib.collection === mapContrib.collection);
              if (!!resultlistContrbutor) {
                mapContrib.searchSize = resultlistContrbutor.pageSize;
                mapContrib.searchSort = resultlistContrbutor.sort;
              } else {
                mapContrib.searchSize = 50;
              }
            }
          });
        });
    }

    // tslint:disable-next-line:max-line-length
    this.iconRegistry.addSvgIconLiteral('bbox', this.domSanitizer.bypassSecurityTrustHtml('<svg fill="black" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/><path d="M0 0h24v24H0z" fill="none"/></svg>'));
    // tslint:disable-next-line:max-line-length
    this.iconRegistry.addSvgIconLiteral('draw_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"   width="20"   height="20"   viewBox="0 0 20 20"   id="svg19167"   version="1.1"   inkscape:version="0.91+devel+osxmenu r12911"   sodipodi:docname="square.svg">  <defs     id="defs19169" />  <sodipodi:namedview     id="base"     pagecolor="#ffffff"     bordercolor="#666666"     borderopacity="1.0"     inkscape:pageopacity="0.0"     inkscape:pageshadow="2"     inkscape:zoom="11.313708"     inkscape:cx="11.681634"     inkscape:cy="9.2857143"     inkscape:document-units="px"     inkscape:current-layer="layer1"     showgrid="true"     units="px"     inkscape:window-width="1280"     inkscape:window-height="751"     inkscape:window-x="0"     inkscape:window-y="23"     inkscape:window-maximized="0"     inkscape:object-nodes="true">    <inkscape:grid       type="xygrid"       id="grid19715" />  </sodipodi:namedview>  <metadata     id="metadata19172">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />        <dc:title />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-1032.3622)">    <path       inkscape:connector-curvature="0"       style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.5;marker:none;enable-background:accumulate"       d="m 5,1039.3622 0,6 2,2 6,0 2,-2 0,-6 -2,-2 -6,0 z m 3,0 4,0 1,1 0,4 -1,1 -4,0 -1,-1 0,-4 z" id="rect7797" sodipodi:nodetypes="cccccccccccccccccc" /><circle style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" id="path4364" cx="6" cy="1046.3622" r="2" /><circle id="path4368" style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" cx="14" cy="1046.3622" r="2" /><circle id="path4370" style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" cx="6" cy="1038.3622" r="2" /><circle style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1.60000002;marker:none;enable-background:accumulate" id="path4372" cx="14" cy="1038.3622" r="2" /> </g></svg>'));
    // tslint:disable-next-line:max-line-length
    this.iconRegistry.addSvgIconLiteral('remove_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg   xmlns:dc="http://purl.org/dc/elements/1.1/"   xmlns:cc="http://creativecommons.org/ns#"   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"   xmlns:svg="http://www.w3.org/2000/svg"   xmlns="http://www.w3.org/2000/svg"   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"   width="20"   height="20"   id="svg5738"   version="1.1"   inkscape:version="0.91+devel+osxmenu r12911"   sodipodi:docname="trash.svg"   viewBox="0 0 20 20">  <defs     id="defs5740" />  <sodipodi:namedview     id="base"     pagecolor="#ffffff"     bordercolor="#666666"     borderopacity="1.0"     inkscape:pageopacity="0.0"     inkscape:pageshadow="2"     inkscape:zoom="22.627417"     inkscape:cx="12.128184"     inkscape:cy="8.8461307"     inkscape:document-units="px"     inkscape:current-layer="layer1"     showgrid="true"     inkscape:window-width="1033"     inkscape:window-height="751"     inkscape:window-x="20"     inkscape:window-y="23"     inkscape:window-maximized="0"     inkscape:snap-smooth-nodes="true"     inkscape:object-nodes="true">    <inkscape:grid       type="xygrid"       id="grid5746"       empspacing="5"       visible="true"       enabled="true"       snapvisiblegridlinesonly="true" />  </sodipodi:namedview>  <metadata     id="metadata5743">    <rdf:RDF>      <cc:Work         rdf:about="">        <dc:format>image/svg+xml</dc:format>        <dc:type           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />        <dc:title />      </cc:Work>    </rdf:RDF>  </metadata>  <g     inkscape:label="Layer 1"     inkscape:groupmode="layer"     id="layer1"     transform="translate(0,-1032.3622)">    <path       style="color:#000000;display:inline;overflow:visible;visibility:visible;fill:#000000;fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:0.99999982;marker:none;enable-background:accumulate" d="m 10,1035.7743 c -0.7849253,8e-4 -1.4968376,0.4606 -1.8203125,1.1758 l -3.1796875,0 -1,1 0,1 12,0 0,-1 -1,-1 -3.179688,0 c -0.323475,-0.7152 -1.035387,-1.175 -1.820312,-1.1758 z m -5,4.5879 0,7 c 0,1 1,2 2,2 l 6,0 c 1,0 2,-1 2,-2 l 0,-7 -2,0 0,5.5 -1.5,0 0,-5.5 -3,0 0,5.5 -1.5,0 0,-5.5 z"       id="rect2439-7"       inkscape:connector-curvature="0"       sodipodi:nodetypes="ccccccccccccccccccccccccc" />  </g></svg>'));
    // tslint:disable-next-line:max-line-length
    this.iconRegistry.addSvgIconLiteral('import_polygon', this.domSanitizer.bypassSecurityTrustHtml('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24pt" height="24pt" viewBox="0 0 24 24" version="1.1"><g id="surface1"><path style=" stroke:none;fill-rule:nonzero;fill:rgb(0%,0%,0%);fill-opacity:1;" d="M 9 16 L 15 16 L 15 10 L 19 10 L 12 3 L 5 10 L 9 10 Z M 5 18 L 19 18 L 19 20 L 5 20 Z M 5 18 "/></g></svg>'));
  }

  public isElementInViewport(el) {
    if (el) {
      const rect = el.getBoundingClientRect();
      return (rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    } else {
      return false;
    }
  }

  public ngAfterViewInit(): void {
    this.mapService.setMap(this.mapglComponent.map);
    this.visualizeService.setMap(this.mapglComponent.map);
    this.menuState.configs = this.arlasStartUpService.emptyMode;
    if (this.mapBounds && this.allowMapExtend) {
      (<mapboxgl.Map>this.mapglComponent.map).fitBounds(this.mapBounds, { duration: 0 });
      this.mapBounds = null;
    }
    this.mapglComponent.onMapLoaded.subscribe(isLoaded => {
      /** wait until the map component loading is finished before fetching the data */
      if (isLoaded && !this.arlasStartUpService.emptyMode) {
        this.mapglContributors.forEach(mapglContributor => {
          mapglContributor.updateData = true;
          mapglContributor.fetchData(null);
          mapglContributor.setSelection(null, this.collaborativeService.getCollaboration(mapglContributor.identifier));
        });
      }

    });
    this.mapglComponent.map.on('movestart', (e) => {
      this.zoomStart = this.mapglComponent.map.getZoom();
    });
    this.mapglComponent.map.on('moveend', (e) => {
      if (Math.abs(this.mapglComponent.map.getZoom() - this.zoomStart) > 1) {
        this.zoomChanged = true;
      }
      if (this.allowMapExtend) {
        this.mapEventListener.next();
      }
    });
    // Keep the last displayed list as preview when closing the right panel
    if (!!this.tabsList) {
      this.tabsList.selectedIndexChange.subscribe(index => {
        this.previewListContrib = this.resultlistContributors[index];
        this.updateVisibleItems();
      });
    }

    this.mapEventListener.pipe(debounceTime(this.mapExtendTimer)).subscribe(() => {
      /** Change map extend in the url */
      const bounds = (<mapboxgl.Map>this.mapglComponent.map).getBounds();
      const extend = bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth();
      const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
      queryParams[this.MAP_EXTEND_PARAM] = extend;
      this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    });

    if (!!this.previewListContrib) {
      timer(0, 200).pipe(takeWhile(() => this.apploading)).subscribe(() => {
        if (this.previewListContrib.data.length > 0 &&
          this.mapComponentConfig.mapLayers.events.onHover.filter(l => this.mapglComponent.map.getLayer(l)).length > 0) {
          this.updateVisibleItems();
          this.apploading = false;
        }
      });
    }
    this.cdr.detectChanges();
  }

  public setAppTitle() {
    const prefixTitle = this.arlasSettingsService.settings['tab_name'] ?
      // tslint:disable-next-line:no-string-literal
      this.arlasSettingsService.settings['tab_name'] : '';
    prefixTitle === '' ? this.titleService.setTitle(this.appName) :
      this.titleService.setTitle(prefixTitle.concat(' - ').concat(this.appName));
  }

  public updateVisibleItems() {
    const idFieldName = this.collectionToDescription.get(this.previewListContrib.collection).id_path;
    setTimeout(() => {
      const visibleItems = this.previewListContrib.data.map(i => i.get(idFieldName).toString())
        .filter(i => this.isElementInViewport(document.getElementById(i)));
      this.updateMapStyle(visibleItems, this.previewListContrib.collection);
    }, 500);
  }

  public updateMapStyle(ids: Array<string>, collection: string) {
    // use always this.previewListContrib because it's the current resultlist contributor
    if (!!this.mapComponentConfig.mapLayers.events.onHover) {
      this.mapComponentConfig.mapLayers.events.onHover.forEach(l => {
        const layer = this.mapglComponent.map.getLayer(l);
        if (ids && ids.length > 0) {
          if (!!layer && layer.source.indexOf(collection) >= 0 && ids.length > 0 &&
            layer.metadata.isScrollableLayer) {
            this.mapglComponent.map.setFilter(l, this.getVisibleElementLayerFilter(l, ids));
            const strokeLayerId = l.replace('_id:', '-fill_stroke-');
            const strokeLayer = this.mapglComponent.map.getLayer(strokeLayerId);
            if (!!strokeLayer) {
              this.mapglComponent.map.setFilter(strokeLayerId, this.getVisibleElementLayerFilter(strokeLayerId, ids));
            }
          }
        } else {
          if (!!layer && layer.source.indexOf(collection) >= 0) {
            this.mapglComponent.map.setFilter(l, this.mapglComponent.layersMap.get(l).filter);
            const strokeLayerId = l.replace('_id:', '-fill_stroke-');
              const strokeLayer = this.mapglComponent.map.getLayer(strokeLayerId);
              if (!!strokeLayer) {
                this.mapglComponent.map.setFilter(strokeLayerId,
                  this.mapglComponent.layersMap.get(strokeLayerId).filter);
              }
          }
        }
      });
    }
  }

  public updateMapStyleFromScroll(items: Array<Item>, collection: string) {
    this.updateMapStyle(items.map(i => i.identifier), collection);
  }

  /**
   * Updates features style on map after repopulating the resultlist with data
   * @param items List of items constituting the resultlist
   */
  public updateMapStyleFromChange(items: Array<Map<string, string>>, collection: string) {
    if (this.collectionToDescription.size > 0) {
      const idFieldName = this.collectionToDescription.get(collection).id_path;
      setTimeout(() => {
        const visibleItems = items.map(item => item.get(idFieldName).toString())
          .filter(id => id !== undefined && this.isElementInViewport(document.getElementById(id)));
        this.updateMapStyle(visibleItems, collection);
      }, 200);
    }
  }

  public consumeMenuEvents(states: MenuState) {
    this.menuState = states;
  }

  public openMapSettings(): void {
    this.mapSettingsService.mapContributor = this.mainMapContributor;
    this.mapSettingsService.componentConfig = this.configService.getValue('arlas.web.components');
    this.mapSettings.openDialog(this.mapSettingsService);
  }

  public setBasemapStylesGroup(selectedBasemapStyle: BasemapStyle) {
    this.mapglComponent.onChangeBasemapStyle(selectedBasemapStyle);
  }
  /**
   * Applies the selected geo query
   */
  public applySelectedGeoQuery(geoQuery: GeoQuery) {
    this.mainMapContributor.setGeoQueryOperation(geoQuery.operation);
    this.mainMapContributor.setGeoQueryField(geoQuery.geometry_path);
    this.mainMapContributor.onChangeGeoQuery();

  }

  public refreshComponents() {
    const dataModel = this.collaborativeService.dataModelBuilder(this.collaborativeService.urlBuilder().split('filter=')[1]);
    this.collaborativeService.setCollaborations(dataModel);
  }

  public setLyersVisibilityStatus(event) {
    this.layersVisibilityStatus = event;
  }

  public zoomToData(collection: string): void {
    if (!this.mapSettingsService.mapContributor) {
      this.mapSettingsService.mapContributor = this.mainMapContributor;
    }
    if (!this.mapSettingsService.componentConfig) {
      this.mapSettingsService.componentConfig = this.configService.getValue('arlas.web.components');
    }
    const centroid_path = this.collectionToDescription.get(collection).centroid_path;
    this.mapService.zoomToData(collection, centroid_path, this.mapglComponent.map, 0.2);
  }


  /**This method sorts the list on the given column. The features are also sorted if the `Simple mode` is activated in mapContributor  */
  public sortColumnEvent(contributorId: string, sortOutput: { fieldName: string, sortDirection: SortEnum }) {
    this.isGeoSortActivated.set(contributorId, false);
    /** Save the sorted column */
    this.sortOutput.set(contributorId, sortOutput);
    /** Sort the list by the selected column and the id field name */
    (this.collaborativeService.registry.get(contributorId) as ResultListContributor).sortColumn(sortOutput, true);
    /** set mapcontritbutor sort */
    let sortOrder = null;
    if (sortOutput.sortDirection.toString() === '0') {
      sortOrder = '';
    } else if (sortOutput.sortDirection.toString() === '1') {
      sortOrder = '-';
    }
    let sort = '';
    if (sortOrder !== null) {
      sort = sortOrder + sortOutput.fieldName;
    }

    this.mapglContributors.forEach(c => {
      // Could have some problems if we put 2 lists with the same collection and different sort ?
      c.searchSort = this.resultlistContributors.filter(v => v.collection === c.collection)[0].sort;
    });
    /** Redraw features with setted sort in case of Simple mode */
    /** Remove old features */
    this.mapglContributors.forEach(c => {
      // Could have some problems if we put 2 lists with the same collection and different sort ?
      this.clearWindowData(c);
      c.searchSize = this.resultlistContributors.filter(v => v.collection === c.collection)[0].getConfigValue('search_size');
    });
    /** Set new features */
    this.mapglContributors
      .filter(c => c.collection === (this.collaborativeService.registry.get(contributorId) as ResultListContributor).collection)
      .forEach(c => c.drawGeoSearch(0, true));
  }

  /**
   * Called at the end of scrolling the list
   * @param contributor ResultlistContributor instance that fetches the data
   * @param eventPaginate Which page is queried
   */
  public paginate(contributor, eventPaginate: PageQuery): void {
    contributor.getPage(eventPaginate.reference, eventPaginate.whichPage);
    const sort = this.isGeoSortActivated.get(contributor.identifier) ? contributor.geoOrderSort : contributor.sort;
    this.mapglContributors
      .filter(c => c.collection === contributor.collection)
      .forEach(c => c.getPage(eventPaginate.reference, sort, eventPaginate.whichPage, contributor.maxPages));
  }

  public clickOnTile(item: Item) {
    this.tabsList.realignInkBar();
    const config = this.resultListConfigPerContId.get(this.previewListContrib.identifier);
    config.defautMode = this.modeEnum.grid;
    config.selectedGridItem = item;
    config.isDetailledGridOpen = true;
    this.resultListConfigPerContId.set(this.previewListContrib.identifier, config);
    this.listOpen = !this.listOpen;
    setTimeout(() => this.timelineComponent.timelineHistogramComponent.resizeHistogram(), 100);
  }

  public changeListResultMode(mode: ModeEnum, identifier: string) {
    const config = this.resultListConfigPerContId.get(identifier);
    config.defautMode = mode;
    this.resultListConfigPerContId.set(identifier, config);
    setTimeout(() => {
      this.updateVisibleItems();
    }, 100);
  }

  public reloadMapImages() {
    this.visualizeService.setMap(this.mapglComponent.map);
  }

  public getBoardEvents(event: { origin: string, event: string, data: any }) {
    const resultListContributor = this.collaborativeService.registry.get(event.origin) as ResultListContributor;
    const currentCollection = resultListContributor.collection;
    const mapContributor: MapContributor = this.mapglContributors.filter(c => c.collection === currentCollection)[0];
    switch (event.event) {
      case 'paginationEvent':
        this.paginate(resultListContributor, event.data);
        break;

      case 'sortColumnEvent':
        this.sortColumnEvent(event.origin, event.data);
        break;
      case 'consultedItemEvent':
        if (!!mapContributor) {
          const f = mapContributor.getFeatureToHightLight(event.data);
          if (mapContributor) {
            f.elementidentifier.idFieldName = f.elementidentifier.idFieldName.replace(/\./g, '_');
          }
          this.featureToHightLight = f;
        }
        break;
      case 'selectedItemsEvent':
        /** TODO : manage features to select when we have miltiple collections */
        if (event.data.length > 0 && this.mapComponentConfig && mapContributor) {
          const featuresToSelect = event.data.map(id => {
            let idFieldName = this.collectionToDescription.get(currentCollection).id_path;
            if (mapContributor.isFlat) {
              idFieldName = idFieldName.replace(/\./g, '_');
            }
            return {
              idFieldName: idFieldName,
              idValue: id
            };
          });
          this.mapglComponent.selectFeaturesByCollection(featuresToSelect, currentCollection);
        } else {
          this.mapglComponent.selectFeaturesByCollection([], currentCollection);
        }
        break;
      case 'actionOnItemEvent':
        this.actionOnItemEvent(event.data, mapContributor, resultListContributor, currentCollection);
        break;
      case 'globalActionEvent':
        break;
      case 'geoSortEvent':
        break;
      case 'geoAutoSortEvent':
        this.onActiveOnGeosort(event.data, resultListContributor, mapContributor, this.centerLatLng.lat, this.centerLatLng.lng);
        break;
    }
    this.actionOnList.next(event);
  }

  public onActiveOnGeosort(data, resultListContributor: ResultListContributor, mapContributor: MapContributor, lat, lng): void {
    this.isGeoSortActivated.set(resultListContributor.identifier, data);
    if (data) {
      /** Apply geosort in list */
      resultListContributor.geoSort(lat, lng, true);
      // this.resultListComponent.columns.filter(c => !c.isIdField).forEach(c => c.sortDirection = SortEnum.none);
      /** Apply geosort in map (for simple mode) */
      this.clearWindowData(mapContributor);
      mapContributor.searchSort = resultListContributor.geoOrderSort;
      mapContributor.searchSize = resultListContributor.pageSize;
      mapContributor.drawGeoSearch(0, true);
    } else {
      const idFieldName = resultListContributor.getConfigValue('fieldsConfiguration')['idFieldName'];
      this.sortOutput.set(resultListContributor.identifier,
        { fieldName: idFieldName, sortDirection: SortEnum.none });
      /** Sort the list by the selected column and the id field name */
      resultListContributor.sortColumn({ fieldName: idFieldName, sortDirection: SortEnum.none }, true);
      mapContributor.searchSort = resultListContributor.sort;
      mapContributor.searchSize = resultListContributor.pageSize;
      this.clearWindowData(mapContributor);
      mapContributor.drawGeoSearch(0, true);
    }
  }

  public onChangeAoi(event) {
    const configDebounceTime = this.configService.getValue('arlas.server.debounceCollaborationTime');
    const debounceDuration = configDebounceTime !== undefined ? configDebounceTime : 750;
    this.mapglContributors.forEach((contrib, i) => {
      setTimeout(() => {
        contrib.onChangeAoi(event);
      }, i * (debounceDuration + 200));
    });
  }

  public onMove(event) {
    // Update data only when the collections info are presents
    if (this.collectionToDescription.size > 0) {
      /** Change map extend in the url */
      const bounds = (<mapboxgl.Map>this.mapglComponent.map).getBounds();
      const extend = bounds.getWest() + ',' + bounds.getSouth() + ',' + bounds.getEast() + ',' + bounds.getNorth();
      const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
      queryParams[this.MAP_EXTEND_PARAM] = extend;
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
      if (this.recalculateExtend) {
        this.resultlistContributors
          .forEach(c => {
            const centroidPath = this.collectionToDescription.get(c.collection).centroid_path;
            c.filter = this.mainMapContributor.getFilterForCount(pwithinRaw, pwithin, centroidPath);
            this.collaborativeService.registry.set(c.identifier, c);
          });
        this.resultlistContributors.forEach(c => {
          if (this.isGeoSortActivated.get(c.identifier)) {
            c.geoSort(this.centerLatLng.lat, this.centerLatLng.lng, true);
          } else {
            c.sortColumn(this.sortOutput.get(c.identifier), true);
          }
        });
        this.mapglContributors.forEach(c => {
          if (!!this.resultlistContributors) {
            const resultlistContrbutor: ResultListContributor = this.resultlistContributors.find(v => v.collection === c.collection);
            if (!!resultlistContrbutor) {
              if (this.isGeoSortActivated.get(c.identifier)) {
                c.searchSort = resultlistContrbutor.geoOrderSort;
              } else {
                c.searchSort = resultlistContrbutor.sort;
              }
              this.collaborativeService.registry.set(c.identifier, c);
            }
          }
          this.clearWindowData(c);
        });
        this.zoomChanged = false;
      }
      event.extendForTest = newMapExtent;
      event.rawExtendForTest = newMapExtentRaw;
      this.mapglContributors.forEach(contrib => contrib.onMove(event, this.recalculateExtend));
      this.recalculateExtend = false;

    }
  }

  public changeVisualisation(event) {
    this.mapglContributors.forEach(contrib => contrib.changeVisualisation(event));
  }


  public emitFeaturesOnOver(event) {
    if (event.features) {
      this.mapglComponent.map.getCanvas().style.cursor = 'pointer';
      // Get feature by collection
      this.resultlistContributors.forEach(c => {
        const idFieldName = this.collectionToDescription.get(c.collection).id_path;
        const highLightItems = event.features
          .filter(f => f.layer.metadata.collection === c.collection)
          .map(f => f.properties[idFieldName.replace(/\./g, '_')]);
        c.setHighlightItems(highLightItems);
      });
    } else {
      this.mapglComponent.map.getCanvas().style.cursor = '';
      this.resultlistContributors.forEach(c => {
        c.setHighlightItems([]);
      });
    }
  }

  public emitFeaturesOnClic(event) {
    if (event.features) {
      const feature = event.features[0];
      const resultListContributor = this.resultlistContributors
        .filter(c => feature.layer.metadata.collection === c.collection && !feature.layer.id.includes(SCROLLABLE_ARLAS_ID))[0];
      if (!!resultListContributor) {
        const idFieldName = this.collectionToDescription.get(resultListContributor.collection).id_path;
        const id = feature.properties[idFieldName.replace(/\./g, '_')];
        resultListContributor.detailedDataRetriever.getData(id).subscribe(
          data => {
            const rowItem = new Item([], new Map());
            rowItem.identifier = id;
            resultListContributor.detailedDataRetriever.getActions(rowItem).subscribe(ac => rowItem.actions = ac);
            const detail = new Array<{
              group: string;
              details: Array<{
                key: string;
                value: string;
              }>;
            }>();
            data.details.forEach((k, v) => {
              const details = new Array<{
                key: string;
                value: string;
              }>();
              k.forEach((value, key) => {
                details.push(
                  { key, value }
                );
              });
              detail.push({
                group: v,
                details: details
              });
            });
            rowItem.itemDetailedData = detail;
            const popupContent = this.dynamicComponentService.injectComponent(
              ResultDetailedItemComponent,
              x => { x.rowItem = rowItem; x.actionOnItemEvent = this.actionOnPopup; x.idFieldName = idFieldName; });
            new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat(event.point)
              .setDOMContent(popupContent)
              .addTo(this.mapglComponent.map);
          }
        );
      }
    }
  }

  public toggleList() {
    this.tabsList.realignInkBar();
    this.listOpen = !this.listOpen;
    if (!this.listOpen) {
      const config = this.resultListConfigPerContId.get(this.previewListContrib.identifier);
      config.isDetailledGridOpen = false;
    }
    setTimeout(() => {
      this.timelineComponent.timelineHistogramComponent.resizeHistogram();
      this.updateVisibleItems();
    }, 100);
  }


  public toggleAnalytics() {
    this.analyticsOpen = !this.analyticsOpen;
    if (this.analyticsOpen) {
      this.offset.west = 465;
    } else {
      this.offset.west = 0;
    }
    this.recalculateExtend = true;
    this.mapglComponent.map.fitBounds(this.mapglComponent.map.getBounds());
  }


  private getVisibleElementLayerFilter(l, ids) {
    const lFilter = this.mapglComponent.layersMap.get(l).filter;
    const filters = [];
    if (lFilter) {
      lFilter.forEach(f => {
        filters.push(f);
      });
    }
    if (filters.length === 0) {
      filters.push('all');
    }
    filters.push([
      'match',
      ['get', 'id'],
      Array.from(new Set(ids)),
      true,
      false
    ]);
    return filters;
  }


  private clearWindowData(contributor: MapContributor) {
    contributor.getConfigValue('layers_sources')
      .filter(ls => ls.source.startsWith('feature-') && ls.render_mode === FeatureRenderMode.window)
      .map(ls => ls.source)
      .forEach(source => contributor.clearData(source));
  }


  private getParamValue(param: string): string {
    let paramValue = null;
    const url = window.location.href;
    const regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (results && results[2]) {
      paramValue = results[2];
    }
    return paramValue;
  }
  private actionOnItemEvent(data, mapContributor, listContributor, collection) {
    switch (data.action.id) {
      case 'zoomToFeature':
        if (!!mapContributor) {
          mapContributor.getBoundsToFit(data.elementidentifier, collection)
            .subscribe(bounds => this.visualizeService.fitbounds = bounds);
        }
        break;
      case 'visualize':
        if (!!this.resultListConfigPerContId.get(listContributor.identifier)) {
          const urlVisualisationTemplate = this.resultListConfigPerContId.get(listContributor.identifier).visualisationLink;
          this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlVisualisationTemplate).subscribe(url => {
            this.visualizeService.displayDataOnMap(url,
              data.elementidentifier, this.collectionToDescription.get(collection).geometry_path,
              this.collectionToDescription.get(collection).centroid_path, collection);
          });
        }
        break;
      case 'download':
        if (!!this.resultListConfigPerContId.get(listContributor.identifier)) {
          const urlDownloadTemplate = this.resultListConfigPerContId.get(listContributor.identifier).downloadLink;
          if (urlDownloadTemplate) {
            this.visualizeService.getVisuInfo(data.elementidentifier, collection, urlDownloadTemplate).subscribe(url => {
              const win = window.open(url, '_blank');
              win.focus();
            });
          }
        }
        break;
    }
  }
}


