export default class Wallet {
    constructor(name, symbol, balance) {
      this.name = name;
      this.symbol = symbol;
      this.balance = balance;
    }
    decreaseBalance(amount) {
        this.balance = Number(this.balance) - Number(amount);
    }
    increaseBalance(amount) {
        this.balance = Number(this.balance) + Number(amount);
    }
    validateAmount(amount) {
      return (this.balance >= amount);
    }
  }
