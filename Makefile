all: snapweb www/public

.PHONY: deps
deps:
	go get launchpad.net/godeps
	godeps -u dependencies.tsv
	npm install

snapweb: deps
	go build ./cmd/snapweb

www/public: deps
	gulp

install:
	install snapweb $(DESTDIR)/
	mkdir $(DESTDIR)/www
	cp -r www/public www/templates $(DESTDIR)/www
