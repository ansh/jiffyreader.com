remote?=origin
tag?=no-tag
CONTINUE=-1

tag:
	@echo "making tags: [$(tag), $(tag)-development]"
	# @if [ "$(CONTINUE)" -eq "-1" ]; then "$$(read -p "press any key to continue")"; fi
	# @if [ "$(CONTINUE)" -eq "0" ]; then		echo "exiting";		EXIT 1;	fi
	@git tag "$(tag)";
	@git tag "$(tag)-development"
	@git tag | grep -e "$(tag)"

push-tag:
	@echo "branch:$(remote) tag:[$(tag), $(tag)-development]"
	@git push "$(remote)" "$(tag)"
	@git push "$(remote)" "$(tag)-development"