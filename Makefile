remote?=origin
tag?=no-tag
CONTINUE=-1
add_min?=0
mut_min?=1
add_maj?=0
mut_maj?=1
add_patch?=0
mut_patch?=1
commit?=1
newversion?=
no_tag?=0

 help:
	@grep -E '^[1-9a-zA-Z_-]+:.*?## .*$$|(^#--)' $(MAKEFILE_LIST) \
	| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m %-43s\033[0m %s\n", $$1, $$2}' \
	| sed -e 's/\[32m #-- /[33m/'


tag: ## make a tag, pass tag=some_tag
	@echo "making tags: [$(tag)]"
	@if [ -n "$(tag)" ] && [ "$(tag)" != "no-tag" ]; then  \
		git tag "$(tag)"; \
		git tag | grep -e "$(tag)"; \
	fi

push-tag: ## push a tag from bump.txt to remote, pass tag=different-tag to use a different tag, pass remote=origin to use a different remote
	@tag="$$(make read-bump -s)"; \
	echo "branch:$(remote) tag:[$${tag}]"; \
	git push "$(remote)" "$${tag}"; \

tag-bump: ## make a tag using the version in bump.txt
	@make tag tag="$$(make read-bump -s)"

tag-bump-undo: ## delete the tag that matches the bump.txt version
	@git tag -d "$$(make read-bump -s)"

commit-bump: ## commit bump.txt if it has changed, pass commit=0 to not commit, commit=1 to commit
	@newversion="$$(make read-bump)"; \
	lastCommit="$$(make read-last-commit)"; \
	if [ "$(commit)" = "1" ] && [ -n "$${newversion}" ]; then  \
		git add bump.txt;  \
		git commit -m "Chore(commit-bump): new bump target: $${newversion}"; \
	fi

read-last-commit: ## output the last commit message if it was a bump commit
	@echo "$$(git log --oneline -n1 | grep "commit-bump")"

commit-bump-undo: ## undo last commit if it was a bump commit else do nothing
	@lastCommit="$$(make read-last-commit)"; \
	echo "$${lastCommit}"; \
	if git log --oneline -n1 | grep -e "commit-bump"; then\
		git reset HEAD~1; \
	fi

write-version: ## write version to bump.txt and commit, pass commit=0 to not commit, commit=1 to commit
	@newversion="$(major).$(minor).$(patch)"; \
	echo "$${newversion}" > bump.txt; \
	make commit-bump newversion="$(newversion)"

bump-patch: ## bump the patch verison
	@version="$$(add_patch=1 make read-version)"; echo "bumping patch $${version}"; \
	make write-version $${version}

bump-minor: ## bump the minor verison
	@version="$$(add_min=1 mut_patch=0 make read-version)"; echo "bumping patch $${version}"; \
	make write-version $${version}

bump-major: ## bump the major verison
	@version="$$(add_maj=1 mut_min=0 mut_patch=0 make read-version)"; echo "bumping patch $${version}"; \
	make write-version $${version}

bump: ## bump patch version with a git tag , input no_tag=1 to not tag, no_tag=0 to tag
	@make bump-patch;
	@if [ "$(no_tag)" = "0" ]; then \
		make tag-bump; \
	fi
		
check-bump: ## output the tag that matches the bump.txt version
	@git tag | grep "$$(make read-bump)"

read-version: ## read version from bump.txt
	@awk -F . '{print "major="($$1 + $(add_maj)) * $(mut_maj) " minor="($$2 + $(add_min)) * $(mut_min) " patch="($$3 + $(add_patch)) * $(mut_patch)}' bump.txt

version:
	@echo "$$(make read-version)"; 
	


read-bump:
	@cat bump.txt

	
build@latest: ## build latest using version in bump.txt
	. action.sh