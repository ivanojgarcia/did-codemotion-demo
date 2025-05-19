import { expect } from "chai";
import { ethers } from "hardhat";
import { DIDRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DIDRegistry", function () {
  let didRegistry: DIDRegistry;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  
  const testDID = "did:example:123456789abcdefghi";
  const testDocHash = "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o";
  const updatedDocHash = "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn";

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Deploy contract
    const DIDRegistryFactory = await ethers.getContractFactory("DIDRegistry");
    didRegistry = await DIDRegistryFactory.deploy();
  });

  describe("DID Registration", function () {
    it("Should register a new DID", async function () {
      await didRegistry.connect(user1).registerDID(testDID, testDocHash);
      
      const didInfo = await didRegistry.getDIDInfo(testDID);
      expect(didInfo[0]).to.equal(user1.address); // controller
      expect(didInfo[1]).to.equal(testDocHash); // documentHash
      expect(didInfo[2]).to.be.gt(0); // lastUpdated
    });

    it("Should not allow registering the same DID twice", async function () {
      await didRegistry.connect(user1).registerDID(testDID, testDocHash);
      
      await expect(
        didRegistry.connect(user2).registerDID(testDID, updatedDocHash)
      ).to.be.revertedWith("DID already registered");
    });
  });

  describe("DID Document Updates", function () {
    beforeEach(async function () {
      await didRegistry.connect(user1).registerDID(testDID, testDocHash);
    });

    it("Should update the DID document hash", async function () {
      await didRegistry.connect(user1).updateDIDDocument(testDID, updatedDocHash);
      
      const didInfo = await didRegistry.getDIDInfo(testDID);
      expect(didInfo[1]).to.equal(updatedDocHash);
    });

    it("Should not allow unauthorized updates", async function () {
      await expect(
        didRegistry.connect(user2).updateDIDDocument(testDID, updatedDocHash)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("DID Controller Changes", function () {
    beforeEach(async function () {
      await didRegistry.connect(user1).registerDID(testDID, testDocHash);
    });

    it("Should change the DID controller", async function () {
      await didRegistry.connect(user1).changeController(testDID, user2.address);
      
      const didInfo = await didRegistry.getDIDInfo(testDID);
      expect(didInfo[0]).to.equal(user2.address);
    });

    it("Should not allow unauthorized controller changes", async function () {
      await expect(
        didRegistry.connect(user2).changeController(testDID, user2.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("DID Deactivation", function () {
    beforeEach(async function () {
      await didRegistry.connect(user1).registerDID(testDID, testDocHash);
    });

    it("Should deactivate a DID", async function () {
      await didRegistry.connect(user1).deactivateDID(testDID);
      
      const isActive = await didRegistry.isDIDActive(testDID);
      expect(isActive).to.be.false;
    });

    it("Should not allow unauthorized deactivation", async function () {
      await expect(
        didRegistry.connect(user2).deactivateDID(testDID)
      ).to.be.revertedWith("Not authorized");
    });
  });
}); 