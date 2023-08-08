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

import { ConfigFormGroup, ConfigFormControl, ControlOptionalParams, FormGroupElement } from './config-form';
import { Observable } from 'rxjs';
import { CollectionField } from '../services/collection-service/models';
import { FormArray } from '@angular/forms';


export class CollectionConfigFormGroup extends ConfigFormGroup {
  public collection: string;
  public collectionFieldsObs: Observable<Array<CollectionField>>;
  public constructor(
    collection: string,
    controls: {
      [key: string]: FormGroupElement;
    }) {
    super(controls);
    this.collection = collection;
  }

  public setCollection(collection: string): void {
    this.collection = collection;
  }

  public setCollectionFieldsObs(collectionFieldsObs: Observable<Array<CollectionField>>): void {
    this.collectionFieldsObs = collectionFieldsObs;
  }
}


export class CollectionConfigFormControl extends ConfigFormControl {
  public collection: string;

  public constructor(
    collection,
    formState: any,
    label: string,
    description: string,
    optionalParams: ControlOptionalParams = {}) {
    super(formState, label, description, optionalParams);
    this.collection = collection;
  }

  public setCollection(collection: string): void {
    this.collection = collection;
  }
}
