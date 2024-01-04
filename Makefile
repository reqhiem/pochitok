.phony: pip-compile
pip-compile:
	@echo "Compiling requirements..."
	- cd ./server/requirements && pip-compile requirements.in