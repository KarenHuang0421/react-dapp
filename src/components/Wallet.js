import { useEffect, useState } from "react";
import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/config";

const Wallet = () => {
  const [account, setAccount] = useState();

  useEffect(() => {
    ethEnabled();
  }, []);

  const ethEnabled = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      window.ethereum?.enable();

      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    }
  };

  const handleTransaction = () => {
    // const web3 = new Web3(window.ethereum);
    // const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

    // if (account?.length) {
    //   contract.methods
    //     .store(0)
    //     .send({ from: account })
    //     .on("transactionHash", function (hash) {
    //       console.log({ hash });
    //     })
    //     .on("receipt", function (receipt) {
    //       console.log({ receipt });
    //     })
    //     .on("confirmation", function (confirmationNumber, receipt) {
    //       console.log({ confirmationNumber, receipt });
    //     })
    //     .on("error", function (error, receipt) {
    //       console.log({ error, receipt });
    //     });
    //   console.log(contract);
    // }
  };

  return (
    <div style={{ paddingTop: " 20vh" }}>
      My account: <strong> {account}</strong>
      {account && <div style={{ padding: "100px" }}>
        <button onClick={handleTransaction}>交易</button>
      </div>}
    </div>
  );
};

export default Wallet;
