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

import {Injectable} from '@angular/core';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  WebTracerProvider
} from '@opentelemetry/sdk-trace-web';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {ZoneContextManager} from '@opentelemetry/context-zone-peer-dep';
import {registerInstrumentations} from '@opentelemetry/instrumentation';
import {XMLHttpRequestInstrumentation} from '@opentelemetry/instrumentation-xml-http-request';
import {DocumentLoadInstrumentation} from '@opentelemetry/instrumentation-document-load';
import {context, Span, trace, Tracer} from '@opentelemetry/api';
import {ArlasSettingsService} from 'arlas-wui-toolkit';

export interface OpentelemetrySettings {
  enabled?: boolean;
  url?: string;
  service_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OpentelemetryService {
  private tracer: Tracer | null = null;
  private isEnabled = false;

  public constructor(private readonly settingsService: ArlasSettingsService) {
    this.initTracing();
  }

  private initTracing(): void {
    const settings = this.settingsService.getSettings();
    const otelSettings: OpentelemetrySettings = settings ? settings['opentelemetry'] : null;

    if (!otelSettings || otelSettings.enabled !== true) {
      return;
    }

    this.isEnabled = true;
    const serviceName = otelSettings.service_name || 'arlas-wui-frontend';
    const exporterUrl = otelSettings.url || 'http://localhost:4318/v1/traces';

    const collectorOptions = {
      url: exporterUrl, // url is optional and can be omitted - default is http://localhost:4318/v1/traces
      headers: {}, // an optional object containing custom headers to be sent with each request
      concurrencyLimit: 10, // an optional limit on pending requests
    };
    const exporter = new OTLPTraceExporter(collectorOptions);
    const provider = new WebTracerProvider({
      spanProcessors: [
        new BatchSpanProcessor(exporter, {
          // The maximum queue size. After the size is reached spans are dropped.
          maxQueueSize: 100,
          // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
          maxExportBatchSize: 10,
          // The interval between two consecutive exports
          scheduledDelayMillis: 500,
          // How long the export can run before it is cancelled
          exportTimeoutMillis: 30000,
        })
      ]
    });

    provider.register({
      contextManager: new ZoneContextManager(),
    });

    // Here we have all the instrument we want to spy.
    registerInstrumentations({
      instrumentations: [
        new DocumentLoadInstrumentation()
      ],
    });

    this.tracer = trace.getTracer(serviceName);
  }

  /**
   * Starts a new span.
   * @param name The name of the span
   */
  public startSpan(name: string): Span | null {
    if (!this.isEnabled || !this.tracer) {
      return null;
    }
    return this.tracer.startSpan(name);
  }

  /**
   * Ends an existing span.
   * @param span The span to end
   */
  public endSpan(span: Span | null): void {
    if (span) {
      span.end();
    }
  }

  /**
   * Sends a custom message/event to OpenTelemetry.
   * If there's an active span, it adds an event to it.
   * Otherwise, it creates a brief span just for this message.
   *
   * @param message The custom message to send
   * @param attributes Optional attributes to attach to the message
   */
  public sendCustomMessage(message: string, attributes?: Record<string, any>): void {
    if (!this.isEnabled || !this.tracer) {
      return;
    }

    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
      activeSpan.addEvent(message, attributes);
    } else {
      const span = this.tracer.startSpan('custom-message');
      span.addEvent(message, attributes);
      span.end();
    }
  }
}
