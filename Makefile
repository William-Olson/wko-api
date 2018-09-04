default:
	make -s kill
	make -s build
	make -s run
	@echo 'All Done.'
	@make -s log-msg

run:
	docker-compose up -d es kibana db api haproxy
	docker-compose run --no-deps --rm db-ops npm start

build:
	node ./backend/versioner.js
	docker build -t willko/wko-api:latest ./backend

kill:
		@docker-compose kill || echo 'nothing to kill'
		@docker-compose rm -f || echo 'nothing to rm'

log-msg:
	@echo
	@echo 'Try running any of the following:'
	@echo
	@echo ' docker-compose logs -f api'
	@echo ' docker-compose logs -f db-ops'
	@echo ' docker-compose logs -f db'
	@echo ' docker-compose logs -f haproxy'
	@echo
