# Change Log

## [v27.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v27.0.2) (2025-04-28)

**New stuff:**

- Move actions on the left-bottom menu to top-right band [\#909](https://github.com/gisaia/ARLAS-wui/issues/909)
- Make powerbars filter case insensitive [\#479](https://github.com/gisaia/ARLAS-wui/issues/479)
- \[Draw\] add a tooltip in each drawing step to indicate the next action to user [\#978](https://github.com/gisaia/ARLAS-wui/issues/978)
- \[draw\] Implement rectangle draw mode to replace the current bbox  [\#977](https://github.com/gisaia/ARLAS-wui/issues/977)
- Improve metrics ui [\#973](https://github.com/gisaia/ARLAS-wui/issues/973)
- add display name for collections elements [\#971](https://github.com/gisaia/ARLAS-wui/issues/971)

**Fixed bugs:**

- Token not present when downloading data [\#963](https://github.com/gisaia/ARLAS-wui/issues/963)
- Layout problem with legend [\#745](https://github.com/gisaia/ARLAS-wui/issues/745)
- Wrong typing of drawn geometries [\#980](https://github.com/gisaia/ARLAS-wui/issues/980)
- \[Bookmarks\] the buttons are greyed out after click on simulate combinaison [\#972](https://github.com/gisaia/ARLAS-wui/issues/972)
- When a drawn bbox/polygon is selected ESC-key does not work as expected [\#969](https://github.com/gisaia/ARLAS-wui/issues/969)
- Update dependencies information in About section [\#968](https://github.com/gisaia/ARLAS-wui/issues/968)
- inconsistencies in the management of geogrpahic zones [\#967](https://github.com/gisaia/ARLAS-wui/issues/967)
- Cant escape from draw a polygon if i do not start a draw [\#965](https://github.com/gisaia/ARLAS-wui/issues/965)
- The left sidebar disappears on esc-key click [\#964](https://github.com/gisaia/ARLAS-wui/issues/964)
- An error appears during text search [\#961](https://github.com/gisaia/ARLAS-wui/issues/961)

## [v27.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v27.0.1) (2025-03-20)

**Fixed bugs:**

- Sort applied to the resultlist does not show [\#950](https://github.com/gisaia/ARLAS-wui/issues/950)
- The descending/ascending radio buttons for resultlist sort are disabled [\#949](https://github.com/gisaia/ARLAS-wui/issues/949)

**Miscellaneous:**

- update security documentation [\#955](https://github.com/gisaia/ARLAS-wui/issues/955) [[documentation](https://github.com/gisaia/ARLAS-wui/labels/documentation)]
- Zoom to feature not showing anymore [\#951](https://github.com/gisaia/ARLAS-wui/issues/951)
- Wrong filter display with metrics table [\#948](https://github.com/gisaia/ARLAS-wui/issues/948)

## [v27.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v27.0.0) (2025-02-11)

**New stuff:**

- Migrate to Angular 18 [\#913](https://github.com/gisaia/ARLAS-wui/issues/913)
- implement the release script in github actions [\#877](https://github.com/gisaia/ARLAS-wui/issues/877)
- Propose a new implementation of arlas-map that supports MapLibre [\#734](https://github.com/gisaia/ARLAS-wui/issues/734)
- Enhance handling the app behaviour when intercepting 401, 20x [\#622](https://github.com/gisaia/ARLAS-wui/issues/622)

**Miscellaneous:**

- Migrate to Angular 15 [\#812](https://github.com/gisaia/ARLAS-wui/issues/812)

## [v26.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v26.1.1) (2025-01-06)

**Fixed bugs:**

- ARLAS Hub forbids access when user belongs to two organisations [\#926](https://github.com/gisaia/ARLAS-wui/issues/926)

## [v26.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v26.1.0) (2024-12-02)

**New stuff:**

- Visualize multiple products at once [\#914](https://github.com/gisaia/ARLAS-wui/issues/914)
- Enrich the header of calls made by the map to securised ARLAS services  [\#912](https://github.com/gisaia/ARLAS-wui/issues/912)

**Miscellaneous:**

- Externalise the map and the resultlists from the main component [\#895](https://github.com/gisaia/ARLAS-wui/issues/895)

## [v26.0.8](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.8) (2024-11-13)

**New stuff:**

- Display x/y/z layers in ARLAS [\#899](https://github.com/gisaia/ARLAS-wui/issues/899)
- Disable bookmark creation if there is no filter [\#898](https://github.com/gisaia/ARLAS-wui/issues/898)
- Use display names of the fields in all components [\#894](https://github.com/gisaia/ARLAS-wui/issues/894)
- Homogenise font-sizes in legend  [\#882](https://github.com/gisaia/ARLAS-wui/issues/882)
- Close the 'share' dialog after downloading geojson/shape zip [\#890](https://github.com/gisaia/ARLAS-wui/issues/890)

**Fixed bugs:**

- Geo-sorted products are not sorted relatively to the map center [\#907](https://github.com/gisaia/ARLAS-wui/issues/907)
- Values of layer stroke colors field are not displayed in the legend [\#903](https://github.com/gisaia/ARLAS-wui/issues/903)
- Normalized colored layer display \[0-1\] values in legend [\#902](https://github.com/gisaia/ARLAS-wui/issues/902)
- detail of a feature is closed after clicking on a feature on the map [\#897](https://github.com/gisaia/ARLAS-wui/issues/897)
- Change "Mode" by "Geometry" in the "Share geo data" menu \(bottom left\) [\#893](https://github.com/gisaia/ARLAS-wui/issues/893)
- In case of multi-collection in timeline, when one bucket is returned the detailed timeline gives information about only one collection [\#891](https://github.com/gisaia/ARLAS-wui/issues/891)
- Selecting an image when the list is closed results in no image being shown once list is open [\#886](https://github.com/gisaia/ARLAS-wui/issues/886)
- other\_color in map legend is not translated [\#883](https://github.com/gisaia/ARLAS-wui/issues/883)
- Bookmarks can not be selected [\#875](https://github.com/gisaia/ARLAS-wui/issues/875)

## [v26.0.7](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.7) (2024-09-22)

**New stuff:**

- Share layers : Sort alphabetically the list of fields to include [\#889](https://github.com/gisaia/ARLAS-wui/issues/889)

**Fixed bugs:**

- If timeline filter is deactivated first and then removed, the selection brush is not updated [\#885](https://github.com/gisaia/ARLAS-wui/issues/885)
- Detailed timeline doesn't show buckets for some cases [\#884](https://github.com/gisaia/ARLAS-wui/issues/884)

## [v26.0.6](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.6) (2024-09-16)

## [v26.0.5](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.5) (2024-09-16)

## [v26.0.4](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.4) (2024-09-16)

## [v26.0.3](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.3) (2024-09-12)

## [v26.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.2) (2024-09-11)

## [v26.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.1) (2024-09-11)

## [v26.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v26.0.0) (2024-09-11)

**New stuff:**

- change icon when selecting an item [\#870](https://github.com/gisaia/ARLAS-wui/issues/870)
- Pass the new searchContributors input to arlas-search component [\#865](https://github.com/gisaia/ARLAS-wui/issues/865)
- Create a Collection Service that provides the display name and the unit of a given collection. [\#841](https://github.com/gisaia/ARLAS-wui/issues/841)
- Add a new Metric Table component [\#824](https://github.com/gisaia/ARLAS-wui/issues/824)
- 'Zoom to' button next to count should zoom to feature geometry [\#810](https://github.com/gisaia/ARLAS-wui/issues/810)
- Display Unit instead of collection name in timeline and histogram having a count [\#755](https://github.com/gisaia/ARLAS-wui/issues/755)
- \[legend\] refactor how the legend is displayed [\#554](https://github.com/gisaia/ARLAS-wui/issues/554)
- \[metrics\] organize metrics in a datatable [\#544](https://github.com/gisaia/ARLAS-wui/issues/544)
- Rescale the x-axis domain to include selection that goes beyond the data domain [\#411](https://github.com/gisaia/ARLAS-wui/issues/411)
- Handle Multi-collection fulltext search [\#382](https://github.com/gisaia/ARLAS-wui/issues/382)
- Support H3 grids [\#315](https://github.com/gisaia/ARLAS-wui/issues/315)

**Fixed bugs:**

- errors related to bounding box + resizehistogram at init [\#871](https://github.com/gisaia/ARLAS-wui/issues/871)
- The resultlist is not updated after removing the bbox [\#868](https://github.com/gisaia/ARLAS-wui/issues/868)
- The information icon 'i' stays on the item after closing the detail in the resultlist [\#866](https://github.com/gisaia/ARLAS-wui/issues/866)
- When I log out, a blank page is displayed [\#864](https://github.com/gisaia/ARLAS-wui/issues/864)
- Hilighting layer when cursor is over result list no longer work [\#854](https://github.com/gisaia/ARLAS-wui/issues/854)
- Multiline values "outlined" colored cells rendering in result list could be improved  [\#852](https://github.com/gisaia/ARLAS-wui/issues/852)
- Drag and drop of layers within a group doesn't work anymore in arlas wui [\#848](https://github.com/gisaia/ARLAS-wui/issues/848)
- \[Timeline\] Incohérence d'affichage de date dans le cas de un seul produit  [\#847](https://github.com/gisaia/ARLAS-wui/issues/847)
- Logout action must redirect to login instead of alert message [\#837](https://github.com/gisaia/ARLAS-wui/issues/837)
- User can create a dashboard on an organisation where he is only user [\#836](https://github.com/gisaia/ARLAS-wui/issues/836)
- Tour guide is not triggered unless you resize the window of your tab [\#801](https://github.com/gisaia/ARLAS-wui/issues/801)

## [v25.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v25.1.0) (2024-07-18)

**New stuff:**

- Handle multi-collection for powerbars [\#390](https://github.com/gisaia/ARLAS-wui/issues/390)
- Display start value and end value of a timeline bucket.  [\#816](https://github.com/gisaia/ARLAS-wui/issues/816)
- Add an option to deactivate 'Sign up' button [\#806](https://github.com/gisaia/ARLAS-wui/issues/806)
- Refresh tokens halfway its duration [\#802](https://github.com/gisaia/ARLAS-wui/issues/802)
- Close window in drop down selection for sorting results in result list [\#707](https://github.com/gisaia/ARLAS-wui/issues/707)
- Add a legend for x / y in a histogram [\#688](https://github.com/gisaia/ARLAS-wui/issues/688)
- Improve property window on feature click [\#673](https://github.com/gisaia/ARLAS-wui/issues/673)
- \[map\] filter data with a circle [\#545](https://github.com/gisaia/ARLAS-wui/issues/545)

**Fixed bugs:**

- Histogram filter: Cross for closing a selection among multi-selection is partially hidden [\#787](https://github.com/gisaia/ARLAS-wui/issues/787)
- Histogram and timeline selection moves when ARLAS is loading [\#513](https://github.com/gisaia/ARLAS-wui/issues/513)
- Changing tabs triggers map style update after hard coded 500ms [\#360](https://github.com/gisaia/ARLAS-wui/issues/360)
- Dashboards that don't have tabs attribute are not displayed on arlas-wui [\#833](https://github.com/gisaia/ARLAS-wui/issues/833)
- \[Migration demo\] Map controls are positionned wrongly in the app [\#822](https://github.com/gisaia/ARLAS-wui/issues/822)
- Paginator of bookmarks list doesn't show the right lenght of the table [\#819](https://github.com/gisaia/ARLAS-wui/issues/819)
- Layers disappear when we are zoomed in [\#817](https://github.com/gisaia/ARLAS-wui/issues/817)
- \[Migration demo\] Bookmarks don't use persistence when logged in [\#815](https://github.com/gisaia/ARLAS-wui/issues/815)
- \[Migration demo\] List of basemap thumbnails does'nt show anymore [\#814](https://github.com/gisaia/ARLAS-wui/issues/814)
- Thumbnail fitters are always hidden [\#811](https://github.com/gisaia/ARLAS-wui/issues/811)
- Features layers are not displayed on the map if the collection has a date field that has not a format [\#804](https://github.com/gisaia/ARLAS-wui/issues/804)
- Export / Import dashboard : circle heatmaps configurations are lost [\#797](https://github.com/gisaia/ARLAS-wui/issues/797)
- Incorrect message [\#796](https://github.com/gisaia/ARLAS-wui/issues/796)
- Tour of ARLAS breaks the layout when the step is on the timeline [\#765](https://github.com/gisaia/ARLAS-wui/issues/765)
- Datepicker position seems off [\#736](https://github.com/gisaia/ARLAS-wui/issues/736)
- Histogram : NaN values instead of negative values [\#728](https://github.com/gisaia/ARLAS-wui/issues/728)
- The filter shortcut preview values does not work on a multi-select [\#685](https://github.com/gisaia/ARLAS-wui/issues/685)
- Network analytics layer is not displayed with temporal filter [\#648](https://github.com/gisaia/ARLAS-wui/issues/648)
- Label layer with average metric displays abnormal values [\#646](https://github.com/gisaia/ARLAS-wui/issues/646)
- Research does not work with space character [\#533](https://github.com/gisaia/ARLAS-wui/issues/533)

## [v24.3.9](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.9) (2024-07-01)

## [v25.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v25.0.0) (2024-05-15)

**New stuff:**

- Add a variable to activate/deactivate geocoding [\#773](https://github.com/gisaia/ARLAS-wui/issues/773)
- Check the browser compatibility on load [\#754](https://github.com/gisaia/ARLAS-wui/issues/754)
- Upgrade typedoc version in order to be able to generate typescript documentation of v3-swagger apis [\#750](https://github.com/gisaia/ARLAS-wui/issues/750) [[documentation](https://github.com/gisaia/ARLAS-wui/labels/documentation)]
- Add an exprt-csv action to the resultlist [\#710](https://github.com/gisaia/ARLAS-wui/issues/710)

**Fixed bugs:**

- Avoid handling errors using statusText [\#785](https://github.com/gisaia/ARLAS-wui/issues/785)
- While verifiying a new account, current account is not logged out [\#778](https://github.com/gisaia/ARLAS-wui/issues/778)
- It's impossible to access geo-filter tools  [\#777](https://github.com/gisaia/ARLAS-wui/issues/777)
- When changing protomaps basemap, an error is thrown in the console [\#776](https://github.com/gisaia/ARLAS-wui/issues/776)
- When timeline is hidden and we open the analytics board, errors are thrown in the console [\#775](https://github.com/gisaia/ARLAS-wui/issues/775)
- When timeline is hidden, moving the map triggers errors in the console [\#774](https://github.com/gisaia/ARLAS-wui/issues/774)
- ARLAS\_GEOCODING\_FIND\_PLACE\_URL value is not replaced at startup of the app [\#772](https://github.com/gisaia/ARLAS-wui/issues/772)
- When viewing a dashboard, an error is thrown in console systematically [\#771](https://github.com/gisaia/ARLAS-wui/issues/771)
- Logging out is not detected in other opened tabs [\#770](https://github.com/gisaia/ARLAS-wui/issues/770)
- Detailed timelines are not displayed [\#756](https://github.com/gisaia/ARLAS-wui/issues/756)
- Powerbar download button no longer working when multiple powerbars in a group [\#753](https://github.com/gisaia/ARLAS-wui/issues/753)
- Donut tooltip is wrongly rounded off [\#737](https://github.com/gisaia/ARLAS-wui/issues/737)
- Shortcut filter window is systematically vertically too small [\#731](https://github.com/gisaia/ARLAS-wui/issues/731)
- Vulnerabilities [\#628](https://github.com/gisaia/ARLAS-wui/issues/628)

**Miscellaneous:**

- Upgrade NGINX version [\#718](https://github.com/gisaia/ARLAS-wui/issues/718)

## [v24.3.8](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.8) (2024-04-24)

**New stuff:**

- Add spanish translation [\#764](https://github.com/gisaia/ARLAS-wui/issues/764)

**Fixed bugs:**

- Close button in build bbox with coordinates does not work [\#759](https://github.com/gisaia/ARLAS-wui/issues/759)
- The cross button in the Generate bbox popup does not work [\#738](https://github.com/gisaia/ARLAS-wui/issues/738)

## [v24.3.7](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.7) (2024-04-05)

## [v24.3.6](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.6) (2024-04-05)

## [v24.3.5](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.5) (2024-04-05)

## [v24.3.4](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.4) (2024-04-04)

**New stuff:**

- \[openid\] add memory storage in oidc [\#763](https://github.com/gisaia/ARLAS-wui/issues/763)
- Add find place function in the map control panel [\#758](https://github.com/gisaia/ARLAS-wui/issues/758)

## [v24.3.3](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.3) (2024-03-20)

## [v24.3.2](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.2) (2024-03-01)

**New stuff:**

- use app name in toolbar logo tooltip instead of 'ARLAS-wui' [\#751](https://github.com/gisaia/ARLAS-wui/issues/751)

## [v24.3.1](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.1) (2024-02-16)

**New stuff:**

- Pass custom headers to protomaps basemaps [\#739](https://github.com/gisaia/ARLAS-wui/issues/739)

**Fixed bugs:**

- Polygons cross the antimeridian whatever there orientation is [\#733](https://github.com/gisaia/ARLAS-wui/issues/733)
- Dialogs are not displaying like before [\#723](https://github.com/gisaia/ARLAS-wui/issues/723)

## [v24.3.0](https://github.com/gisaia/ARLAS-WUI/tree/v24.3.0) (2023-12-20)

## [v24.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v24.2.0) (2023-11-30)

**New stuff:**

- Add an option of force\_connect in IAM mode [\#676](https://github.com/gisaia/ARLAS-wui/issues/676)

**Fixed bugs:**

- The timeline disappears when there is no data  [\#696](https://github.com/gisaia/ARLAS-wui/issues/696)

## [v24.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v24.1.0) (2023-08-09)

**New stuff:**

- Add menu bar at the top of application [\#608](https://github.com/gisaia/ARLAS-wui/issues/608)

**Fixed bugs:**

- tinycolor2  has published a new version lately that breaks arlas-wui install [\#585](https://github.com/gisaia/ARLAS-wui/issues/585)

**Miscellaneous:**

- Timeline selection is based on timezone [\#512](https://github.com/gisaia/ARLAS-wui/issues/512)

## [v23.0.5](https://github.com/gisaia/ARLAS-WUI/tree/v23.0.5) (2023-06-02)

**Miscellaneous:**

- Upgrade angular to v14 in front stack [\#580](https://github.com/gisaia/ARLAS-wui/issues/580)

## [v24.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v24.0.0) (2023-05-16)

**New stuff:**

- \[LEGEND\] display 'Manual' and 'Generated' colors legend the same way [\#596](https://github.com/gisaia/ARLAS-wui/issues/596)
- Add an indication for 'caridinality' metric, that the value is approximative [\#578](https://github.com/gisaia/ARLAS-wui/issues/578)

**Fixed bugs:**

- negative values on x-axis are rendered as NaN [\#594](https://github.com/gisaia/ARLAS-wui/issues/594)
- \[LEGEND\] the ordering of the layer within a visualisation set does not always work [\#579](https://github.com/gisaia/ARLAS-wui/issues/579)
- When loading the application many calls to arlas-server are duplicated or not needed [\#575](https://github.com/gisaia/ARLAS-wui/issues/575)
- \[LEGEND\] Heatmap legend does not display proper counts [\#573](https://github.com/gisaia/ARLAS-wui/issues/573)
- Visualisation service dont work if geometry is Geojson in es document [\#570](https://github.com/gisaia/ARLAS-wui/issues/570)
- Detailed histogram does not adapt itself to the correct extend [\#557](https://github.com/gisaia/ARLAS-wui/issues/557)
- When reaching the border of the map, trails don't go in the right direction but make a loop around the world [\#531](https://github.com/gisaia/ARLAS-wui/issues/531)
- Legend : Labels of provided colors can generate entires with hex colors [\#510](https://github.com/gisaia/ARLAS-wui/issues/510)
- Map legend : filters on data visibility are ignored in the legend [\#486](https://github.com/gisaia/ARLAS-wui/issues/486)
- Filter on histogram miss extrem value [\#576](https://github.com/gisaia/ARLAS-wui/issues/576)

**Miscellaneous:**

- Upgrade shpjs version to fix vulnerability [\#597](https://github.com/gisaia/ARLAS-wui/issues/597)
- remove cache from settings.yaml file [\#595](https://github.com/gisaia/ARLAS-wui/issues/595)

## [v23.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v23.2.0) (2023-02-17)

**Fixed bugs:**

- Issues with the WUI [\#463](https://github.com/gisaia/ARLAS-wui/issues/463)

## [v23.2.0-alpha.2](https://github.com/gisaia/ARLAS-WUI/tree/v23.2.0-alpha.2) (2023-02-09)

**Fixed bugs:**

- \[BOOKMARKS\] the action of clicking on DELETE \(BIN\) does not remove the bookmark [\#574](https://github.com/gisaia/ARLAS-wui/issues/574)
- Deleting a polygon via the "draw" menu does not delete the filter [\#569](https://github.com/gisaia/ARLAS-wui/issues/569)
- The bookmarks do not show up anymore in the top right corner. [\#566](https://github.com/gisaia/ARLAS-wui/issues/566)
- Basemap selector disappear when mouse moving over the map cells [\#556](https://github.com/gisaia/ARLAS-wui/issues/556)
- Inconsistency in the legend of clusters of the preview of the builder versus the WUI: Polygon becomes Fill [\#550](https://github.com/gisaia/ARLAS-wui/issues/550)
- Deselecting the sort field of a data table does not fully clear the field [\#516](https://github.com/gisaia/ARLAS-wui/issues/516)
- When mouse hover and loose focus on geo-filters button, the menu remains. [\#508](https://github.com/gisaia/ARLAS-wui/issues/508)

**Miscellaneous:**

- Add npm audit action [\#577](https://github.com/gisaia/ARLAS-wui/issues/577)

## [v23.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v23.1.0) (2022-11-29)

**Fixed bugs:**

- Average metric is not displayed correctly on the map [\#567](https://github.com/gisaia/ARLAS-wui/issues/567)
- The legend of layers does not display properly and flickers when ARLAS loads \(23.0.1\) [\#529](https://github.com/gisaia/ARLAS-wui/issues/529)

## [v23.0.4](https://github.com/gisaia/ARLAS-WUI/tree/v23.0.4) (2022-11-21)

**New stuff:**

- \[powerbar\] display the value associated to each term \(bar\) [\#541](https://github.com/gisaia/ARLAS-wui/issues/541)

**Fixed bugs:**

- Labels dissapear by other layers  [\#560](https://github.com/gisaia/ARLAS-wui/issues/560)
- It is not possible to import a `.geojson` file to import a polygon [\#532](https://github.com/gisaia/ARLAS-wui/issues/532)
- Hovering over a data table feature on the map does not highlight the feature in the data table [\#518](https://github.com/gisaia/ARLAS-wui/issues/518)

## [v20.1.2](https://github.com/gisaia/ARLAS-WUI/tree/v20.1.2) (2022-09-29)

## [v23.0.3](https://github.com/gisaia/ARLAS-WUI/tree/v23.0.3) (2022-09-27)

## [v23.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v23.0.2) (2022-09-12)

**Fixed bugs:**

- Text not contained in text box when interacting with features restricted by a data table [\#517](https://github.com/gisaia/ARLAS-wui/issues/517)
- favicon disappeared [\#511](https://github.com/gisaia/ARLAS-wui/issues/511)
- Legend of metrics not centered [\#507](https://github.com/gisaia/ARLAS-wui/issues/507)

## [v23.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v23.0.1) (2022-08-31)

**Fixed bugs:**

- Metric Hits count creates an error [\#509](https://github.com/gisaia/ARLAS-wui/issues/509)
- Choosing a bucket size in the timeline does not seem to work [\#490](https://github.com/gisaia/ARLAS-wui/issues/490)
- Detail view of resultlist is not scrollable [\#447](https://github.com/gisaia/ARLAS-wui/issues/447)
- Legend values are between 0 and 1 when normalizing a metric [\#445](https://github.com/gisaia/ARLAS-wui/issues/445)

## [v22.0.3](https://github.com/gisaia/ARLAS-WUI/tree/v22.0.3) (2022-07-11)

## [v23.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v23.0.0) (2022-07-11)

**New stuff:**

- Export a visible layer as Geojson [\#475](https://github.com/gisaia/ARLAS-wui/issues/475)

## [v22.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v22.0.2) (2022-07-08)

**New stuff:**

- Timeline : recalculate the number of buckets after showing/hiding a collection  [\#452](https://github.com/gisaia/ARLAS-wui/issues/452)

**Fixed bugs:**

- Cartographic elements are not displayed correctly on the map [\#474](https://github.com/gisaia/ARLAS-wui/issues/474)

## [v22.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v22.0.1) (2022-07-06)

**New stuff:**

- Timeline : enhance displayed tooltip at hover [\#453](https://github.com/gisaia/ARLAS-wui/issues/453)

**Fixed bugs:**

- Creating a dataset \(bookmark\) does not work [\#489](https://github.com/gisaia/ARLAS-wui/issues/489)
- The map actions are not visible on demos that are using a image grid on the right side [\#487](https://github.com/gisaia/ARLAS-wui/issues/487)

**Miscellaneous:**

- Link "Get started" not working [\#461](https://github.com/gisaia/ARLAS-wui/issues/461) [[documentation](https://github.com/gisaia/ARLAS-wui/labels/documentation)]

## [v22.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v22.0.0) (2022-05-25)

**New stuff:**

- Adapt Map settings component to handle multi-collection [\#464](https://github.com/gisaia/ARLAS-wui/issues/464)
- Replace the collection name by the display\_name of the collection [\#457](https://github.com/gisaia/ARLAS-wui/issues/457)
- Download command doesn't handle multi-collection [\#440](https://github.com/gisaia/ARLAS-wui/issues/440)
- Create a dedicated component to choose basemaps [\#387](https://github.com/gisaia/ARLAS-wui/issues/387)

**Fixed bugs:**

- Timeline : legend of collections is wrongly displayed when using time shortcuts [\#454](https://github.com/gisaia/ARLAS-wui/issues/454)

**Miscellaneous:**

- Dockerfile need root right to be execute in K8S [\#423](https://github.com/gisaia/ARLAS-wui/issues/423)

## [v20.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v20.1.1) (2022-04-13)

## [v21.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v21.0.0) (2022-04-05)

**New stuff:**

- Encode the visible layers and selected tabs in url [\#403](https://github.com/gisaia/ARLAS-wui/issues/403)

## [v19.1.2](https://github.com/gisaia/ARLAS-WUI/tree/v19.1.2) (2022-02-28)

**New stuff:**

- Add the possibility to exclude a bar in powerbars [\#396](https://github.com/gisaia/ARLAS-wui/issues/396)

**Fixed bugs:**

- bboxes prevent from showing detail of a feature when clicking on it [\#373](https://github.com/gisaia/ARLAS-wui/issues/373)

## [v20.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v20.1.0) (2022-02-21)

**New stuff:**

- Add possibility to scroll in powerbars widgets [\#422](https://github.com/gisaia/ARLAS-wui/issues/422)
- Make powerbars scrollable [\#398](https://github.com/gisaia/ARLAS-wui/issues/398)

**Fixed bugs:**

- Resultlists with small initial page size are not scrollable [\#408](https://github.com/gisaia/ARLAS-wui/issues/408)
- Aggegated data don't load east the Behring detroit [\#379](https://github.com/gisaia/ARLAS-wui/issues/379)
- Hovering items on the list doesn't highlight features on the map [\#370](https://github.com/gisaia/ARLAS-wui/issues/370)

## [v20.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v20.0.0) (2022-02-02)

**New stuff:**

- Add possibility to exclude selection from filter in powerbars widgets [\#421](https://github.com/gisaia/ARLAS-wui/issues/421)

**Fixed bugs:**

- Issue with embarked config.json file [\#424](https://github.com/gisaia/ARLAS-wui/issues/424)
- Export CSV button is not well positionned in the analytics board [\#377](https://github.com/gisaia/ARLAS-wui/issues/377)
- Widgets are not loaded in the analytics board [\#374](https://github.com/gisaia/ARLAS-wui/issues/374)

## [v19.2.3](https://github.com/gisaia/ARLAS-WUI/tree/v19.2.3) (2022-01-21)

**Fixed bugs:**

- Count does not show for dashboards created with 19.1.0 and displayed in 19.2.0 [\#413](https://github.com/gisaia/ARLAS-wui/issues/413)
- Interpolation of colors of a layer according to timestamp doesn't work [\#410](https://github.com/gisaia/ARLAS-wui/issues/410)
- Basmap credits are not visible correctly [\#405](https://github.com/gisaia/ARLAS-wui/issues/405)
- Scrolling data in resultlist may fetch duplicated raws [\#378](https://github.com/gisaia/ARLAS-wui/issues/378)
- Features and Legend of layers colored with the `manual` option don't render correctly when having negative values [\#371](https://github.com/gisaia/ARLAS-wui/issues/371)
- Scrollable layers style is not set correctly at app initialisation [\#369](https://github.com/gisaia/ARLAS-wui/issues/369)
- List loads 'precedent' data that already exists [\#358](https://github.com/gisaia/ARLAS-wui/issues/358)

**Miscellaneous:**

- Use the mapComponent outputs directly in the html [\#134](https://github.com/gisaia/ARLAS-wui/issues/134)

## [v19.2.2](https://github.com/gisaia/ARLAS-WUI/tree/v19.2.2) (2021-12-06)

## [v19.2.1](https://github.com/gisaia/ARLAS-WUI/tree/v19.2.1) (2021-12-06)

## [v19.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v19.2.0) (2021-12-06)

**New stuff:**

- Display the count of all decalred collections in collaborations [\#352](https://github.com/gisaia/ARLAS-wui/issues/352)
- Apply the ZoomTo feature by collection [\#351](https://github.com/gisaia/ARLAS-wui/issues/351)

**Fixed bugs:**

- Chosen sort field disappear from the list after hiding and redesplaying it [\#357](https://github.com/gisaia/ARLAS-wui/issues/357)
- Map tooltip keeps an 'close' icon after hiding it [\#350](https://github.com/gisaia/ARLAS-wui/issues/350)
- Interaction of the list on linestring on map doesn't work [\#349](https://github.com/gisaia/ARLAS-wui/issues/349)

## [v19.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v19.1.1) (2021-10-28)

**Fixed bugs:**

- Fix datepicker timezone [\#348](https://github.com/gisaia/ARLAS-wui/issues/348)

## [v17.2.6](https://github.com/gisaia/ARLAS-WUI/tree/v17.2.6) (2021-10-28)

## [v19.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v19.1.0) (2021-10-25)

## [v19.0.4](https://github.com/gisaia/ARLAS-WUI/tree/v19.0.4) (2021-10-11)

## [v19.0.3](https://github.com/gisaia/ARLAS-WUI/tree/v19.0.3) (2021-10-06)

**Fixed bugs:**

- Click on features when no resullist is defined throws an error [\#339](https://github.com/gisaia/ARLAS-wui/issues/339)
- Layers that are not "Scrollable top elements" are not fetched correctly [\#338](https://github.com/gisaia/ARLAS-wui/issues/338)

## [v19.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v19.0.2) (2021-09-30)

## [v19.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v19.0.1) (2021-09-30)

**New stuff:**

- Optimize 'scrollable top hits' layers fetch data trigger [\#313](https://github.com/gisaia/ARLAS-wui/issues/313)
- Support interaction between list elements and map features both ways [\#309](https://github.com/gisaia/ARLAS-wui/issues/309)
- \[Multi-collection\] apply timeline filters to widgets and layers of other collections [\#287](https://github.com/gisaia/ARLAS-wui/issues/287)

**Fixed bugs:**

- Fill icon color in legend is wrong [\#335](https://github.com/gisaia/ARLAS-wui/issues/335)
- Legend issue : empty fill polygon with data driven color stroke display no legend [\#322](https://github.com/gisaia/ARLAS-wui/issues/322)

**Miscellaneous:**

- Display additional information on the map  [\#307](https://github.com/gisaia/ARLAS-wui/issues/307)
- Apply same pagination between map and result list [\#306](https://github.com/gisaia/ARLAS-wui/issues/306)
- Synchronise data displayed on the map and the result list [\#305](https://github.com/gisaia/ARLAS-wui/issues/305)

## [v19.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v19.0.0) (2021-09-28)

**New stuff:**

- Add result list to the right of the application with tabs [\#314](https://github.com/gisaia/ARLAS-wui/issues/314)

## [v18.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v18.1.1) (2021-09-17)

## [v17.2.5](https://github.com/gisaia/ARLAS-WUI/tree/v17.2.5) (2021-09-17)

## [v18.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v18.1.0) (2021-09-13)

## [v18.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v18.0.2) (2021-08-16)

## [v17.2.4](https://github.com/gisaia/ARLAS-WUI/tree/v17.2.4) (2021-08-16)

## [v18.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v18.0.1) (2021-08-06)

## [v17.2.3](https://github.com/gisaia/ARLAS-WUI/tree/v17.2.3) (2021-08-03)

## [v18.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v18.0.0) (2021-07-12)

## [v17.2.2](https://github.com/gisaia/ARLAS-WUI/tree/v17.2.2) (2021-07-09)

## [v17.2.1](https://github.com/gisaia/ARLAS-WUI/tree/v17.2.1) (2021-06-30)

## [v17.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v17.2.0) (2021-06-24)

## [v17.1.5](https://github.com/gisaia/ARLAS-WUI/tree/v17.1.5) (2021-06-18)

## [v17.1.4](https://github.com/gisaia/ARLAS-WUI/tree/v17.1.4) (2021-06-17)

## [v17.1.3](https://github.com/gisaia/ARLAS-WUI/tree/v17.1.3) (2021-06-17)

## [v17.1.2](https://github.com/gisaia/ARLAS-WUI/tree/v17.1.2) (2021-06-14)

## [v17.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v17.1.1) (2021-06-14)

**New stuff:**

- Share only layers that are visible on the map [\#294](https://github.com/gisaia/ARLAS-wui/issues/294)
- Add the possibility to override the arlas-version dynamically [\#292](https://github.com/gisaia/ARLAS-wui/issues/292)

## [v17.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v17.1.0) (2021-06-04)

## [v17.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v17.0.1) (2021-05-21)

**New stuff:**

- Support i18n for tour.json [\#254](https://github.com/gisaia/ARLAS-wui/issues/254) [[conf](https://github.com/gisaia/ARLAS-wui/labels/conf)]

## [v17.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v17.0.0) (2021-05-19)

## [v16.1.2](https://github.com/gisaia/ARLAS-WUI/tree/v16.1.2) (2021-04-30)

## [v16.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v16.1.1) (2021-04-29)

## [v16.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v16.1.0) (2021-04-21)

## [v16.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v16.0.2) (2021-04-12)

**New stuff:**

- Support shapefile download [\#243](https://github.com/gisaia/ARLAS-wui/issues/243)

## [v16.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v16.0.1) (2021-03-31)

## [v16.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v16.0.0) (2021-03-29)

## [v15.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v15.0.2) (2021-02-25)

## [v15.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v15.0.1) (2021-02-23)

## [v15.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v15.0.0) (2021-02-18)

**Fixed bugs:**

- Wrong css applied in details section in resultlist [\#268](https://github.com/gisaia/ARLAS-wui/issues/268)

## [v14.3.1](https://github.com/gisaia/ARLAS-WUI/tree/v14.3.1) (2021-02-03)

## [v14.3.0](https://github.com/gisaia/ARLAS-WUI/tree/v14.3.0) (2021-02-01)

**New stuff:**

- Make Tab title configurable [\#265](https://github.com/gisaia/ARLAS-wui/issues/265)
- Display the dashboard name instead of "ARLAS" [\#240](https://github.com/gisaia/ARLAS-wui/issues/240)

## [v14.2.2](https://github.com/gisaia/ARLAS-WUI/tree/v14.2.2) (2021-01-19)

## [v14.2.1](https://github.com/gisaia/ARLAS-WUI/tree/v14.2.1) (2021-01-18)

## [v14.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v14.2.0) (2021-01-18)

**Miscellaneous:**

- Publish component build library to npm [\#258](https://github.com/gisaia/ARLAS-wui/issues/258)

## [v14.1.2](https://github.com/gisaia/ARLAS-WUI/tree/v14.1.2) (2020-12-22)

## [v14.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v14.1.1) (2020-12-18)

**New stuff:**

- Add map coordinates [\#248](https://github.com/gisaia/ARLAS-wui/issues/248)

## [v14.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v14.1.0) (2020-12-07)

**Fixed bugs:**

- Import geometries as filter is broken [\#244](https://github.com/gisaia/ARLAS-wui/issues/244)

## [v14.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v14.0.1) (2020-11-13)

## [v14.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v14.0.0) (2020-11-09)

## [v14.0.0-test-doc](https://github.com/gisaia/ARLAS-WUI/tree/v14.0.0-test-doc) (2020-09-17)

**Fixed bugs:**

- Add a silent-refresh html page to renew token [\#227](https://github.com/gisaia/ARLAS-wui/issues/227)

## [v13.0.3](https://github.com/gisaia/ARLAS-WUI/tree/v13.0.3) (2020-07-10)

## [v13.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v13.0.2) (2020-06-26)

## [v13.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v13.0.1) (2020-06-25)

**New stuff:**

- \[Resultlist\] Get collection id from CSS instead of config [\#218](https://github.com/gisaia/ARLAS-wui/issues/218)
- Add percentage in "donut" widget  [\#147](https://github.com/gisaia/ARLAS-wui/issues/147)

**Fixed bugs:**

- Map: Two aggregation levels presented at once [\#143](https://github.com/gisaia/ARLAS-wui/issues/143)

## [v13.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v13.0.0) (2020-06-18)

**New stuff:**

- Add unit to global count [\#213](https://github.com/gisaia/ARLAS-wui/issues/213)
- Dot indicating filters in Tab's title appears on the title [\#194](https://github.com/gisaia/ARLAS-wui/issues/194)

## [v12.7.0](https://github.com/gisaia/ARLAS-WUI/tree/v12.7.0) (2020-05-13)

**New stuff:**

- Enable persistance-server configuration through env var for gisaia/arlas-wui [\#207](https://github.com/gisaia/ARLAS-wui/issues/207)
- Enable tagger configuration through env var for gisaia/arlas-wui [\#206](https://github.com/gisaia/ARLAS-wui/issues/206)

## [v12.6.4](https://github.com/gisaia/ARLAS-WUI/tree/v12.6.4) (2020-04-10)

**New stuff:**

- Enable collection configuration through env var for gisaia/arlas-wui  [\#200](https://github.com/gisaia/ARLAS-wui/issues/200) [[documentation](https://github.com/gisaia/ARLAS-wui/labels/documentation)] [[conf](https://github.com/gisaia/ARLAS-wui/labels/conf)]

## [v12.6.3](https://github.com/gisaia/ARLAS-WUI/tree/v12.6.3) (2020-03-26)

## [v12.6.2](https://github.com/gisaia/ARLAS-WUI/tree/v12.6.2) (2020-03-23)

## [v12.6.1](https://github.com/gisaia/ARLAS-WUI/tree/v12.6.1) (2020-03-20)

## [v12.6.0](https://github.com/gisaia/ARLAS-WUI/tree/v12.6.0) (2020-03-13)

## [v12.5.5](https://github.com/gisaia/ARLAS-WUI/tree/v12.5.5) (2020-03-11)

## [12.5.4](https://github.com/gisaia/ARLAS-WUI/tree/12.5.4) (2020-02-24)

## [v12.5.4](https://github.com/gisaia/ARLAS-WUI/tree/v12.5.4) (2020-02-24)

## [v12.5.3](https://github.com/gisaia/ARLAS-WUI/tree/v12.5.3) (2020-02-19)

## [v12.5.2](https://github.com/gisaia/ARLAS-WUI/tree/v12.5.2) (2020-02-19)

**Fixed bugs:**

- Fix routing for auth callback response [\#191](https://github.com/gisaia/ARLAS-wui/issues/191)

## [v12.5.1](https://github.com/gisaia/ARLAS-WUI/tree/v12.5.1) (2020-02-17)

## [v12.5.0](https://github.com/gisaia/ARLAS-WUI/tree/v12.5.0) (2020-02-17)

## [v12.4.0](https://github.com/gisaia/ARLAS-WUI/tree/v12.4.0) (2020-02-10)

**New stuff:**

- Add entry in configuration to display or not indicators on analytics board [\#187](https://github.com/gisaia/ARLAS-wui/issues/187) [[conf](https://github.com/gisaia/ARLAS-wui/labels/conf)]
- Update toolkit version to 12.4.0 [\#186](https://github.com/gisaia/ARLAS-wui/issues/186)
- Add entry in configuration to display or not "zoom to data" button [\#185](https://github.com/gisaia/ARLAS-wui/issues/185) [[conf](https://github.com/gisaia/ARLAS-wui/labels/conf)]
- Add entry in configuration to activate gauge [\#184](https://github.com/gisaia/ARLAS-wui/issues/184) [[conf](https://github.com/gisaia/ARLAS-wui/labels/conf)]

## [v12.3.0](https://github.com/gisaia/ARLAS-WUI/tree/v12.3.0) (2020-02-03)

**New stuff:**

- Update stack to v12.3.0 [\#181](https://github.com/gisaia/ARLAS-wui/issues/181)
- Add a button that allows to zoom to data extent [\#180](https://github.com/gisaia/ARLAS-wui/issues/180)

## [v12.2.2](https://github.com/gisaia/ARLAS-WUI/tree/v12.2.2) (2020-01-24)

**Fixed bugs:**

- Donut size change when applying a filter [\#178](https://github.com/gisaia/ARLAS-wui/issues/178)

## [v12.2.1](https://github.com/gisaia/ARLAS-WUI/tree/v12.2.1) (2020-01-17)

**Fixed bugs:**

- Missing replacement of Google Analytics Key [\#176](https://github.com/gisaia/ARLAS-wui/issues/176)

## [v12.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v12.2.0) (2020-01-17)

**New stuff:**

- Upgrade stack to v12.2.0 [\#174](https://github.com/gisaia/ARLAS-wui/issues/174)
- Add configuration node for Spinner activation [\#173](https://github.com/gisaia/ARLAS-wui/issues/173)
- Add env variable to set Google Analytics key [\#168](https://github.com/gisaia/ARLAS-wui/issues/168)
- Support serving app under URL base-path [\#156](https://github.com/gisaia/ARLAS-wui/issues/156)

## [v12.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v12.1.1) (2019-12-23)

**Fixed bugs:**

- Sort radio buttons of Result list get deselected by MapSettings component [\#166](https://github.com/gisaia/ARLAS-wui/issues/166)
- Hide and show topology styles [\#165](https://github.com/gisaia/ARLAS-wui/issues/165)

## [v12.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v12.1.0) (2019-12-19)

**New stuff:**

- Upgrade to v12.1.0 of the stack [\#163](https://github.com/gisaia/ARLAS-wui/issues/163)
- Remove bootstrap dependency [\#160](https://github.com/gisaia/ARLAS-wui/issues/160)
- Start the presentation tour on app launch if available [\#157](https://github.com/gisaia/ARLAS-wui/issues/157)

**Fixed bugs:**

- Changing the rendred styles in Feature mode is not supported [\#164](https://github.com/gisaia/ARLAS-wui/issues/164)

**Miscellaneous:**

- Remove yarn.lock [\#159](https://github.com/gisaia/ARLAS-wui/issues/159)
- Document the configuration of ARLAS-wui [\#35](https://github.com/gisaia/ARLAS-wui/issues/35) [[documentation](https://github.com/gisaia/ARLAS-wui/labels/documentation)]

## [v12.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v12.0.0) (2019-11-22)

**Breaking changes:**

- Update to angular 8.1 [\#136](https://github.com/gisaia/ARLAS-wui/issues/136)

**New stuff:**

- \[MAP\] Use redrawTile as input  [\#153](https://github.com/gisaia/ARLAS-wui/issues/153)
- Add MapSettings Component [\#152](https://github.com/gisaia/ARLAS-wui/issues/152)
- Add css style for 'Export CSV' button [\#151](https://github.com/gisaia/ARLAS-wui/issues/151)
- Display button on widget hover [\#148](https://github.com/gisaia/ARLAS-wui/pull/148) ([mbarbet](https://github.com/mbarbet))

## [v11.4.0](https://github.com/gisaia/ARLAS-WUI/tree/v11.4.0) (2019-11-08)

## [v11.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v11.2.0) (2019-10-03)

**New stuff:**

- Add download component in chip menu [\#146](https://github.com/gisaia/ARLAS-wui/pull/146) ([sebbousquet](https://github.com/sebbousquet))

**Fixed bugs:**

- add sort by id to geosort [\#145](https://github.com/gisaia/ARLAS-wui/pull/145) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))
- Add sort by Id to resultlist + handle nested id field path [\#144](https://github.com/gisaia/ARLAS-wui/pull/144) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))

## [v11.1.1](https://github.com/gisaia/ARLAS-WUI/tree/v11.1.1) (2019-09-27)

**Fixed bugs:**

- Make mkDocs.sh file executable  [\#141](https://github.com/gisaia/ARLAS-wui/issues/141)
- Fix filter chips integration [\#142](https://github.com/gisaia/ARLAS-wui/pull/142) ([sebbousquet](https://github.com/sebbousquet))

## [v11.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v11.1.0) (2019-09-17)

**New stuff:**

- Tagging with propagation \(WUI\) [\#133](https://github.com/gisaia/ARLAS-wui/issues/133)
- Use new tagger component [\#140](https://github.com/gisaia/ARLAS-wui/pull/140) ([sebbousquet](https://github.com/sebbousquet))

## [v11.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v11.0.0) (2019-09-10)

**New stuff:**

- Add analyticsContributor in html [\#135](https://github.com/gisaia/ARLAS-wui/issues/135)
- Feature/toollkit11 [\#138](https://github.com/gisaia/ARLAS-wui/pull/138) ([sebbousquet](https://github.com/sebbousquet))
- Add groupsDisplayStatusMap in analytics board [\#137](https://github.com/gisaia/ARLAS-wui/pull/137) ([mbarbet](https://github.com/mbarbet))

## [v10.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v10.0.1) (2019-05-15)

**Fixed bugs:**

- Fix 'envsubst' replacement [\#131](https://github.com/gisaia/ARLAS-wui/issues/131)

## [v10.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v10.0.0) (2019-05-09)

**New stuff:**

- Add 'map\_styles' queryParam to share selected styles of the map in url [\#128](https://github.com/gisaia/ARLAS-wui/pull/128) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))
- Upgrade to arlas-wui-toolkit@10.0.0 [\#127](https://github.com/gisaia/ARLAS-wui/pull/127) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))
- Add customizable css file in app assets [\#125](https://github.com/gisaia/ARLAS-wui/pull/125) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))

**Miscellaneous:**

- Environment variables provided to the container are replaced within the configuration file [\#115](https://github.com/gisaia/ARLAS-wui/issues/115) [[conf](https://github.com/gisaia/ARLAS-wui/labels/conf)]

## [v9.3.1](https://github.com/gisaia/ARLAS-WUI/tree/v9.3.1) (2019-04-26)

**New stuff:**

- Fetch resources before running the app [\#126](https://github.com/gisaia/ARLAS-wui/pull/126) ([sebbousquet](https://github.com/sebbousquet))

## [v9.3.0](https://github.com/gisaia/ARLAS-WUI/tree/v9.3.0) (2019-03-21)

**New stuff:**

- Add the map input :'defaultBasemapStyle' & 'basemapStyles' [\#124](https://github.com/gisaia/ARLAS-wui/pull/124) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))

## [v9.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v9.2.0) (2019-02-14)

**New stuff:**

- Allow analytics elements to be dragged and dropped [\#113](https://github.com/gisaia/ARLAS-wui/issues/113)
- Add version information [\#57](https://github.com/gisaia/ARLAS-wui/issues/57)
- Show the app version hover app title [\#119](https://github.com/gisaia/ARLAS-wui/pull/119) ([sebbousquet](https://github.com/sebbousquet))
- Enable topomap  from conf [\#116](https://github.com/gisaia/ARLAS-wui/pull/116) ([mbarbet](https://github.com/mbarbet))

**Fixed bugs:**

- Fix geosort configuration validity check [\#118](https://github.com/gisaia/ARLAS-wui/issues/118)

## [v9.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v9.0.0) (2018-12-03)

**Breaking changes:**

- Update to angular 7 [\#104](https://github.com/gisaia/ARLAS-wui/issues/104)

**New stuff:**

- Replace angular2-markdown by ngx-md [\#90](https://github.com/gisaia/ARLAS-wui/issues/90)
- Update to angular 7 [\#114](https://github.com/gisaia/ARLAS-wui/pull/114) ([sebbousquet](https://github.com/sebbousquet))

## [v8.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v8.0.0) (2018-10-24)

**New stuff:**

- Add default css for all analytics components  [\#105](https://github.com/gisaia/ARLAS-wui/issues/105)
- Add container healthcheck [\#76](https://github.com/gisaia/ARLAS-wui/issues/76)

**Fixed bugs:**

- Before instantiate check existence of contributor in conf [\#106](https://github.com/gisaia/ARLAS-wui/issues/106)

## [v7.4.2](https://github.com/gisaia/ARLAS-WUI/tree/v7.4.2) (2018-10-17)

**New stuff:**

- Integrate Datapicker in timeline [\#108](https://github.com/gisaia/ARLAS-wui/pull/108) ([sebbousquet](https://github.com/sebbousquet))

**Fixed bugs:**

- Wrap search with "" after pressing enter in autocompletion results [\#101](https://github.com/gisaia/ARLAS-wui/issues/101)

**Miscellaneous:**

- Add list of supported browsers in generated doc [\#103](https://github.com/gisaia/ARLAS-wui/issues/103) [[documentation](https://github.com/gisaia/ARLAS-wui/labels/documentation)]

## [v7.4.1](https://github.com/gisaia/ARLAS-WUI/tree/v7.4.1) (2018-09-25)

**New stuff:**

- ARLAS WUI URL keeps the Map extend and moves the map to that extend at the initial load. [\#91](https://github.com/gisaia/ARLAS-wui/issues/91)
- Add tooltips for [\#86](https://github.com/gisaia/ARLAS-wui/issues/86)
- Add action 'zoom to' on each item in result list [\#99](https://github.com/gisaia/ARLAS-wui/pull/99) ([sebbousquet](https://github.com/sebbousquet))
- Add env variable for 'en' and 'fr' language file in start script [\#97](https://github.com/gisaia/ARLAS-wui/pull/97) ([sebbousquet](https://github.com/sebbousquet))

**Fixed bugs:**

- define language configuration files in when running arlas-wui docker container  [\#96](https://github.com/gisaia/ARLAS-wui/issues/96)

## [v7.4.0](https://github.com/gisaia/ARLAS-WUI/tree/v7.4.0) (2018-09-17)

**New stuff:**

- Add toggle button for search & analytics [\#92](https://github.com/gisaia/ARLAS-wui/pull/92) ([sebbousquet](https://github.com/sebbousquet))

**Fixed bugs:**

- Fix/dataset dialog validation [\#89](https://github.com/gisaia/ARLAS-wui/pull/89) ([sebbousquet](https://github.com/sebbousquet))

## [v7.3.0](https://github.com/gisaia/ARLAS-WUI/tree/v7.3.0) (2018-08-09)

**New stuff:**

- prepare Arlas-wui v7.3.0  [\#84](https://github.com/gisaia/ARLAS-wui/issues/84)
- MAP : Add delta checking of the map drag before geosorting the result list [\#80](https://github.com/gisaia/ARLAS-wui/issues/80)
- Dataset Managment [\#33](https://github.com/gisaia/ARLAS-wui/issues/33)

**Fixed bugs:**

- SEARCH: remove "" between search words as it doesn't allow simple\_query\_string [\#85](https://github.com/gisaia/ARLAS-wui/issues/85)
- Search bar send a request for empty strings [\#81](https://github.com/gisaia/ARLAS-wui/issues/81)

## [v7.2.0](https://github.com/gisaia/ARLAS-WUI/tree/v7.2.0) (2018-07-25)

**New stuff:**

- Feature/v.7.2.0 [\#77](https://github.com/gisaia/ARLAS-wui/pull/77) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))

## [v7.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v7.1.0) (2018-07-13)

**New stuff:**

- Update to v7.1.0 [\#75](https://github.com/gisaia/ARLAS-wui/pull/75) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))

**Fixed bugs:**

- Display search value on init [\#74](https://github.com/gisaia/ARLAS-wui/pull/74) ([sebbousquet](https://github.com/sebbousquet))

## [v7.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v7.0.1) (2018-06-26)

**New stuff:**

- Feature/improve layer switcher [\#71](https://github.com/gisaia/ARLAS-wui/pull/71) ([mbarbet](https://github.com/mbarbet))

**Fixed bugs:**

- Remove scroll bar display on load [\#72](https://github.com/gisaia/ARLAS-wui/pull/72) ([sebbousquet](https://github.com/sebbousquet))
- Fix configuration for map and timeline [\#70](https://github.com/gisaia/ARLAS-wui/pull/70) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))

## [v7.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v7.0.0) (2018-06-22)

**New stuff:**

- Add timeshortcuts and detailed timeline [\#66](https://github.com/gisaia/ARLAS-wui/issues/66)
- Feature/timeline [\#67](https://github.com/gisaia/ARLAS-wui/pull/67) ([MohamedHamouGisaia](https://github.com/MohamedHamouGisaia))

**Fixed bugs:**

- Items of autocomplete must be added to the search surrounded by double quote [\#64](https://github.com/gisaia/ARLAS-wui/issues/64)

## [v6.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v6.0.1) (2018-05-25)

## [v6.0.0](https://github.com/gisaia/ARLAS-WUI/tree/v6.0.0) (2018-05-24)

**New stuff:**

- Add changelog generation in release process [\#58](https://github.com/gisaia/ARLAS-wui/issues/58)
- Use analytics board event to highlight features on map [\#56](https://github.com/gisaia/ARLAS-wui/pull/56) ([sebbousquet](https://github.com/sebbousquet))

**Miscellaneous:**

- Add docker build in CI [\#19](https://github.com/gisaia/ARLAS-wui/issues/19)

## [v5.1.0](https://github.com/gisaia/ARLAS-WUI/tree/v5.1.0) (2018-04-30)

**Breaking changes:**

- Feature/angular5 [\#54](https://github.com/gisaia/ARLAS-wui/pull/54) ([sebbousquet](https://github.com/sebbousquet))

**Miscellaneous:**

- Add LABEL in Dockerfile [\#51](https://github.com/gisaia/ARLAS-wui/issues/51) [[documentation](https://github.com/gisaia/ARLAS-wui/labels/documentation)]
- Make ARLAS-wui configuration general [\#40](https://github.com/gisaia/ARLAS-wui/issues/40)

## [v5.0.3](https://github.com/gisaia/ARLAS-WUI/tree/v5.0.3) (2018-04-27)

**New stuff:**

- Add a button to reload the components [\#53](https://github.com/gisaia/ARLAS-wui/pull/53) ([sebbousquet](https://github.com/sebbousquet))

## [v5.0.2](https://github.com/gisaia/ARLAS-WUI/tree/v5.0.2) (2018-04-25)

**New stuff:**

- Make optional the display of components \(tag&share\) [\#50](https://github.com/gisaia/ARLAS-wui/pull/50) ([sebbousquet](https://github.com/sebbousquet))
- Define env variable for 'About.md' file in start script [\#47](https://github.com/gisaia/ARLAS-wui/pull/47) ([sebbousquet](https://github.com/sebbousquet))
- Improve cleaning in release script [\#46](https://github.com/gisaia/ARLAS-wui/pull/46) ([sebbousquet](https://github.com/sebbousquet))

**Fixed bugs:**

- Fix the donut component size [\#49](https://github.com/gisaia/ARLAS-wui/pull/49) ([sebbousquet](https://github.com/sebbousquet))

## [v5.0.1](https://github.com/gisaia/ARLAS-WUI/tree/v5.0.1) (2018-04-23)

**New stuff:**

- Add tag component [\#45](https://github.com/gisaia/ARLAS-wui/pull/45) ([sebbousquet](https://github.com/sebbousquet))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*