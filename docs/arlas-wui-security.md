# ARLAS-wui security

This page describes how to configure ARLAS-wui in order to add an **access control** to the application.

## Authentication

Arlas-wui is compliant with an identity service provider (like https://auth0.com/) which respects an [OAuth 2.0 PKCE : RFC 7636: Proof Key for Code Exchange](https://tools.ietf.org/html/rfc7636) protocol.

To configure the application you need to set some parameters in the settings.yaml file.

Below is an example of a **working** configuration with an Auth0 service. The configuration must be adapted according to the identity service provider.


| Auhtentication property | Definition | Working value |
| --- | --- | --- |
|authentication.use_authent | Defines whether to be authenticated to Identity | `true`|
|authentication.force_connect | When authentication is enabled, this option forces to be connected to Identity Provider at application bootstrap | `true` |
|authentication.use_discovery | Defines whether we use Identity Provider document discovery service | `true` |
|authentication.scope | The requested scopes | `openid profile` |
| authentication.require_https | Defines whether https is required | `true` |
| authentication.response_type | Response type values | `code token id_token` |
| authentication.silent_refresh_timeout | Timeout for silent refresh | `10000` |
| authentication.timeout_factor | Defines when the token_timeout event should be raised. If you set this to the default value 0.75, the event is triggered after 75% of the token's life time. | `0.75` |
| authentication.session_checks_enabled | If true, the app will try to check whether the user is still logged in on a regular basis as described | `false` |  
| authentication.clear_hash_after_login | Defines whether to clear the hash fragment in url after logging in |  `true` |
| authentication.disable_at_hash_check | This property has been introduced to disable at_hash checks and is indented for Identity Provider that does not deliver an at_hash EVEN THOUGH its recommended by the OIDC specs. |  `false` |
| authentication.show_debug_information | Defines whether to display debug log in browser console | `false` |
| authentication.storage | Defines the kind of storage : localstorage or sessionstorage | `sessionstorage` |
| authentication.issuer | The issuer's uri | `CHANGE_ME` |
| authentication.client_id | The client's id as registered with the identity provider server | `CHANGE_ME`



