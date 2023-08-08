/*
Licensed to Gisaïa under one or more contributor
license agreements. See the NOTICE.txt file distributed with
this work for additional information regarding copyright
ownership. Gisaïa licenses this file to you under
the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/
import { CollectionReferenceDescriptionProperty } from 'arlas-api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CollectionField } from './models';

const typeEnum = CollectionReferenceDescriptionProperty.TypeEnum;

export const DATE_TYPES = [
  typeEnum.DATE, typeEnum.LONG
];

export const INTEGER_OR_DATE_TYPES = [
  ...DATE_TYPES, typeEnum.INTEGER
];

export const NUMERIC_OR_DATE_TYPES = [
  ...INTEGER_OR_DATE_TYPES, typeEnum.DOUBLE, typeEnum.FLOAT
];

export const NUMERIC_TYPES = [
  typeEnum.INTEGER, typeEnum.LONG, typeEnum.DOUBLE, typeEnum.FLOAT
];
export const NUMERIC_OR_DATE_OR_TEXT_TYPES = [
  ...NUMERIC_OR_DATE_TYPES, typeEnum.TEXT, typeEnum.KEYWORD
];

export const TEXT_OR_KEYWORD = [
  typeEnum.TEXT, typeEnum.KEYWORD
];

export const NUMERIC_OR_DATE_OR_KEYWORD = [
  ...NUMERIC_OR_DATE_TYPES, typeEnum.KEYWORD
];



export function toOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return collectionFieldsObs.pipe(map(
    fields => fields
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(f => ({ value: f.name, label: f.name, enabled: f.indexed, type: f.type }))
  ));
}

export function toNumericOrDateFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => NUMERIC_OR_DATE_TYPES.indexOf(f.type) >= 0)));
}

export function toNumericFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => NUMERIC_TYPES.indexOf(f.type) >= 0)));
}

export function toDateFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return collectionFieldsObs.pipe(map(
    fields => fields.filter(f => DATE_TYPES.indexOf(f.type) >= 0)));
}

export function toIntegerOrDateFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return collectionFieldsObs.pipe(map(
    fields => fields.filter(f => INTEGER_OR_DATE_TYPES.indexOf(f.type) >= 0)));
}


export function toNumericOrDateOrKeywordObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => f.type === typeEnum.KEYWORD || NUMERIC_OR_DATE_TYPES.indexOf(f.type) >= 0))));
}

export function toNumericOrDateOrKeywordOrBooleanObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => f.type === typeEnum.KEYWORD || NUMERIC_OR_DATE_TYPES.indexOf(f.type) >= 0
        || f.type === typeEnum.BOOLEAN))));
}

export function toNumericOrDateOrKeywordOrTextObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => TEXT_OR_KEYWORD.concat(NUMERIC_OR_DATE_TYPES).includes(f.type)))));
}

export function toNumericOrDateOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(toNumericOrDateFieldsObs(collectionFieldsObs));
}

export function toNumericOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(toNumericFieldsObs(collectionFieldsObs));
}

export function toIntegerOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => INTEGER_OR_DATE_TYPES.indexOf(f.type) >= 0))));
}

export function toKeywordOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => f.type === typeEnum.KEYWORD))));
}

export function toTextOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => f.type === typeEnum.TEXT))));
}

export function toGeoOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => f.type === typeEnum.GEOPOINT || f.type === typeEnum.GEOSHAPE))));
}

export function toGeoPointOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => f.type === typeEnum.GEOPOINT))));
}


export function toAllButGeoOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => f.type !== typeEnum.GEOPOINT && f.type !== typeEnum.GEOSHAPE))));
}

export function toTextOrKeywordOptionsObs(collectionFieldsObs: Observable<Array<CollectionField>>) {
  return toOptionsObs(collectionFieldsObs.pipe(map(
    fields => fields
      .filter(f => f.type === typeEnum.KEYWORD || f.type === typeEnum.TEXT))));
}

export function titleCase(str) {
  return str.toLowerCase().replace(/./, (x) => x.toUpperCase()).replace(/[^']\b\w/g, (y) => y.toUpperCase());
}
