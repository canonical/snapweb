while inotifywait -r -e close_write templates; do scp -r -P 8022 templates ubuntu@localhost:/apps/snappyd/current/www/.; done &
while inotifywait -r -e close_write public; do scp -r -P 8022 public ubuntu@localhost:/apps/snappyd/current/www/.; done &
while inotifywait -r -e close_write mock-api; do scp -r -P 8022 mock-api ubuntu@localhost:/apps/snappyd/current/www/.; done
