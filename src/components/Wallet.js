import { useEffect, useMemo, useState } from "react";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../utils/config";
import { getOrderInfo, postOrderTransResult } from "../api";
import SuccessSvg from "../assets/success.svg";
import Loading from "../components/Loading";
import { Combobox } from "@headlessui/react";
import Web3 from "web3";

const Warn = ({ msg }) => {
  return (
    <div className="bg-red-200 text-red-700 font-bold rounded-md p-2 flex flex-row mb-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="w-6 h-6 mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
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
      <img alt="success-svg" src={SuccessSvg} className="w-40" />
      <span className="text-emerald-500 font-bold text-2xl mt-6">交易成功</span>
    </div>
  );
};

const Wallet = () => {
  const [orderNo, setOrderNo] = useState();
  const [url, setUrl] = useState();
  const [address, setAddress] = useState();
  const [error, setError] = useState();
  const [success, setSuccess] = useState();
  const [rendering, setRendering] = useState(false);

  useEffect(() => {
    getOrder();
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
          if (deviceType() !== "desktop") handleOpenUrl(url);
          else manuallyHandleEth(data);
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
    arr.forEach((e) => {
      let item = (e || "").split("=");
      if (item[0] === "order_no") {
        setOrderNo(item[1]);
      }
    });
  };

  const deviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    } else if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
  };

  const disabled = useMemo(() => {
    return !address || address?.length === 0 || rendering;
  }, [address, rendering]);

  const manuallyHandleEth = async (val) => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      await web3.eth.getAccounts().then(async (e) => {
        let account = e[0];
        try {
          const gasBigInt = await web3.eth.estimateGas({ from: account });
          let payload = {
            gas: gasBigInt,
            from: account,
            to: val.receiver_address,
            value: val.amount,
          };
          await handleSwitchNet();
          await handleTransaction(payload);
        } catch (e) {
          console.log(e);
        }
      });
    } else {
      console.log("Metamask is not installed");
    }
  };

  const handleSwitchNet = async () => {
    try {
      const web3 = new Web3(window.ethereum);
      let chainId = web3.utils.toHex(137);
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleTransaction = async (payload) => {
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      await contract.methods
        .transfer(payload.to, web3.utils.toWei(1, "Mwei"))
        .send({ from: payload.from });
    } catch (e) {
      console.log(e);
    }
  };

  const handleOpenUrl = (val) => window.open(val);

  const handleSubmit = () => {
    if (rendering) return;

    let payload = {
      order_no: orderNo,
      pay_address: address,
    };
    setError(null);
    setRendering(true);

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
      })
      .finally(() => setRendering(false));
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
          <button
            className={
              "rounded-md px-4 py-2 font-bold mt-10 " +
              (disabled
                ? "bg-slate-600 text-slate-700"
                : " bg-orange-400 text-white ")
            }
            onClick={handleSubmit}
          >
            {rendering ? <Loading /> : "回傳交易結果"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Wallet;
