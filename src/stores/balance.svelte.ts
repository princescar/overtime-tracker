import { request } from "#/utils/request";

let balance = $state(0);

export const balanceStore = {
  get balance() {
    return balance;
  },
};

export const initBalanceStore = (initialBalance: number) => {
  balance = initialBalance;
};

export const refreshBalance = async () => {
  const { balance: refreshedBalance } = await request<{ balance: number }>("/api/balance", "GET");
  balance = refreshedBalance;
};
