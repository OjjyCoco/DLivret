import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DLivretPTModule = buildModule("DLivretPT", (m) => {
  const dlivret = m.contract("DLivretPT", ["0x9Df192D13D61609D1852461c4850595e1F56E714","0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"]);

  return { dlivret };
});

export default DLivretPTModule;
