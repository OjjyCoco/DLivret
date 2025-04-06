const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { assert, expect } = require("chai");
const { ethers } = require("hardhat");
const helpers = require("@nomicfoundation/hardhat-network-helpers");


describe("DLivretPT Contract Tests", function () {

    let user: any, dlivretPT: any, dlivretTicket: any, owner: any, PT: any, USDe: any;
    const PT_ADDRESS = "0x917459337CaAC939D41d7493B3999f571D20D667";
    const USDe_ADDRESS = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
    // We are using a mainnet fork, the whale might not be a whale anymore
    const USDe_WHALE = "0x1f015774346BFfe5941703ea429CE8b0B6C875D6";

    async function deployContract() {
        const [owner, user] = await ethers.getSigners();
        const DLivretPT = await ethers.getContractFactory("DLivretPT");
        const dlivretPT = await DLivretPT.deploy(
            "0x9Df192D13D61609D1852461c4850595e1F56E714", // USDe Pendle Market address
            "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"  // USDe token address
        );

        const DLivretTicket = await ethers.getContractFactory("DLivretTicket");
        const dlivretTicket = await DLivretTicket.deploy();

        await dlivretTicket.connect(owner).addContractCaller(dlivretPT.target);

        console.log("Deployed DLivretPT at:", dlivretPT.target);
        console.log("Deployed DLivretTicket at:", dlivretTicket.target);


        return { dlivretPT, dlivretTicket, owner, user };
    }

    // Fixture when user is already funded with USDe and has approved DLivret contract
    async function readyToBuy(){        
        // Deploy contract and get signers
        const { dlivretPT, dlivretTicket, owner, user } = await loadFixture(deployContract);
    
        // Get contract instances
        PT = await ethers.getContractAt("IERC20", PT_ADDRESS);
        USDe = await ethers.getContractAt("IERC20", USDe_ADDRESS);

        console.log("PT at:", PT.target);
        console.log("USDe at:", USDe.target);

        // Impersonate whale account to fund the user
        await helpers.impersonateAccount(USDe_WHALE);
        const whaleSigner = await ethers.getSigner(USDe_WHALE);

        // Transfer USDe from whale to user
        const transferAmount = ethers.parseUnits("1000", 18);
        await USDe.connect(whaleSigner).transfer(user.address, transferAmount);

        // User approves DLivret contract
        await USDe.connect(user).approve(dlivretPT.target, transferAmount);

        return { dlivretPT, dlivretTicket, owner, user };
    }

    describe('Deployment DLivretPT', function () {
        it('Should deploy the SC', async function () {
            const { dlivretPT } = await loadFixture(deployContract);
            expect(dlivretPT.address).to.not.be.null;
        });
    });

    describe('setMarketAndToken', function () {
        it('Should correctly set market and token', async function () {
            const { dlivretPT, owner } = await loadFixture(deployContract);
            await dlivretPT.connect(owner).setMarketAndToken("0x9Df192D13D61609D1852461c4850595e1F56E714", "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3");
            const market = await dlivretPT.market();
            const tokenIn = await dlivretPT.tokenIn();
            expect(market).to.equal("0x9Df192D13D61609D1852461c4850595e1F56E714");
            expect(tokenIn).to.equal("0x4c9EDD5852cd905f086C759E8383e09bff1E68B3");
        });

        it('Should revert if market is expired', async function () {
            const { dlivretPT } = await loadFixture(deployContract);
            await expect(                  // expired marked address
                dlivretPT.setMarketAndToken("0xB451A36c8B6b2EAc77AD0737BA732818143A0E25", "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3")
            ).to.be.revertedWith("Market has already expired");
        });
    });

    describe('Buy PT', function () {

        it('Should buy PT', async function () {
            const { dlivretPT, user } = await loadFixture(readyToBuy);

            const buyAmount = ethers.parseUnits("1000", 18);
            
            // User buys PT
            const buyTx = await dlivretPT.connect(user).buyPT(buyAmount);

            const userBalanceAfter = await USDe.balanceOf(user.address);
            console.log(`User USDe balance after buying PT: ${ethers.formatUnits(userBalanceAfter, 18)} USDe`);
            expect(userBalanceAfter).to.equal(0);

            // Check PT balance of user
            const ptBalance = await PT.balanceOf(user.address);
            console.log(`User PT USDe balance after buying PT: ${ethers.formatUnits(ptBalance, 18)} PT USDe`);
            expect(ptBalance).to.be.gt(0);

        });

        it('Should increase the contract USDe balance', async function () {
            const { dlivretPT, user } = await loadFixture(readyToBuy);

            const buyAmount = ethers.parseUnits("1000", 18);
            
            // User buys PT
            const buyTx = await dlivretPT.connect(user).buyPT(buyAmount);
            
            const contractUSDeBalance = await USDe.balanceOf(dlivretPT.target);
            console.log(`Contract USDe balance after user buys PT: ${ethers.formatUnits(contractUSDeBalance, 18)} USDe`);
            
            const buyingFees = await dlivretPT.buyingFees();

            if (buyingFees < 1000){
                expect(contractUSDeBalance).to.be.gt(0);
            }
            else{
                expect(contractUSDeBalance).to.equal(0);
            }
        });

        it('Should add the week lotery ticket to the user balance', async function (){

            const { dlivretPT, dlivretTicket, owner, user } = await loadFixture(readyToBuy);
            const buyAmount = ethers.parseUnits("100", 18);
            // User buys PT
            const buyTx = await dlivretPT.connect(user).buyPT(buyAmount);
            await dlivretPT.connect(user).buyPT(buyAmount);

            // Get current block timestamp
            const latestBlock = await ethers.provider.getBlock('latest');
            const blockTimestamp = latestBlock.timestamp;

            // Calculate expected ticket ID (weekly)
            const expectedTicketId = Math.floor(blockTimestamp / (7 * 24 * 60 * 60));

            const userTicketBalance = await dlivretTicket.balanceOf(user.address, expectedTicketId);
            console.log("userTicketBalance: ", userTicketBalance)
            expect(userTicketBalance).to.equal(2);

        });

        it('Emit BoughtPT event', async function () {
            const { dlivretPT, user } = await loadFixture(readyToBuy);
            const buyAmount = ethers.parseUnits("1000", 18);
            const tx = await dlivretPT.connect(user).buyPT(buyAmount);
            const ptBalance = await PT.balanceOf(user.address);
            const amountSwaped = (buyAmount * BigInt(await dlivretPT.buyingFees())) / BigInt(1000);
            await expect(tx).to.emit(dlivretPT, "BoughtPT")
            .withArgs(user.address, amountSwaped, ptBalance);
        });

        it('Should revert if not enough USDe', async function () {
            const { dlivretPT, user } = await loadFixture(readyToBuy);

            const USDe = await ethers.getContractAt("IERC20", USDe_ADDRESS);
            const amountTooMuch = ethers.parseUnits("1500", 18);

            await USDe.connect(user).approve(dlivretPT.target, amountTooMuch);

            await expect(dlivretPT.connect(user).buyPT(amountTooMuch))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it('Should revert if not enough USDe allowance', async function () {
            const { dlivretPT, user } = await loadFixture(deployContract);

            const USDe = await ethers.getContractAt("IERC20", USDe_ADDRESS);
            const amountApproved = ethers.parseUnits("500", 18);
            const amountBuy = ethers.parseUnits("1000", 18);
            
            await USDe.connect(user).approve(dlivretPT.target, amountApproved);

            await expect(dlivretPT.connect(user).buyPT(amountBuy))
                .to.be.revertedWith("ERC20: insufficient allowance");
        });

        
    });

    describe('Sell PT USDe', function () {
    
        // Buying PT USDe
        beforeEach(async function () {
            // Deploy contract and get signers
            ({ dlivretPT, dlivretTicket, user } = await loadFixture(readyToBuy));

            const transferAmount = ethers.parseUnits("1000", 18);
            await dlivretPT.connect(user).buyPT(transferAmount);

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
            await PT.connect(user).approve(dlivretPT.target, ptBalance);
    
            // Sell PT
            const sellTx = await dlivretPT.connect(user).sellPT(ptBalance);
            const sellReceipt = await sellTx.wait();
    
            // Verify USDe balance after selling
            const usdeBalanceAfter = await USDe.balanceOf(user.address);
            console.log(`User USDe balance after selling PT: ${ethers.formatUnits(usdeBalanceAfter, 18)} USDe`);
    
            expect(usdeBalanceAfter).to.be.gt(0);
        });


        it('Should add the week lotery ticket to the user balance', async function (){
            const sellAmount = ethers.parseUnits("100", 18);

            // Approve PT transfer
            await PT.connect(user).approve(dlivretPT.target, sellAmount);

            // User sells PT
            await dlivretPT.connect(user).sellPT(sellAmount);
            // await dlivretPT.connect(user).sellPT(sellAmount);

            // Get current block timestamp
            const latestBlock = await ethers.provider.getBlock('latest');
            const blockTimestamp = latestBlock.timestamp;

            // Calculate expected ticket ID (weekly)
            const expectedTicketId = Math.floor(blockTimestamp / (7 * 24 * 60 * 60));

            const userTicketBalance = await dlivretTicket.balanceOf(user.address, expectedTicketId);
            console.log("userTicketBalance: ", userTicketBalance)
            expect(userTicketBalance).to.equal(1);

        });

        it('Should increase the contract PT USDe balance', async function () {

            const ptBalance = await PT.balanceOf(user.address);
    
            // Approve PT transfer
            await PT.connect(user).approve(dlivretPT.target, ptBalance);
    
            // Sell PT
            const sellTx = await dlivretPT.connect(user).sellPT(ptBalance);
            
            const contractPTUSDeBalance = await PT.balanceOf(dlivretPT.target);
            
            console.log(`Contract PT USDe balance after user buys PT: ${ethers.formatUnits(contractPTUSDeBalance, 18)} PT USDe`);
            
            const sellingFees = await dlivretPT.sellingFees();

            if (sellingFees < 1000){
                expect(contractPTUSDeBalance).to.be.gt(0);
            }
            else{
                expect(contractPTUSDeBalance).to.equal(0);
            }
        });

        it('Emit SoldPT event', async function () {
            const ptBalance = await PT.balanceOf(user.address);
            await PT.connect(user).approve(dlivretPT.target, ptBalance);
            const tx = await dlivretPT.connect(user).sellPT(ptBalance);
            const USDeBalance = await USDe.balanceOf(user.address);
            const amountSwaped = (ptBalance * BigInt(await dlivretPT.sellingFees())) / BigInt(1000);
            await expect(tx).to.emit(dlivretPT, "SoldPT")
            .withArgs(user.address, amountSwaped, USDeBalance);
        });

        it('Should revert if not enough PT USDe', async function () {
            const tooMuchAmount = ethers.parseUnits("1500", 18);

            await PT.connect(user).approve(dlivretPT.target, tooMuchAmount);

            await expect(dlivretPT.connect(user).sellPT(tooMuchAmount))
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });

        it('Should revert if not enough PT allowance', async function () {
            const { dlivretPT, user } = await loadFixture(deployContract);

            const amountApproved = ethers.parseUnits("500", 18);
            const amountSell = ethers.parseUnits("1000", 18);
            
            await PT.connect(user).approve(dlivretPT.target, amountApproved);

            await expect(dlivretPT.connect(user).sellPT(amountSell))
                .to.be.revertedWith("ERC20: insufficient allowance");
        });
    });


    describe('Withdraw Funds', function () {
        let buyingFees: any;
    
        beforeEach(async function () {
            ({ dlivretPT, user, owner } = await loadFixture(readyToBuy))
    
            // Fetch the current buyingFees value
            buyingFees = await dlivretPT.buyingFees();

            if (buyingFees >= ethers.parseUnits("1000", 18)) {
                // If buyingFees is >= 1000, skip this test
                this.skip();
            } else {
                // Buy PT to generate contract balance
                const buyAmount = ethers.parseUnits("1000", 18);
                await dlivretPT.connect(user).buyPT(buyAmount);
            }
        });
    
        it('Should allow owner to withdraw USDe funds', async function () {

            if (buyingFees >= BigInt(1000)) return;
    
            // Owner withdraws funds
            await dlivretPT.connect(owner).withdrawFunds(USDe_ADDRESS);
            // Check contract balance after withdrawal
            const contractBalanceAfter = await USDe.balanceOf(dlivretPT.target);
            expect(contractBalanceAfter).to.equal(0);
            console.log("Contract balance after withdraw: ", contractBalanceAfter)
        });
    
        it('Should revert if non-owner tries to withdraw', async function () {

            if (buyingFees >= BigInt(1000)) return;
    
            await expect(dlivretPT.connect(user).withdrawFunds(USDe_ADDRESS))
            .to.be.revertedWithCustomError(dlivretPT, "OwnableUnauthorizedAccount");
        });
    
        it('Should revert if withdrawing but no balance', async function () {
            
            if (buyingFees >= BigInt(1000)) return;
    
            // Withdraw once to empty the contract
            await dlivretPT.connect(owner).withdrawFunds(USDe_ADDRESS);
    
            // Attempt a second withdrawal, which should fail
            await expect(dlivretPT.connect(owner).withdrawFunds(USDe_ADDRESS))
                .to.be.revertedWith("No ERC20 to withdraw");
        });
    
        it('Should allow owner to withdraw ETH funds', async function () {

            if (buyingFees >= BigInt(1000)) return;
    
            // Send ETH to contract
            const ethDeposit = ethers.parseEther("1");
            await owner.sendTransaction({ to: dlivretPT.target, value: ethDeposit });
    
            // Check ETH balance before withdrawal
            const contractEthBalanceBefore = await ethers.provider.getBalance(dlivretPT.target);
            expect(contractEthBalanceBefore).to.equal(ethDeposit);
    
            // Owner withdraws ETH
            await dlivretPT.connect(owner).withdrawFunds(ethers.ZeroAddress)
    
            // Check ETH balance after withdrawal
            const contractEthBalanceAfter = await ethers.provider.getBalance(dlivretPT.target);
            expect(contractEthBalanceAfter).to.equal(0);
        });
    });


    describe('setFees', function () {

        it('Should allow the owner to set the fees', async function () {
            const { dlivretPT, owner } = await loadFixture(deployContract);
    
            const newBuyingFees = 800;
            const newSellingFees = 900;
    
            // Set new fees
            await dlivretPT.connect(owner).setFees(newBuyingFees, newSellingFees);
    
            // Fetch the updated fees
            const updatedBuyingFees = await dlivretPT.buyingFees();
            const updatedSellingFees = await dlivretPT.sellingFees();
    
            expect(updatedBuyingFees).to.equal(newBuyingFees);
            expect(updatedSellingFees).to.equal(newSellingFees);
        });
    
        it('Should emit FeesUpdated event when the fees are updated', async function () {
            const { dlivretPT, owner } = await loadFixture(deployContract);
    
            const newBuyingFees = 800;
            const newSellingFees = 900;
    
            // Expect FeesUpdated event
            await expect(dlivretPT.connect(owner).setFees(newBuyingFees, newSellingFees))
                .to.emit(dlivretPT, 'FeesUpdated')
                .withArgs(newBuyingFees, newSellingFees);
        });
    
        it('Should revert if non-owner tries to set the fees', async function () {
            const { dlivretPT, user } = await loadFixture(deployContract);
    
            const newBuyingFees = 800;
            const newSellingFees = 900;
    
            // Try setting fees as non-owner (should revert)
            await expect(dlivretPT.connect(user).setFees(newBuyingFees, newSellingFees))
                .to.be.revertedWithCustomError(dlivretPT, "OwnableUnauthorizedAccount");
        });
    
        it('Should revert if fees are greater than 1000', async function () {
            const { dlivretPT, owner } = await loadFixture(deployContract);
    
            const invalidBuyingFees = 1200; // Invalid value > 1000
            const invalidSellingFees = 1500; // Invalid value > 1000
    
            // Try setting invalid fees (should revert)
            await expect(dlivretPT.connect(owner).setFees(invalidBuyingFees, invalidSellingFees))
                .to.be.revertedWith("Invalid fee percentage");
        });
    });

});

describe("DLivretTicket Contract Tests", function () {
    let owner: any, user1: any, user2: any;
    let DLivretTicket, dlivretTicket: any;

    async function deployDLivretTicketContract() {
        const [owner, user1, user2] = await ethers.getSigners();

        const DLivretPT = await ethers.getContractFactory("DLivretPT");
        const dlivretPT = await DLivretPT.deploy(
            "0x9Df192D13D61609D1852461c4850595e1F56E714", // USDe Pendle Market address
            "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"  // USDe token address
        );
        
        const DLivretTicket = await ethers.getContractFactory("DLivretTicket");
        const dlivretTicket = await DLivretTicket.deploy();
        // Let's say user1 is part of allowedCallerContracts to do simple
        await dlivretTicket.connect(owner).addContractCaller(user1.address);

        return { dlivretPT, dlivretTicket, owner, user1, user2 };
    }

    describe("Deployment DLivretTicket", function () {
        it("Should deploy correctly and set the owner", async function () {
            const { dlivretTicket, owner } = await loadFixture(deployDLivretTicketContract);
            expect(await dlivretTicket.owner()).to.equal(owner.address);
        });
    });

    describe("addContractCaller and removeContractCaller", function () {
        it("Should allow owner to add a contract caller", async function () {
            const { dlivretTicket, owner, user2 } = await loadFixture(deployDLivretTicketContract);
            await expect(dlivretTicket.connect(owner).addContractCaller(user2.address))
                .to.emit(dlivretTicket, "CallerContractAdded")
                .withArgs(user2.address);
            await expect(await dlivretTicket.allowedCallerContracts(user2.address)).to.be.true;
        });

        it("Should allow owner to remove a contract caller", async function () {
            const { dlivretTicket, owner, user1 } = await loadFixture(deployDLivretTicketContract);
            await dlivretTicket.connect(owner).addContractCaller(user1.address)
            await expect(dlivretTicket.connect(owner).removeContractCaller(user1.address))
                .to.emit(dlivretTicket, "CallerContractRemoved")
                .withArgs(user1.address);
            expect(await dlivretTicket.allowedCallerContracts(user1.address)).to.be.false;
        });

        it("Should revert if not the owner on addContractCaller", async function () {
            const { dlivretTicket, user1, user2 } = await loadFixture(deployDLivretTicketContract);
            await expect(dlivretTicket.connect(user1).addContractCaller(user2.address))
                .to.be.revertedWithCustomError(dlivretTicket, "OwnableUnauthorizedAccount");
        });
        
        it("Should revert if not the owner on removeContractCaller", async function () {
            const { dlivretTicket, user1, user2, owner } = await loadFixture(deployDLivretTicketContract);
            await dlivretTicket.connect(owner).addContractCaller(user2.address);
            await expect(dlivretTicket.connect(user1).removeContractCaller(user2.address))
                .to.be.revertedWithCustomError(dlivretTicket, "OwnableUnauthorizedAccount");
        });
    });

    describe("Minting Tickets", function () {
        it("Should allow caller contract to mint tickets", async function () {
            const { dlivretTicket, user1 } = await loadFixture(deployDLivretTicketContract);

             // Calculate expected ticket ID (weekly)
             const latestBlock = await ethers.provider.getBlock('latest');
             const blockTimestamp = latestBlock.timestamp;
             const expectedTicketId = Math.floor(blockTimestamp / (7 * 24 * 60 * 60));

            const minting = dlivretTicket.connect(user1).mintTicket(user1.address);
            await expect(minting).to.emit(dlivretTicket, "TicketMinted").withArgs(user1.address, expectedTicketId, 1);
            const balance = await dlivretTicket.balanceOf(user1.address, expectedTicketId);
            await expect(balance).to.equal(1);
        });

        it("Should revert if non-caller contract tries to mint", async function () {
            const { dlivretTicket, user2 } = await loadFixture(deployDLivretTicketContract);
            const minting = dlivretTicket.connect(user2).mintTicket(user2.address)
            await expect(minting).to.be.revertedWith("Not an authorized caller contract");
        });
    });

    describe("Burning Tickets", function () {
        it("Should allow caller contract to burn tickets", async function () {
            const { dlivretTicket, user1 } = await loadFixture(deployDLivretTicketContract);
    
            // Mint ticket first
            const latestBlock = await ethers.provider.getBlock('latest');
            const blockTimestamp = latestBlock.timestamp;
            const expectedTicketId = Math.floor(blockTimestamp / (7 * 24 * 60 * 60));
            await dlivretTicket.connect(user1).mintTicket(user1.address);

            const burning = dlivretTicket.connect(user1).burnTicket(user1.address, 1);
            await expect(burning).to.emit(dlivretTicket, "TicketBurned").withArgs(user1.address, expectedTicketId, 1);
    
            const balanceAfter = await dlivretTicket.balanceOf(user1.address, expectedTicketId);
            expect(balanceAfter).to.equal(0);
        });
    
        it("Should revert if non-caller contract tries to burn", async function () {
            const { dlivretTicket, owner, user2 } = await loadFixture(deployDLivretTicketContract);

            await dlivretTicket.connect(owner).addContractCaller(owner.address);
            await dlivretTicket.connect(owner).mintTicket(user2.address);

            await expect(dlivretTicket.connect(user2).burnTicket(user2.address, 1))
                .to.be.revertedWith("Not an authorized caller contract");
        });
    });
    

    describe("Transferring Tickets", function () {
        beforeEach(async function () {
            const { dlivretTicket, owner, user1 } = await loadFixture(deployDLivretTicketContract);
            await dlivretTicket.connect(owner).addContractCaller(user1.address)
            await dlivretTicket.connect(user1).mintTicket(user1.address);
        });

        it("Should not allow safeTransferFrom tickets", async function () {
            const { dlivretTicket, user1, user2 } = await loadFixture(deployDLivretTicketContract);
            // Calculate expected ticket ID (weekly)
            const latestBlock = await ethers.provider.getBlock('latest');
            const blockTimestamp = latestBlock.timestamp;
            const expectedTicketId = Math.floor(blockTimestamp / (7 * 24 * 60 * 60));
            await expect(
                dlivretTicket.connect(user1).safeTransferFrom(user1.address, user2.address, expectedTicketId, 1, "0x")
            ).to.be.revertedWith("Transfers disabled");
        });

        it("Should not allow safeBatchTransferFrom tickets", async function () {
            const { dlivretTicket, user1, user2 } = await loadFixture(deployDLivretTicketContract);
            // Calculate expected ticket ID (weekly)
            const latestBlock = await ethers.provider.getBlock('latest');
            const blockTimestamp = latestBlock.timestamp;
            const expectedTicketId = Math.floor(blockTimestamp / (7 * 24 * 60 * 60));
            await expect(
                dlivretTicket.connect(user1).safeBatchTransferFrom(user1.address, user2.address, [expectedTicketId], [1], "0x")
            ).to.be.revertedWith("Transfers disabled");
        });

    });

});

