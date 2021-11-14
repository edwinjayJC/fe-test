import Wallet from '../models/wallet';

test('wallet model works correctly', () => {
  var USDWallet = new Wallet("USD", "$", 200);
  USDWallet.decreaseBalance(10)
  expect(USDWallet.balance).toBe(190);
  USDWallet.increaseBalance(20)
  expect(USDWallet.balance).toBe(210);
  expect(USDWallet.validateAmount(300)).toBe(false);
  expect(USDWallet.symbol).toBe("$");
  expect(USDWallet.name).toBe("USD");
});