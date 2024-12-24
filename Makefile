help:
	@grep -E '^[1-9a-zA-Z_-]+:.*?## .*$$|(^#--)' $(MAKEFILE_LIST) \
	| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m %-43s\033[0m %s\n", $$1, $$2}' \
	| sed -e 's/\[32m #-- /[33m/'

print-manifests: ## print out build target manifests
	@ls ./build/jiffyReader-* |grep -E '.(xpi|zip|crx)' | xargs -I {} sh -c 'unzip -p "{}" manifest.json | jq -r ". | \"Version: \(.version), Name: \(.name), Version Name: \(.version_name), Target: \(.target), Scope: \(.scope)  \""'

test-build-manifests: ## test build manifests
	@if make print-manifests | grep -E '(\W-\W|null)'; then exit 1; fi


test: ## test 
	@make test-build-manifests


_build: ## build all targets
	@make build@latest


build@latest: ## build latest using version in bump.txt
	. action.sh
	@make test