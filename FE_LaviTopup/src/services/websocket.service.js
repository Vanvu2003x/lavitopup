import { io } from "socket.io-client";

let socket = null;

const listeners = {
  balance: new Set(),
  order: new Set(),
  payment: new Set(),
};

const SOCKET_PORT = process.env.NEXT_PUBLIC_SOCKET_PORT || "8443";

const buildSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : undefined);

  if (!baseUrl) {
    return undefined;
  }

  try {
    const url = new URL(baseUrl);
    url.port = SOCKET_PORT;
    return url.origin;
  } catch {
    return baseUrl;
  }
};

export const connectSocket = (token, onBalanceUpdate, onOrderUpdate, onPaymentSuccess) => {
  const url = buildSocketUrl();

  if (onBalanceUpdate) listeners.balance.add(onBalanceUpdate);
  if (onOrderUpdate) listeners.order.add(onOrderUpdate);
  if (onPaymentSuccess) listeners.payment.add(onPaymentSuccess);

  if (!socket) {
    socket = io(url, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
    });

    socket.on("connect", () => {
      if (token) {
        socket.emit("auth", token);
      }
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        socket.connect();
      }
    });

    socket.on("authenticated", (user) => {
      localStorage.setItem("balance", user.balance);
      listeners.balance.forEach((cb) => cb(user.balance));
    });

    socket.on("balance_update", (newBalance) => {
      localStorage.setItem("balance", newBalance);
      listeners.balance.forEach((cb) => cb(newBalance));
    });

    socket.on("order_update", (orderData) => {
      listeners.order.forEach((cb) => cb(orderData));
    });

    socket.on("order_status_update", (data) => {
      listeners.order.forEach((cb) => cb(data));
    });

    socket.on("payment_success", (data) => {
      listeners.payment.forEach((cb) => cb(data));
    });
  } else if (!socket.connected) {
    socket.connect();
    if (token) {
      socket.emit("auth", token);
    }
  }

  return {
    socket,
    unsubscribe: () => {
      if (onBalanceUpdate) listeners.balance.delete(onBalanceUpdate);
      if (onOrderUpdate) listeners.order.delete(onOrderUpdate);
      if (onPaymentSuccess) listeners.payment.delete(onPaymentSuccess);
    },
  };
};

export const getSocket = () => socket;

export const isSocketConnected = () => socket?.connected ?? false;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};