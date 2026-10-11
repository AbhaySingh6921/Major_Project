.PHONY: deploy test build fmt
include .env
export
deploy:
	forge script script/Deploy.s.sol:Deploy \
		--rpc-url $(SEPOLIA_RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast

test:
	forge test

build:
	forge build

fmt:
	forge fmt