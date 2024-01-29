const heatmap = {
  "id": "arlas_id:Density of birds positions:1624986445203",
  "type": "heatmap",
  "source": "cluster-track.location-Finest-geohash-centroid-demo_birdtracking-movebank",
  "minzoom": 0,
  "maxzoom": 23,
  "layout": {
    "visibility": "visible"
  },
  "paint": {
    "heatmap-color": [
      "interpolate",
      [
        "linear"
      ],
      [
        "heatmap-density"
      ],
      0, "rgba(0, 0, 0, 0)",
      1e-12, "#cee897",
      0.05, "#9dc95b",
      0.1, "#4bc71e",
      0.15, "#1bc473",
      0.2, "#16ccc9",
      0.25, "#3619cf",
      0.3, "#9317d1",
      0.9, "#d11799",
      1, "#cf1919"
    ],
    "heatmap-opacity": 0.7,
    "heatmap-intensity": [
      "interpolate",
      [
        "linear"
      ],
      ["zoom"
      ],
      0, 1,
      10, 5
    ],
    "heatmap-weight": [
      "interpolate",
      [
        "linear"
      ],
      [
        "get",
        "count_:normalized"
      ],
      0, 0,
      0.1, 1,
      0.2, 1,
      0.5, 2,
      0.9, 10
    ],
    "heatmap-radius": 12
  },
  "metadata": {
    "collection": "demo_birdtracking-movebank",
    "collection-display-name": "demo_birdtracking-movebank"
  },
  "filter": [
    "all",
    [
      "all"
    ]
  ]
}


const cirlce_finest = {
  "id": "arlas_id:Gathered birds positions circle:1706023503869",
  "type": "circle",
  "source": "cluster-track.location-Finest-geohash-cell_center-demo_birdtracking-movebank",
  "minzoom": 0,
  "maxzoom": 24,
  "layout": {
    "visibility": "visible",
    "circle-sort-key": [
      "interpolate",
      [
        "linear"
      ],
      [
        "get",
        "count_:normalized"
      ],
      0, 0,
      0.2, 2,
      0.4, 4,
      0.6, 8
    ]
  },
  "paint": {
    "circle-opacity": [
      "interpolate",
      [
        "linear"
      ],
      [
        "get",
        "count_:normalized"
      ],
      0, 0.2,
      1,0.5
    ],
    "circle-color": [
      "interpolate",
      [
        "linear"
      ],
      [
        "get",
        "count_:normalized"
      ],
      0,
      "#cee897",
      0.05,
      "#9dc95b",
      0.1,
      "#4bc71e",
      0.15,
      "#1bc473",
      0.2,
      "#16ccc9",
      0.25,
      "#3619cf",
      0.3,
      "#9317d1",
      0.6,
      "#d11799",
      1,
      "#cf1919"
    ],
    "circle-radius":  [
      "interpolate",
      [
        "linear"
      ],
      ["zoom"],
      0, 9,
      2.9999999999999, 25,
      3, 9,
      4.9999999999999, 12,
      5, 4,
      7.9999999999999, 20,
      8, 10,
      10.9999999999999, 25,
      11, 60,
      13.9999999999999, 200,
      14, 200,
      16.9999999999999, 1000,
      17, 1000,
      19.9999999999999, 1500,
      20, 2000
    ],
    "circle-blur": 1,
    "circle-stroke-color": "#fff",
    "circle-stroke-opacity": 0
  },
  "metadata": {
    "collection": "demo_birdtracking-movebank",
    "collection-display-name": "demo_birdtracking-movebank"
  },
  "filter": [
    "all",
    [
      "all"
    ]
  ]
}


const cirlce_fines = {
  "id": "arlas_id:heatmap-circle-fine:1706519948388",
  "type": "circle",
  "source": "cluster-track.trail_geohashes_6-Fine-geohash-cell_center-demo_ais_flow",
  "minzoom": 0,
  "maxzoom": 24,
  "layout": {
    "visibility": "visible",
    "circle-sort-key": [
      "interpolate",
      [
        "linear"
      ],
      [
        "get",
        "count_:normalized"
      ],
      0, 0,
      0.2, 2,
      0.4, 4,
      0.6, 8
    ]
  },
  "paint": {
    "circle-opacity": [
      "interpolate",
      [
        "linear"
      ],
      [
        "get",
        "count_:normalized"
      ],
      0, 0.2,
      1, 0.5
    ],
    "circle-color": [
      "interpolate",
      [
        "linear"
      ],
      [
        "get",
        "count_:normalized"
      ],
      0,
      "#cee897",
      0.125,
      "#9dc95b",
      0.25,
      "#4bc71e",
      0.3,
      "#1bc473",
      0.35,
      "#16ccc9",
      0.4,
      "#3619cf",
      0.55,
      "#9317d1",
      0.8,
      "#d11799",
      1,
      "#cf1919"
    ],
    "circle-radius": [
      "interpolate",
      [
        "linear"
      ],
      ["zoom"],
      0, 10,
      1.999, 30,
      4.999999, 90,
      5, 30,
      7.999999, 120,
      8, 40,
      10.499999, 180,
      10.5, 30,
      13.999999, 210,
      14, 300,
      16.999999, 1000,
      17, 2000
    ],
    "circle-blur": 1,
    "circle-stroke-width": 0,
    "circle-stroke-color": "#fff",
    "circle-stroke-opacity": 0
  }
}

const cirlce_med = {};


