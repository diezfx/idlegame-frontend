fmt:
    prettier --write .
proto:
    buf generate
lint:
    prettier --check . && eslint .