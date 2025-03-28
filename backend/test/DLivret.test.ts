const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("RouterSampleUSDe Contract Tests", function () {

    let user: any, dlivret: any, owner: any, PT: any, USDe: any;
    const PT_ADDRESS = "0x917459337CaAC939D41d7493B3999f571D20D667";
    const USDe_ADDRESS = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
    // We are using a mainnet fork, the whale might not be a whale anymore
    const USDe_WHALE = "0x1f015774346BFfe5941703ea429CE8b0B6C875D6";

    const ERC20_ABI = [
        "function approve(address spender, uint256 amount) returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address recipient, uint256 amount) returns (bool)"
    ];

    async function deployContract() {
        const [owner, user] = await ethers.getSigners();
        const DLivret = await ethers.getContractFactory("RouterSampleUSDe");
        const dlivret = await DLivret.deploy(
            "0x9Df192D13D61609D1852461c4850595e1F56E714", // USDe Pendle Market address
            "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"  // USDe token address
        );

        return { dlivret, owner, user };
    }

    // fixture when user is already funded with USDe and has approved DLivret contract
    async function readyToBuy(){        
        // Deploy contract and get signers
        const { dlivret, owner, user } = await loadFixture(deployContract);
    
        // Get contract instances
        PT = await ethers.getContractAt(ERC20_ABI, PT_ADDRESS);
        USDe = await ethers.getContractAt(ERC20_ABI, USDe_ADDRESS);

        // Impersonate whale account to fund the user
        await helpers.impersonateAccount(USDe_WHALE);
        const whaleSigner = await ethers.getSigner(USDe_WHALE);

        // Transfer USDe from whale to user
        const transferAmount = ethers.parseUnits("1000", 18);
        await USDe.connect(whaleSigner).transfer(user.address, transferAmount);

        // User approves DLivret contract
        await USDe.connect(user).approve(dlivret.target, transferAmount);

        return { dlivret, owner, user };
    }

    describe('Deployment', function () {
        it('Should deploy the SC', async function () {
            const { dlivret } = await loadFixture(deployContract);
            expect(dlivret.address).to.not.be.null;
        });
    });

    describe('setMarketAndToken', function () {
        it('Should correctly set market and token', async function () {
            const { dlivret } = await loadFixture(deployContract);
            const market = await dlivret.market();
            const tokenIn = await dlivret.tokenIn();
            expect(market).to.equal("0x9Df192D13D61609D1852461c4850595e1F56E714");
            expect(tokenIn).to.equal("0x4c9EDD5852cd905f086C759E8383e09bff1E68B3");
        });

        it('Should revert if market is expired', async function () {
            const { dlivret } = await loadFixture(deployContract);
            await expect(                  // expired marked address
                dlivret.setMarketAndToken("0xB451A36c8B6b2EAc77AD0737BA732818143A0E25", "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3")
            ).to.be.revertedWith("Market has already expired");
        });
    });

    describe('Buy PT', function () {

        it('Should buy PT', async function () {
            const { dlivret, owner, user } = await loadFixture(readyToBuy);

            const buyAmount = ethers.parseUnits("1000", 18);
            
            // User buys PT
            const buyTx = await dlivret.connect(user).buyPT(buyAmount);

            const userBalanceAfter = await USDe.balanceOf(user.address);
            console.log(`User USDe balance after buying PT: ${ethers.formatUnits(userBalanceAfter, 18)} USDe`);
            expect(userBalanceAfter).to.equal(0);

            // Check PT balance of user
            const ptBalance = await PT.balanceOf(user.address);
            console.log(`User PT USDe balance after buying PT: ${ethers.formatUnits(ptBalance, 18)} PT USDe`);
            expect(ptBalance).to.be.gt(0);
        });

        it('Should increase the contract USDe balance', async function () {
            const { dlivret, owner, user } = await loadFixture(readyToBuy);

            const buyAmount = ethers.parseUnits("1000", 18);
            
            // User buys PT
            const buyTx = await dlivret.connect(user).buyPT(buyAmount);
            
            const contractUSDeBalance = await USDe.balanceOf(dlivret.target);
            console.log(`Contract USDe balance after user buys PT: ${ethers.formatUnits(contractUSDeBalance, 18)} USDe`);
            expect(contractUSDeBalance).to.be.gt(0);
        });

        it('Emit BoughtPT event', async function () {
            const { dlivret, user } = await loadFixture(readyToBuy);
            const buyAmount = ethers.parseUnits("1000", 18);
            const tx = await dlivret.connect(user).buyPT(buyAmount);
            const ptBalance = await PT.balanceOf(user.address);
            const amountSwaped = (buyAmount * BigInt(997)) / BigInt(1000); // Ensure BigInt arithmetic
            await expect(tx).to.emit(dlivret, "BoughtPT")
            .withArgs(user.address, amountSwaped, ptBalance);
        });

        it('Should revert if not enough USDe', async function () {
            const { dlivret, user } = await loadFixture(readyToBuy);

            const USDe = await ethers.getContractAt(ERC20_ABI, USDe_ADDRESS);
            const amountTooMuch = ethers.parseUnits("1500", 18);

            await USDe.connect(user).approve(dlivret.target, amountTooMuch);

            await expect(dlivret.connect(user).buyPT(amountTooMuch))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it('Should revert if not enough USDe allowance', async function () {
            const { dlivret, user } = await loadFixture(deployContract);

            const USDe = await ethers.getContractAt(ERC20_ABI, USDe_ADDRESS);
            const amountApproved = ethers.parseUnits("500", 18);
            const amountBuy = ethers.parseUnits("1000", 18);
            
            await USDe.connect(user).approve(dlivret.target, amountApproved);

            await expect(dlivret.connect(user).buyPT(amountBuy))
                .to.be.revertedWith("ERC20: insufficient allowance");
        });

        
    });

    describe('Sell PT USDe', function () {
    
        // Buying PT USDe
        beforeEach(async function () {
            // Deploy contract and get signers
            ({ dlivret, user } = await loadFixture(readyToBuy));

            const transferAmount = ethers.parseUnits("1000", 18);
            await dlivret.connect(user).buyPT(transferAmount);

            // Advance time by days
            const days = 100;
            await helpers.time.increase(days * 24 * 60 * 60);
        });
    
        it('Should sell PT USDe', async function () {

            // Check PT balance before selling
            const ptBalance = await PT.balanceOf(user.address);
            expect(ptBalance).to.be.gt(0);
            console.log(`User PT USDe balance before selling PT: ${ethers.formatUnits(ptBalance, 18)} PT USDe`);

            const usdeBalanceBefore = await USDe.balanceOf(user.address);
            console.log(`User USDe balance before selling PT: ${ethers.formatUnits(usdeBalanceBefore, 18)} USDe`);
    
            // Approve PT transfer
            await PT.connect(user).approve(dlivret.target, ptBalance);
    
            // Sell PT
            const sellTx = await dlivret.connect(user).sellPT(ptBalance);
            const sellReceipt = await sellTx.wait();
    
            // Verify USDe balance after selling
            const usdeBalanceAfter = await USDe.balanceOf(user.address);
            console.log(`User USDe balance after selling PT: ${ethers.formatUnits(usdeBalanceAfter, 18)} USDe`);
    
            expect(usdeBalanceAfter).to.be.gt(0);
        });

        it('Should increase the contract PT USDe balance', async function () {

            const ptBalance = await PT.balanceOf(user.address);
    
            // Approve PT transfer
            await PT.connect(user).approve(dlivret.target, ptBalance);
    
            // Sell PT
            const sellTx = await dlivret.connect(user).sellPT(ptBalance);
            
            const contractPTUSDeBalance = await PT.balanceOf(dlivret.target);
            console.log(`Contract PT USDe balance after user buys PT: ${ethers.formatUnits(contractPTUSDeBalance, 18)} PT USDe`);
            expect(contractPTUSDeBalance).to.be.gt(0);
        });

        it('Emit SoldPT event', async function () {
            const ptBalance = await PT.balanceOf(user.address);
            await PT.connect(user).approve(dlivret.target, ptBalance);
            const tx = await dlivret.connect(user).sellPT(ptBalance);
            const USDeBalance = await USDe.balanceOf(user.address);
            const amountSwaped = (ptBalance * BigInt(999)) / BigInt(1000); // Ensure BigInt arithmetic
            await expect(tx).to.emit(dlivret, "SoldPT")
            .withArgs(user.address, amountSwaped, USDeBalance);
        });

        it('Should revert if not enough PT USDe', async function () {
            const tooMuchAmount = ethers.parseUnits("1500", 18);

            await PT.connect(user).approve(dlivret.target, tooMuchAmount);

            await expect(dlivret.connect(user).sellPT(tooMuchAmount))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it('Should revert if not enough PT allowance', async function () {
            const { dlivret, user } = await loadFixture(deployContract);

            const amountApproved = ethers.parseUnits("500", 18);
            const amountSell = ethers.parseUnits("1000", 18);
            
            await PT.connect(user).approve(dlivret.target, amountApproved);

            await expect(dlivret.connect(user).sellPT(amountSell))
                .to.be.revertedWith("ERC20: insufficient allowance");
        });
    });
    

});
