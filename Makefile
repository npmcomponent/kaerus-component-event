NAME = event
TARGET = ./build
BINDIR = ./node_modules/.bin
PHANTOMJS = $(BINDIR)/phantomjs
MOCHA_PHANTOMJS = @$(BINDIR)/mocha-phantomjs
COMPONENT = @$(BINDIR)/component

all: build

build: dependencies standalone
	@echo "Building component "
	$(COMPONENT) build -v -o $(TARGET)

standalone: 
	@echo "Building standalone version"
	$(COMPONENT) build -v -o $(TARGET) -n $(NAME) -s $(NAME)

dependencies:
	$(COMPONENT) install -v	

test: build
	@echo "Running tests for browser"
	$(MOCHA_PHANTOMJS) -p $(PHANTOMJS) test/runner.html

distclean:
	@echo "Cleaning upp files"
	@rm -rf ./node_modules
	@rm -rf ./components
	@rm -rf ./build


.PHONY: all test