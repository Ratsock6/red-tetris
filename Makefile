CLIENT_DIR := client
SERVER_DIR := server
RM := rm -rf

.PHONY: all install dev dev-client dev-server build test test-coverage clean fclean re

all: install

install:
	cd $(CLIENT_DIR) && npm install
	cd $(SERVER_DIR) && npm install

dev:
	npm run dev

dev-client:
	cd $(CLIENT_DIR) && npm run dev

dev-server:
	cd $(SERVER_DIR) && npm start

build:
	cd $(CLIENT_DIR) && npm run build

test:
	cd $(CLIENT_DIR) && npm test

test-coverage:
	cd $(CLIENT_DIR) && npm run test:coverage

clean:
	$(RM) $(CLIENT_DIR)/dist

fclean: clean
	$(RM) $(CLIENT_DIR)/node_modules
	$(RM) $(SERVER_DIR)/node_modules
	$(RM) node_modules

re: fclean all
