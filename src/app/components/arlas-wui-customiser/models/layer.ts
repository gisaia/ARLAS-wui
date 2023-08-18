import { Visibility } from 'mapbox-gl';

export interface Layer {
    id: string;
    type: string;
    source: string;
    layout: Layout;
    minzoom: number;
    maxzoom: number;
    paint: Paint;
    filter?: Array<any>;
    metadata?: LayerMetadata;
}

export interface LayerMetadata {
    collection?: string;
    collectionDisplayName?: string;
    stroke?: FillStroke;
    isScrollableLayer?: boolean;
}

export interface FillStroke {
    width?: PaintValue;
    opacity?: number;
    color?: PaintValue;
}

export interface Layout {
    visibility?: Visibility;
    'line-cap'?: string;
    'line-join'?: string;
    'text-field'?: string;
    'text-size'?: PaintValue;
    'text-font'?: string[];
    'text-rotate'?: PaintValue;
    'text-allow-overlap'?: boolean;
    'text-anchor'?: string;
    'symbol-placement'?: string;
}

type PaintValue = Array<string | Array<string> | number> | PaintColor | string | number;
export interface Paint {
    'fill-color'?: PaintValue;
    'fill-opacity'?: number;
    'circle-color'?: PaintValue;
    'circle-opacity'?: number;
    'line-color'?: PaintValue;
    'line-opacity'?: number;
    'line-width'?: PaintValue;
    'line-dasharray'?: PaintValue;
    'circle-radius'?: PaintValue;
    'circle-stroke-width'?: PaintValue;
    'heatmap-color'?: PaintValue;
    'heatmap-radius'?: PaintValue;
    'heatmap-weight'?: PaintValue;
    'heatmap-intensity'?: number;
    'heatmap-opacity'?: number;
    'text-color'?: PaintValue;
    'text-opacity'?: PaintValue;
    'text-halo-blur'?: PaintValue;
    'text-halo-width'?: PaintValue;
    'text-halo-color'?: PaintValue;
    'text-translate'?: [number, number];

}

export interface PaintColor {
    property: string;
    type: string;
    stops: Array<Array<string>>;
}

export enum VISIBILITY {
    visible = 'visible',
    none = 'none'
}
