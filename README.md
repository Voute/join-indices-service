# join-indices-service
Example of request: { "source": [ { "index": "error", "join_field":"order_id", "query": { "match_all": {} }, "fields": ["order_id", "class"] }, { "index":"order", "join_field_unique":"order_id", "query": {"match_all": {}}, "fields":["order_id", "customer_id"] } ], "target": { "name": "joined_index_1" } }
