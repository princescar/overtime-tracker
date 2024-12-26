import { request } from "#/utils/request";

class BalanceStore {
  #balance = $state(0);

  get balance() {
    return this.#balance;
  }

  get shouldWarn() {
    return this.#balance < 9 * 60; // Less than 9 hours
  }

  init(initialBalance: number) {
    this.#balance = initialBalance;
  }

  async refresh() {
    const { balance: newBalance } = await request<{ balance: number }>("/api/balance", "GET");
    this.#balance = newBalance;
  }
}

export const balanceStore = new BalanceStore();
