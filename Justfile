fmt:
    npx prettier --write .
proto:
    buf generate

lint: 
    npx prettier --check . && npx eslint .
lint-fix: 
    npx eslint --fix .
