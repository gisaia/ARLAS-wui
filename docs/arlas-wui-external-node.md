# Configuring additional ARLAS-wui modules

## External node

Some functionalities of an ARLAS-wui dashboard are hidden behind a special configuration: the `external node`. It allows to add configuration for additional ARLAS modules, as well as any configuration specific to an application built on top of ARLAS.

It can be configured through the `Custom configuration` tab of ARLAS-builder.

## Available functionalities

### Download

| Path in external node | Default | Description                                             |
|-----------------------|---------|---------------------------------------------------------|
| download              | false   | Enables the AIAS download of Earth Observation products |

#### Example

```json
{
    "download": true
}
```

### Enrich

| Path in external node | Default | Description                                                          |
|-----------------------|---------|----------------------------------------------------------------------|
| enrich                | false   | Enables the AIAS enrich (COG creation) of Earth Observation products |

#### Example

```json
{
    "enrich": true
}
```

### Order form

| Path in external node     | Default          | Description                                                       |
|---------------------------|------------------|-------------------------------------------------------------------|
| order_form.enabled        | false            | Enables the order form                                            |
| order_form.text.button    | Order            | Text of the button to trigger the order                           |
| order_form.text.form      | Order a product  | Title of the form                                                 |
| order_form.endpoint       |                  | URL of the endpoint where the POST for the order will be sent     |
| order_form.payload        |                  | Structure of the payload to send. Can contain pre-defined values. If one of the value is "$AOI" or "$COMMENT" they will be replaced with the order's aoi and user defined comments respectively |
| order_form.response.ok    |                  | Message to display when the order is a success                    |
| order_form.response.error |                  | Message to display when the order failed                          |

If one of the mandatory field is not set, then `order_form.enabled` is set to false.

#### Example

```json
{
    "order_form": {
        "enabled": true,
        "endpoint": "https://...",
        "payload": {
            "aoi": "$AOI",
            "comments": "$COMMENT",
            "additionalInfo": "..."
        },
        "response": {
            "ok": "Product ordered",
            "error": "Error while ordering the product"
        }
    }
}
```

### Task status

Multiple Task retrievals can be configured. For each one of them, here are the available options:

| Path in external node    | Default | Description                                                                     |
|--------------------------|---------|---------------------------------------------------------------------------------|
| tasks.enabled            | false   | Enables the task retrieval                                                      |
| tasks.service            |         | Name of the service to display in the item's details                            |
| tasks.url                |         | URL of the `APROC` service                                                      |
| tasks.collections        |         | Collections for which the task retrieval is allowed                             |
| tasks.ignoredProcess     | []      | Processes to hide to the user. The list of available processes can be found [here](../../aias/aproc/aproc_doc/) |
| tasks.taskRetrievalTimer | 5000    | If one task is not in a final state, interval in ms before refreshing the tasks |
| tasks.processIcons       | {}      | Map to customize the icon used to represent a processId. The list of possible icons can be found [here](https://fonts.google.com/icons) |

If one of the mandatory field is not set, then `tasks.enabled` is set to false.

#### Example

```json
{
    "tasks": [
        {
            "enabled": true,
            "service": "AIAS APROC Service",
            "url": "https://localhost/aproc",
            "collections": ["main"],
            "processIcons": {
                "order": "satellite_alt"
            }
        }
    ]
}
```
