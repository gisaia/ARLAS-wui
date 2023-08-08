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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CollectionReferenceParameters } from 'arlas-api';
import {
  BasemapStyle, CellBackgroundStyleEnum, ChartType, Column, DataType, GeoQuery, Item, MapglComponent, MapglImportComponent,
  MapglSettingsComponent, ModeEnum, PageQuery, Position, ResultDetailedItemComponent, SortEnum, SCROLLABLE_ARLAS_ID
} from 'arlas-web-components';
import {
  AnalyticsContributor, ChipsSearchContributor,
  ElementIdentifier, FeatureRenderMode, HistogramContributor,
  MapContributor,
  ResultListContributor
} from 'arlas-web-contributors';
import { LegendData } from 'arlas-web-contributors/contributors/MapContributor';
import {
  ArlasCollaborativesearchService, ArlasColorGeneratorLoader, ArlasConfigService,
  ArlasMapService, ArlasMapSettings, ArlasSettingsService, ArlasStartupService, CollectionUnit, TimelineComponent
} from 'arlas-wui-toolkit';
import * as mapboxgl from 'mapbox-gl';
import { fromEvent, merge, Observable, of, Subject, timer, zip } from 'rxjs';
import { debounceTime, mergeMap, takeWhile } from 'rxjs/operators';
import { MenuState } from './components/left-menu/left-menu.component';
import { ContributorService } from './services/contributors.service';
import { DynamicComponentService } from './services/dynamicComponent.service';
import { SidenavService } from './services/sidenav.service';
import { VisualizeService } from './services/visualize.service';
import { LayerStyleManagerService } from './arlas-wui-customiser/services/layer-style-manager/layer-style-manager.service';

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
      collection: string;
      cssClass?: string | string[];
      tooltip?: string;
    };
    elementidentifier: ElementIdentifier;
  }>();
  @Output() public actionOnList = new Subject<{ origin: string; event: string; data?: any; }>();


  public modeEnum = ModeEnum;
  public mapglContributors: Array<MapContributor> = new Array();
  public chipsSearchContributor: ChipsSearchContributor;
  public resultlistContributors: Array<ResultListContributor> = new Array();
  public analyticsContributor: AnalyticsContributor;

  public sortOutput = new Map<string, { fieldName: string; sortDirection: SortEnum; columnName?: string; }>();

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
    isleaving: boolean;
    elementidentifier: ElementIdentifier;
  };
  public featuresToSelect: Array<ElementIdentifier> = [];
  private allowMapExtend: boolean;
  private mapBounds: mapboxgl.LngLatBounds;
  private mapEventListener = new Subject();
  private mapExtendTimer: number;
  private MAP_EXTEND_PARAM = 'extend';

  public nbVerticesLimit = 50;
  public isMapMenuOpen = false;
  public shouldCloseMapMenu = true;

  public menuState: MenuState;
  public analyticsOpen = true;
  public searchOpen = true;
  public mapId = 'mapgl';

  public centerLatLng: { lat: number; lng: number; } = { lat: 0, lng: 0 };
  public offset = { north: 0, east: 0, south: -128, west: 465 };

  public listOpen = false;
  public selectedListTabIndex = 0;
  public previewListContrib: ResultListContributor = null;
  public rightListContributors: Array<ResultListContributor> = new Array();

  /* Options */
  public spinner: { show: boolean; diameter: string; color: string; strokeWidth: number; }
    = { show: false, diameter: '60', color: 'accent', strokeWidth: 5 };

  public showZoomToData = false;
  public showIndicators = false;
  public onSideNavChange: boolean;

  public defaultBaseMap;

  public mapDataSources;

  public mapRedrawSources;
  public mapLegendUpdater = new Subject<Map<string, Map<string, LegendData>>>();
  public mapVisibilityUpdater;
  /** Visibility status of layers on the map */
  public layersVisibilityStatus: Map<string, boolean> = new Map();
  public mainMapContributor: MapContributor;
  public mainCollection;
  public geojsondraw: { type: string; features: Array<any>; } = {
    'type': 'FeatureCollection',
    'features': []
  };

  public recalculateExtend = true;
  public zoomChanged = false;
  public zoomStart: number;
  public popup: mapboxgl.Popup;
  @Input() public hiddenAnalyticsTabs: string[] = [];
  @Input() public hiddenResultlistTabs: string[] = [];

  public isGeoSortActivated = new Map<string, boolean>();
  public collectionToDescription = new Map<string, CollectionReferenceParameters>();
  public collections: string[];
  public apploading = true;
  @ViewChild('map', { static: false }) public mapglComponent: MapglComponent;
  @ViewChild('import', { static: false }) public mapImportComponent: MapglImportComponent;
  @ViewChild('mapSettings', { static: false }) public mapSettings: MapglSettingsComponent;
  @ViewChild('tabsList', { static: false }) public tabsList: MatTabGroup;
  @ViewChild('timeline', { static: false }) public timelineComponent: TimelineComponent;

  public constructor(
    private configService: ArlasConfigService,
    public collaborativeService: ArlasCollaborativesearchService,
    private contributorService: ContributorService,
    public arlasStartUpService: ArlasStartupService,
    private mapSettingsService: ArlasMapSettings,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private mapService: ArlasMapService,
    private colorGenerator: ArlasColorGeneratorLoader,
    private sidenavService: SidenavService,
    private titleService: Title,
    private arlasSettingsService: ArlasSettingsService,
    private dynamicComponentService: DynamicComponentService,
    public visualizeService: VisualizeService,
    private translate: TranslateService,
    private snackbar: MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private layerStyleManager: LayerStyleManagerService
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
      if (appUnit || this.appUnits.length === 0) {
        this.appUnits.push({
          collection: this.collaborativeService.defaultCollection,
          unit: !!appUnit ? appUnit : this.collaborativeService.defaultCollection,
          ignored: false
        });
      }
      /** end of retrocompatibility code */
      this.appNameBackgroundColor = this.configService.getValue('arlas-wui.web.app.name_background_color') ?
        this.configService.getValue('arlas-wui.web.app.name_background_color') : '#FF4081';
      this.analyticsContributor = this.arlasStartUpService.contributorRegistry.get('analytics') as AnalyticsContributor;
      this.mapComponentConfig = this.configService.getValue('arlas.web.components.mapgl.input');
      const mapExtendTimer = this.configService.getValue('arlas.web.components.mapgl.mapExtendTimer');
      this.mapExtendTimer = (mapExtendTimer !== undefined) ? mapExtendTimer : 4000;
      this.allowMapExtend = this.configService.getValue('arlas.web.components.mapgl.allowMapExtend');
      this.nbVerticesLimit = this.configService.getValue('arlas.web.components.mapgl.nbVerticesLimit');
      this.timelineComponentConfig = this.configService.getValue('arlas.web.components.timeline');
      this.detailedTimelineComponentConfig = this.configService.getValue('arlas.web.components.detailedTimeline');

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

      /** init from url */
      const queryParamVisibleVisualisations = this.getParamValue('vs');
      if (queryParamVisibleVisualisations) {
        const visibleVisuSet = new Set(queryParamVisibleVisualisations.split(';').map(n => decodeURI(n)));
        this.mapComponentConfig.visualisations_sets.forEach(v => v.enabled = visibleVisuSet.has(v.name));
      }

      const analyticOpenString = this.getParamValue('ao');
      if (!!analyticOpenString) {
        this.analyticsOpen = (analyticOpenString === 'true');
      }
      const resultlistOpenString = this.getParamValue('ro');
      if (resultlistOpenString) {
        this.listOpen = (resultlistOpenString === 'true');
      }
    } else {
      this.defaultBaseMap = {
        styleFile: 'http://demo.arlas.io:82/styles/positron/style.json',
        name: 'Positron'
      };
    }
  }

  public downloadLayerSource(d) {
    const mc = this.mapglContributors.find(mc => mc.collection === d.collection);
    if (mc) {
      mc.downloadLayerSource(d.sourceName, d.layerName, d.downloadType);
    }
  }

  public ngOnInit() {
    this.setAppTitle();
    if (this.arlasStartUpService.shouldRunApp && !this.arlasStartUpService.emptyMode) {
      /** Retrieve displayable analytics */
      const hiddenAnalyticsTabsSet = new Set(this.hiddenAnalyticsTabs);
      const allAnalytics = this.configService.getValue('arlas.web.analytics');
      this.analytics = !!allAnalytics ? allAnalytics.filter(a => !hiddenAnalyticsTabsSet.has(a.tab)) : [];
      /** Retrieve displayable resultlists */
      const hiddenListsTabsSet = new Set(this.hiddenResultlistTabs);
      const allResultlists = this.configService.getValue('arlas.web.components.resultlists');
      const allContributors = this.configService.getValue('arlas.web.contributors');
      this.resultListsConfig = !!allResultlists ? allResultlists.filter(a => {
        const contId = a.contributorId;
        const tab = allContributors.find(c => c.identifier === contId).name;
        return !hiddenListsTabsSet.has(tab);
      }) : [];
      /** Prepare map data */
      this.mapglContributors = this.contributorService.getMapContributors();
      this.mainMapContributor = this.mapglContributors.filter(m => !!m.collection || m.collection === this.mainCollection)[0];
      this.mapDataSources = this.mapglContributors.map(c => c.dataSources).length > 0 ?
        this.mapglContributors.map(c => c.dataSources).reduce((set1, set2) => new Set([...set1, ...set2])) : new Set();
      this.mapRedrawSources = merge(...this.mapglContributors.map(c => c.redrawSource));

      const legendUpdaters: Observable<{ collection: string; legendData: Map<string, LegendData>; }> =
        merge(...this.mapglContributors
          .map(c => c.legendUpdater
            .pipe(mergeMap(m => of({ collection: c.collection, legendData: m })))
          ));
      const legendData = new Map<string, Map<string, LegendData>>();
      legendUpdaters.subscribe(lg => {
        legendData.set(lg.collection, lg.legendData);
        this.mapLegendUpdater.next(legendData);
      });

      this.mapVisibilityUpdater = merge(...this.mapglContributors.map(c => c.visibilityUpdater));
      this.mapglContributors.forEach(contrib => contrib.drawingsUpdate.subscribe(() => {
        this.geojsondraw = {
          'type': 'FeatureCollection',
          'features': this.mapglContributors.map(c => c.geojsondraw.features).reduce((a, b) => a.concat(b))
            .filter((v, i, a) => a.findIndex(t => (t.properties.arlas_id === v.properties.arlas_id)) === i)
        };
      }));

      this.chipsSearchContributor = this.contributorService.getChipSearchContributor();
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
        const selectedResultlistTab = this.getParamValue('rt');
        const previewListContrib = this.rightListContributors.find(r => r.getName() === decodeURI(selectedResultlistTab));
        if (previewListContrib) {
          this.previewListContrib = previewListContrib;
        } else {
          this.previewListContrib = this.rightListContributors[0];
        }
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
      this.collections = [...new Set(Array.from(this.collaborativeService.registry.values()).map(c => c.collection))];
      zip(...this.collections.map(c => this.collaborativeService.describe(c)))
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
    // Keep the last displayed list as preview when closing the right panel
    if (!!this.tabsList) {
      this.tabsList.selectedIndexChange.subscribe(index => {
        this.previewListContrib = this.resultlistContributors[index];

        const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
        queryParams['rt'] = this.previewListContrib.getName();
        this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
        this.adjustGrids();
        this.adjustTimelineSize();
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

  /**
   * Mocks the interaction that a user could have to edit a map layer style to test the component
   */
  public onEditLayerStyle(event): void {
    console.log(event);
    const layerStyle = (this.mapComponentConfig.mapLayers.layers as Array<mapboxgl.AnyLayer>).find(l => l.id === event);
    const layerData = (this.mapglComponent.map as mapboxgl.Map).queryRenderedFeatures(undefined, { layers: [event] });
    console.log(layerData);
    this.layerStyleManager.openLayerStyleEditComponent({
      layer: layerData[0].source,
      layerData: {type: 'FeatureCollection', features: layerData.map(f => ({type: 'Feature', geometry: f.geometry, properties: f.properties}))},
      layerStyle: layerStyle
    }).subscribe((layerStyle: mapboxgl.AnyLayer) => {
      console.log('closing');
      if (layerStyle) {
        console.log(layerStyle);
        // Remove previous layer to put new one
        (this.mapglComponent.map as mapboxgl.Map).removeLayer(event);
        (this.mapglComponent.map as mapboxgl.Map).addLayer(layerStyle);
      }
    });
  }

  public onMapLoaded(isLoaded: boolean): void {
    /** wait until the map component loading is finished before fetching the data */
    if (isLoaded && !this.arlasStartUpService.emptyMode) {
      this.mapglContributors.forEach(mapglContributor => {
        mapglContributor.updateData = true;
        mapglContributor.fetchData(null);
        mapglContributor.setSelection(null, this.collaborativeService.getCollaboration(mapglContributor.identifier));
      });
    }
  }

  public setAppTitle() {
    const prefixTitle = this.arlasSettingsService.settings['tab_name'] ?
      this.arlasSettingsService.settings['tab_name'] : '';
    this.titleService.setTitle(prefixTitle === '' ? this.appName :
      prefixTitle.concat(' - ').concat(this.appName));
  }

  public updateVisibleItems() {
    const idFieldName = this.collectionToDescription.get(this.previewListContrib.collection).id_path;
    setTimeout(() => {
      const visibleItems = this.previewListContrib.data.map(i => (i.get(idFieldName) as number | string))
        .filter(i => i !== undefined && this.isElementInViewport(document.getElementById(i.toString())));
      this.updateMapStyle(visibleItems, this.previewListContrib.collection);
    }, 500);
  }

  public updateMapStyle(ids: Array<string | number>, collection: string) {
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
        const visibleItems = items.map(item => item.get(idFieldName))
          .filter(id => id !== undefined && this.isElementInViewport(document.getElementById(id.toString())));
        this.updateMapStyle(visibleItems, collection);
      }, 200);
    }
  }

  public consumeMenuEvents(states: MenuState) {
    this.menuState = states;
  }

  public openMapSettings(): void {
    this.mapSettingsService.mapContributors = this.mapglContributors;
    this.mapSettings.openDialog(this.mapSettingsService);
  }

  public setBasemapStylesGroup(selectedBasemapStyle: BasemapStyle) {
    this.mapglComponent.onChangeBasemapStyle(selectedBasemapStyle);
  }
  /**
   * Applies the selected geo query
   */
  public applySelectedGeoQuery(geoQueries: Map<string, GeoQuery>) {
    const configDebounceTime = this.configService.getValue('arlas.server.debounceCollaborationTime');
    const debounceDuration = configDebounceTime !== undefined ? configDebounceTime : 750;
    const changedMapContributors = this.mapglContributors.filter(mc => !!geoQueries.has(mc.collection));
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

  public refreshComponents() {
    const dataModel = this.collaborativeService.dataModelBuilder(this.collaborativeService.urlBuilder().split('filter=')[1]);
    this.collaborativeService.setCollaborations(dataModel);
  }

  public setLyersVisibilityStatus(event) {
    this.layersVisibilityStatus = event;
  }

  public zoomToData(collection: string): void {
    if (!this.mapSettingsService.mapContributors || this.mapSettingsService.mapContributors.length === 0) {
      this.mapSettingsService.mapContributors = this.mapglContributors;
    }
    const centroidPath = this.collectionToDescription.get(collection).centroid_path;
    this.mapService.zoomToData(collection, centroidPath, this.mapglComponent.map, 0.2);
  }


  /** This method sorts the list on the given column. The features are also sorted if the `Simple mode` is activated in mapContributor  */
  public sortColumnEvent(contributorId: string, sortOutput: Column) {
    const resultlistContributor = (this.collaborativeService.registry.get(contributorId) as ResultListContributor);
    this.isGeoSortActivated.set(contributorId, false);
    /** Save the sorted column */
    this.sortOutput.set(contributorId, sortOutput);
    /** Sort the list by the selected column and the id field name */
    resultlistContributor.sortColumn(sortOutput, true);
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

    this.mapglContributors
      .filter(c => c.collection === resultlistContributor.collection)
      .forEach(c => {
        // Could have some problems if we put 2 lists with the same collection and different sort ?
        c.searchSort = resultlistContributor.sort;
        c.searchSize = resultlistContributor.getConfigValue('search_size');
        /** Redraw features with setted sort in case of window mode */
        /** Remove old features */
        this.clearWindowData(c);
        /** Set new features */
        c.drawGeoSearch(0, true);
      });
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
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
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

  public getBoardEvents(event: { origin: string; event: string; data?: any; }) {
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
          if (!!this.mapglComponent) {
            this.mapglComponent.selectFeaturesByCollection([], currentCollection);
          }
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
      this.sortOutput.delete(resultListContributor.identifier);
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
    for (let i = 0; i < this.mapglContributors.length; i++) {
      setTimeout(() => {
        this.snackbar.open(this.translate.instant('Loading data of') + ' ' + this.mapglContributors[i].collection);
        this.mapglContributors[i].onChangeAoi(event);
        if (i === this.mapglContributors.length - 1) {
          setTimeout(() => this.snackbar.dismiss(), 1000);
        }
      }, (i) * ((debounceDuration + 100) * 1.5));
    }
  }

  public onMove(event) {
    // Update data only when the collections info are presents
    if (this.collectionToDescription.size > 0) {
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
      if (this.recalculateExtend) {
        this.resultlistContributors
          .forEach(c => {
            const centroidPath = this.collectionToDescription.get(c.collection).centroid_path;
            const mapContrib = this.mapglContributors.find(mc => mc.collection === c.collection);
            if (!!mapContrib) {
              c.filter = mapContrib.getFilterForCount(pwithinRaw, pwithin, centroidPath);
            } else {
              MapContributor.getFilterFromExtent(pwithinRaw, pwithin, centroidPath);
            }
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
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    const visibileVisus = this.mapglComponent.visualisationSetsConfig.filter(v => v.enabled).map(v => v.name).join(';');
    queryParams['vs'] = visibileVisus;
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
  }


  public emitFeaturesOnOver(event) {
    if (event.features) {
      this.mapglComponent.map.getCanvas().style.cursor = 'pointer';
      // Get feature by collection
      this.resultlistContributors.forEach(c => {
        const idFieldName = this.collectionToDescription.get(c.collection).id_path;
        const highLightItems = event.features
          .filter(f => f.layer.metadata.collection === c.collection)
          .map(f => f.properties[idFieldName.replace(/\./g, '_')])
          .filter(id => id !== undefined)
          .map(id => id.toString());
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
              x => {
                x.rowItem = rowItem; x.actionOnItemEvent = this.actionOnPopup; x.idFieldName = idFieldName;
              });
            if (!!this.popup) {
              this.popup.remove();
            }
            this.popup = new mapboxgl.Popup({ closeOnClick: false })
              .setLngLat(event.point)
              .setDOMContent(popupContent);
            this.popup.addTo(this.mapglComponent.map);
          }
        );
      }
    }
  }

  public toggleList() {
    this.tabsList.realignInkBar();
    this.listOpen = !this.listOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ro'] = this.listOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    this.adjustGrids();
    this.adjustTimelineSize();
  }

  private adjustGrids() {
    if (!this.listOpen) {
      const config = this.resultListConfigPerContId.get(this.previewListContrib.identifier);
      config.isDetailledGridOpen = false;
    } else {
      this.selectedListTabIndex = this.rightListContributors.indexOf(this.previewListContrib);
    }
  }
  private adjustTimelineSize() {
    setTimeout(() => {
      this.timelineComponent.timelineHistogramComponent.resizeHistogram();
      if (!!this.timelineComponent.detailedTimelineHistogramComponent) {
        this.timelineComponent.detailedTimelineHistogramComponent.resizeHistogram();
      }
      this.mapglComponent.map.resize();
      this.updateVisibleItems();
    }, 100);
  }


  public toggleAnalytics() {
    this.analyticsOpen = !this.analyticsOpen;
    const queryParams = Object.assign({}, this.activatedRoute.snapshot.queryParams);
    queryParams['ao'] = this.analyticsOpen + '';
    this.router.navigate([], { replaceUrl: true, queryParams: queryParams });
    this.adjustMapOffset();
  }

  public closeMapMenu() {
    setTimeout(() => {
      if (this.shouldCloseMapMenu) {
        this.isMapMenuOpen = false;
      }
    }, 100);
  }

  private adjustMapOffset() {
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


