import axios from "axios";

const baseURL = "https://cash-stage.sticksbattle.com/api/v1";

const instance = axios.create({
  baseURL,
});

export const getOrderInfo = (order_no) =>
  instance.get("/order/pay_order_info", { params: { order_no } });

export const postOrderTransResult = (data) =>
  instance.post("/order/transaction_result", null, { params: data });
