SHELL := /bin/bash
.SILENT:
.PHONY: build


help:
	@grep -E '^[1-9a-zA-Z_-]+:.*?## .*$$|(^#--)' $(MAKEFILE_LIST) \
	| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m %-43s\033[0m %s\n", $$1, $$2}' \
	| sed -e 's/\[32m #-- /[33m/'

print-manifests: ## print out build target manifests
	@ls ./build/jiffyReader-* -t |grep -E '.(xpi|zip|crx)' | xargs -I {} sh -c 'unzip -p "{}" manifest.json | jq -r ". | \"Version: \(.version), Name: \(.name), Version Name: \(.version_name), Target: \(.target), Scope: \(.scope)  {}\""'

test-build-manifests: ## test build manifests
	@if make -s print-manifests | grep -E '(\W-\W|null)'; then exit 1; fi



test: ## test 
	@make test-build-manifests
	@declare -A counts ;\
	counts[expectedCount]=8 ;\
	counts[actualCount]=$$(make -s print-manifests | wc -l) ;\
	echo -e "\n$${!counts[@]}\n$${counts[@]}\n" | awk '{print $$1 "\t" $$2}'; \
	if [ $${counts[actualCount]} -ne $${counts[expectedCount]} ] ; then echo 'test failed'; exit 1; else echo 'passed'; fi # fail if unequal;



build: ## build latest using version in bump.txt
	@rm -rf build; 
	@pnpm gh:build;
	@echo "sleep 5 seconds"; seq 5 | xargs -I{} bash -c 'echo ".";sleep 1;'; 
	@pnpm gh:build:development
	@sleep 5;make -s test

extract: ## extract files
	rm -rf build/extracts
	mkdir build/extracts
	find build -name jiffyReader* | awk -F / '{print $$2}' | xargs -I{} sh -c "unzip build/{} -d build/extracts/{}"
	