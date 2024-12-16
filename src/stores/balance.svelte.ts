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

export const refresh = async () => {
  const { balance: refreshedBalance } = await request<{ balance: number }>("GET", "/api/balance");
  balance = refreshedBalance;
};
