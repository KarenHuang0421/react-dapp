import { useEffect, useMemo, useState } from "react";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/config";
import { getOrderInfo, postOrderTransResult } from "../api";
import SuccessSvg from "../assets/success.svg";
import { Combobox } from "@headlessui/react";
import Web3 from "web3";

const Warn = ({ msg }) => {
  return (
    <div className="bg-red-200 text-red-700 font-bold rounded-md p-2 flex flex-row mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-6 h-6 mr-2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
      <span>{msg}</span>
    </div>
  );
};

const Success = () => {
  return (
    <div className="flex flex-col items-center pt-10">
      <img src={SuccessSvg} className="w-40" />
      <span className="text-emerald-500 font-bold text-2xl mt-6" >交易成功</span>
    </div>
  );
};

const Wallet = () => {
  // const [account, setAccount] = useState();
  // const [balance, setBalance] = useState();
  const [orderNo, setOrderNo] = useState();
  const [url, setUrl] = useState();
  const [address, setAddress] = useState();
  const [hash, setHash] = useState();
  const [error, setError] = useState();
  const [success, setSuccess] = useState();

  useEffect(() => {
    getOrder();
    // ethEnabled();
  }, []);

  useEffect(() => {
    if (!orderNo) return;

    getOrderInfo(orderNo)
      .then((res) => {
        if (!res.data.success) throw res.data.msg;

        let data = res.data.data;
        let url = data?.deep_link_url;
        if (url) {
          setUrl(url);
          handleOpenUrl(url);
        }
      })
      .catch((e) => {
        setUrl(null);
        setError((e || "").toString());
      });
  }, [orderNo]);

  const getOrder = () => {
    let query = window.location.search;
    let arr = (query || "").replace("?", "").split("&");
    arr.map((e) => {
      let item = (e || "").split("=");
      if (item[0] === "order_no") {
        setOrderNo(item[1]);
      }
    });
  };

  const disabled = useMemo(() => {
    if (!address || !hash) return true;

    return address?.length === 0 || hash?.length === 0;
  }, [address, hash]);

  // const ethEnabled = async () => {
  //   if (window.ethereum) {
  //     const web3 = new Web3(window.ethereum);
  //     window.ethereum?.enable();

  //     const accounts = await web3.eth.getAccounts();
  //     setAccount(accounts[0]);

  //     const balances = await web3.eth.getBalance(accounts[0]);
  //     if (balances) {
  //       const b = web3.utils.fromWei(balances, "wei");
  //       setBalance(b);
  //     }

  //     //   const cb = await web3.eth.getBlock('latest')
  //   }
  // };

  // const handleTransaction = async () => {
  //   const web3 = new Web3(window.ethereum);
  //   const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
  //   // console.log(web3.eth)
  //   // const signature = await web3.eth.personal.sign('hi', account)
  //   // console.log(signature)

  //   if (account?.length) {
  //     contract.methods
  //       .store(20)
  //       .send({ from: "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4" })
  //       .on("transactionHash", function (hash) {
  //         console.log({ hash });
  //       })
  //       .on("receipt", function (receipt) {
  //         console.log({ receipt });
  //       })
  //       .on("confirmation", function (confirmationNumber, receipt) {
  //         console.log({ confirmationNumber, receipt });
  //       })
  //       .on("error", function (error, receipt) {
  //         console.log({ error, receipt });
  //       });
  //   }
  // };

  const handleOpenUrl = (val) => window.open(val);

  const handleSubmit = () => {
    let payload = {
      order_no: orderNo,
      pay_address: address,
      transaction_hash: hash,
    };
    postOrderTransResult(payload)
      .then((res) => {
        if (!res.data.success) throw res.data.msg;

        let data = res.data.data;
        let url = data?.return_url;
        if (url) handleOpenUrl(url);
        setSuccess(true);
      })
      .catch((e) => {
        setError((e || "").toString());
      });
  };

  return (
    <div className="pt-10 px-5 text-left flex flex-col max-w-md m-auto">
      <div className="flex flex-row items-end justify-between mt-4 mb-10">
        <div className="flex flex-col">
          <span className="text-white text-xl font-bold mb-2">訂單編號</span>
          <span className="text-white text-xl">{orderNo}</span>
        </div>
        {url && !success && (
          <button
            className="rounded-md bg-orange-400 px-4 py-2 text-white font-bold"
            onClick={() => handleOpenUrl(url)}
          >
            開啟交易連結
          </button>
        )}
      </div>
      {error && <Warn msg={error} />}
      {success ? (
        <Success />
      ) : (
        <div className="rounded-lg flex flex-col px-4 py-6 bg-slate-700 flex-1">
          <span className="text-white text-xl font-bold">錢包地址</span>
          <Combobox
            className="w-full rounded-md p-3 mt-4"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          >
            <Combobox.Input onChange={(e) => setAddress(e.target.value)} />
          </Combobox>
          <span className="text-white text-xl font-bold mt-4">Hash</span>
          <Combobox
            className="w-full rounded-md p-3 mt-4"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
          >
            <Combobox.Input onChange={(e) => setHash(e.target.value)} />
          </Combobox>
          <button
            className={
              "rounded-md px-4 py-2 font-bold mt-10 " +
              (disabled
                ? "bg-slate-600 text-slate-700"
                : " bg-orange-400 text-white ")
            }
            onClick={handleSubmit}
          >
            回傳交易結果
          </button>
        </div>
      )}

      {/* <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        My account: <strong> {account}</strong>
        My balance: <strong> {balance}</strong>
      </div> */}
      {/* {account && (
        <div style={{ padding: "100px" }}>
          <button onClick={handleTransaction}>交易</button>
        </div>
      )} */}
    </div>
  );
};

export default Wallet;
