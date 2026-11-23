# Monitoring

An Error Boundary displays a fallback screen and writes unexpected component errors to the console. This is local logging only, not centralized monitoring. In production track: (1) checkout failure rate by HTTP status (especially 409 and 500); (2) product-search latency and error rate; (3) frontend uncaught exceptions by release and route. Never log credentials, tokens or payment data.
