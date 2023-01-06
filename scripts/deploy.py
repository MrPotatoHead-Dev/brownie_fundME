from brownie import FundMe, network, config, MockV3Aggregator
from scripts.helpful_scripts import (
    get_account,
    deploy_mocks,
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
)


def deploy_fund_me():
    account = get_account()
    print(f"This is the account {get_account()}")
    print(f"This is the network {network.show_active()}")
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        price_feed_address = config["networks"][network.show_active()][
            "eth_usd_price_feed"
        ]
    else:  # deploy mocks
        deploy_mocks()
        price_feed_address = MockV3Aggregator[-1].address

    print(f"this is the price feed addres: {price_feed_address}")

    fund_me = FundMe.deploy(
        price_feed_address,
        {"from": account},
        publish_source=config["networks"][network.show_active()].get("verify"),
    )

    print(f"contract deployed to {fund_me.address}")
    print(fund_me)
    return fund_me


def main():
    deploy_fund_me()
