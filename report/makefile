build_pdf:
	xelatex -interaction=nonstopmode -halt-on-error main.tex || true
	xelatex -interaction=nonstopmode -halt-on-error main.tex || true

install:
	for pkg in zref-abspage \
		algorithm2e xcolor rotating; do \
			echo ">>> Installing $$pkg ..."; \
			tlmgr --usermode install $$pkg || echo "!!! Failed to install $$pkg, skipping..."; \
	done
