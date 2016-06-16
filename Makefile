all: snapweb

.PHONY: deps
deps:
	go get launchpad.net/godeps
	godeps -u dependencies.tsv

snapweb: deps
	go build ./cmd/snapweb

install:
	install snapweb $(DESTDIR)/
