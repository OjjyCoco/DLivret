import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DLivretModule = buildModule("DLivret", (m) => {
  const dlivret = m.contract("RouterSampleUSDe");

  return { dlivret };
});

export default DLivretModule;
