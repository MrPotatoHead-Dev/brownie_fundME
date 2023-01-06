from brownie import network, accounts, exceptions
from scripts.helpful_scripts import get_account, LOCAL_BLOCKCHAIN_ENVIRONMENTS
from scripts.deploy import deploy_fund_me
import pytest


def test_can_fund():
    account = get_account()
    fund_me = deploy_fund_me()
    # This is the currant entrance fee: 25000000000000001
    entrance_fee = fund_me.getEntranceFee() + 1000000
    tx = fund_me.fund({"from": account, "value": entrance_fee})
    tx.wait(1)
    assert fund_me.addressToFunded(account.address) == entrance_fee


def test_can_withdraw():
    account = get_account()
    fund_me = deploy_fund_me()
    tx2 = fund_me.withdraw({"from": account})
    tx2.wait(1)
    assert fund_me.addressToFunded(account.address) == 0


def test_only_owner_can_withdraw():
    account = get_account()
    # if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
    #    pytest.skip("only for local testing")
    fund_me = deploy_fund_me()
    bad_actor = accounts.add()

    fund_me.withdraw({"from": bad_actor})
