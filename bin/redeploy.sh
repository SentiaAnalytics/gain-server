curl -u "${CATTLE_ACCESS_KEY}:${CATTLE_SECRET_KEY}" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{"rollingRestartStrategy":""}' \
'http://rancher.sentia.ai:8080/v2-beta/projects/1a5/services/1s8/?action=restart'
