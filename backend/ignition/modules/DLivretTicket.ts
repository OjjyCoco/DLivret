import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DLivretTicketModule = buildModule("DLivretTicket", (m) => {
  const dlivret = m.contract("DLivretTicket");

  return { dlivret };
});

export default DLivretTicketModule;
