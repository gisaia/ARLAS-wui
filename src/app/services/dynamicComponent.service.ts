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
import { ApplicationRef, ComponentFactoryResolver, ComponentRef, Injectable, Injector, Type } from '@angular/core';

// TODO: is it still useful based on deprecation comment of ComponentFactoryResolver ?
@Injectable()
export class DynamicComponentService {

  private compRef: ComponentRef<any>;

  public constructor(
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef
  ) { }


  public injectComponent<T>(component: Type<T>, propertySetter?: (type: T) => void): HTMLDivElement {
    // Remove the Component if it Already Exists
    if (this.compRef) {
      this.compRef.destroy();
    }

    // Resolve the Component and Create
    const compFactory = this.resolver.resolveComponentFactory(component);
    this.compRef = compFactory.create(this.injector);

    // Allow a Property Setter to be Passed in (To Set a Model Property, etc)
    if (propertySetter) {
      propertySetter(this.compRef.instance);
    }

    // Attach to Application
    this.appRef.attachView(this.compRef.hostView);

    // Create Wrapper Div and Inject Html
    const div = document.createElement('div');
    div.appendChild(this.compRef.location.nativeElement);

    // Return the Rendered DOM Element
    return div;
  }
}
