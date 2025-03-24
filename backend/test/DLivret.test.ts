const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("DLivret tests", function () {
    async function deployContract() {
        const [owner, user] = await ethers.getSigners();
        const DLivret = await ethers.getContractFactory("RouterSampleUSDe");
        const dlivret = await DLivret.deploy(
            "0x9Df192D13D61609D1852461c4850595e1F56E714", // Market address
            "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"  // USDe address
        );

        return { dlivret, owner, user };
    }

    describe('Deployment', function () {
        it('Should deploy the SC', async function () {
            const { dlivret } = await loadFixture(deployContract);
        });
    });

    describe('Buy and Sell', function () {
        before(function () {
            // runs once before the first test in this block
          });

        it('Should get USDe from a whale, user approves, buy PT, advance in time, sell PT', async function () {
            const { dlivret, user } = await loadFixture(deployContract);

            const USDe_ADDRESS = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
            const PT_ADDRESS = "0x917459337CaAC939D41d7493B3999f571D20D667";
            const USDe_WHALE = "0x1f015774346BFfe5941703ea429CE8b0B6C875D6";

            const ERC20_ABI = [
                "function balanceOf(address) view returns (uint256)",
                "function transfer(address to, uint256 amount) returns (bool)",
                "function approve(address spender, uint256 amount) returns (bool)"
            ];
            const USDe = await ethers.getContractAt(ERC20_ABI, USDe_ADDRESS);
            const PT = await ethers.getContractAt(ERC20_ABI, PT_ADDRESS);

            // Impersonate whale
            await helpers.impersonateAccount(USDe_WHALE);
            const whaleSigner = await ethers.getSigner(USDe_WHALE);

            // Whale balance
            const whaleBalance = await USDe.balanceOf(USDe_WHALE);
            console.log(`Whale USDe balance: ${ethers.formatUnits(whaleBalance, 18)} USDe`);

            // Whale transfers to user
            const transferAmount = ethers.parseUnits("666", 18);
            await USDe.connect(whaleSigner).transfer(user.address, transferAmount);

            // Check user USDe balance
            const userBalance = await USDe.balanceOf(user.address);
            console.log(`User USDe balance after receiving: ${ethers.formatUnits(userBalance, 18)} USDe`);
            expect(userBalance).to.equal(transferAmount);

            // User approves your contract to spend USDe
            await USDe.connect(user).approve(dlivret.target, transferAmount);
            console.log(`User approved Dlivret to spend USDe`);

            // User buys PT
            const buyTx = await dlivret.connect(user).buyPT(transferAmount);
            const buyReceipt = await buyTx.wait();
            console.log(`Gas used to buyPT: ${buyReceipt.gasUsed.toString()}`);

            // Check user's PT balance
            const ptBalance = await PT.balanceOf(user.address);
            console.log(`User PT balance after buy: ${ethers.formatUnits(ptBalance, 18)} PT`);
            expect(ptBalance).to.be.gt(0);

            // Advance time by 125 days
            const days = 20;
            await helpers.time.increase(days * 24 * 60 * 60);
            console.log(`Advanced time by ${days} days`);

            // User approves Dlivret to spend their PT
            await PT.connect(user).approve(dlivret.target, ptBalance);
            console.log(`User approved Dlivret to spend PT`);

            // User sells PT
            const sellTx = await dlivret.connect(user).sellPT(ptBalance);
            const sellReceipt = await sellTx.wait();
            console.log(`Gas used to sellPT: ${sellReceipt.gasUsed.toString()}`);

            // Check user's USDe balance after selling PT
            const usdeBalanceAfter = await USDe.balanceOf(user.address);
            console.log(`User USDe balance after selling PT: ${ethers.formatUnits(usdeBalanceAfter, 18)} USDe`);

            // Expect balance after selling to be more than initial amount
            expect(usdeBalanceAfter).to.be.gt(transferAmount);
        });
    });
});
