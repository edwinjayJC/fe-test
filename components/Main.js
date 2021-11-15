import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { Chip, Button, Overlay, Text } from "react-native-elements";
import { RootSiblingParent } from "react-native-root-siblings";
import Toast from "react-native-root-toast";
import {
  StyleSheet,
  View,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import ExchangeItem from "./ExchangeItem";
import Wallet from "../models/wallet";

const Main = (props) => {
  var USDWallet = new Wallet("USD", "$", 200);
  var EURWallet = new Wallet("EUR", "€", 150);
  var GBPWallet = new Wallet("GBP", "£", 10);
  const [wallets, setNewWallets] = useState([USDWallet, EURWallet, GBPWallet]);
  const [isLoading, setIsLoading] = useState(true);
  const [transactionState, setNewtransactionState] = useState({
    receiveWallet: USDWallet,
    sendWallet: EURWallet,
    receiveAmount: 0,
    sendAmount: 0,
    hasError: false,
    rates: null,
    conversionRate: 0,
  });
  useEffect(() => {
    setConversionRate();
  }, [
    transactionState.sendWallet,
    transactionState.receiveAmount,
    transactionState.rates,
  ]);

  const [walletSelection, setWalletSelection] = useState(
    wallets.map((wallet) => {
      return wallet["name"];
    })
  );
  const apiKey = "2fb050533a1003f2579aa47037f399f8";
  const getExchangeRates = async () => {
    try {
      const response = await fetch(
        `http://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}&symbols=GBP,EUR,USD`
      );
      const json = await response.json();
      setNewtransactionState((transactionState) => {
        return { ...transactionState, rates: json.rates };
      });
      setConversionRate();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading((isLoading) => false);
    }
  };

  useEffect(() => {
    getExchangeRates();
  }, []);

  const setSendingWallet = (selectedWallet) => {
    setNewtransactionState((transactionState) => {
      return {
        ...transactionState,
        sendWallet: wallets.find((wallet) => wallet.name === selectedWallet),
      };
    });
    console.log(transactionState.sendWallet);
    setConversionRate();
  };

  const setReceivingWallet = (selectedWallet) => {
    setNewtransactionState((transactionState) => {
      return {
        ...transactionState,
        receiveWallet: wallets.find((wallet) => wallet.name === selectedWallet),
      };
    });
    console.log(transactionState.receiveWallet);
    setConversionRate();
  };

  const switchSendAndReceive = () => {
    setNewtransactionState((transactionState) => {
      return {
        ...transactionState,
        sendWallet: transactionState.receiveWallet,
        receiveWallet: transactionState.sendWallet,
      };
    });
    setConversionRate();
  };

  var currencyRates = {
    USD: transactionState.rates !== null ? transactionState.rates["USD"] : 1,
    EUR: transactionState.rates !== null ? transactionState.rates["EUR"] : 1,
    GBP: transactionState.rates !== null ? transactionState.rates["GBP"] : 1,
  };

  const convertCurrency = (currentCurrency, desiredCurrency, amount) => {
    var currentRate = currencyRates[currentCurrency];
    var desiredRate = currencyRates[desiredCurrency];

    var USDAmount = amount * currentRate;
    var convertedAmount = USDAmount / desiredRate;

    return convertedAmount.toFixed(2);
  };

  const formatEnteredAmount = (enteredAmount) => {
    formattedAmount = enteredAmount.replace(/[^0-9.]/g, "");
    var i = formattedAmount.indexOf(".");
    if (i !== -1 && formattedAmount.substr(i + 1).length > 2) {
      formattedAmount = formattedAmount.substring(
        0,
        formattedAmount.length - 1
      );
    }
    return (
      formattedAmount.substr(0, i + 1) +
      formattedAmount.substr(i + 1).replace(/[^0-9]/g, "")
    );
  };

  const setSendAmountHandler = (enteredAmount) => {
    var formattedAmount = formatEnteredAmount(enteredAmount);
    var receivedAmount = convertCurrency(
      transactionState.sendWallet.name,
      transactionState.receiveWallet.name,
      formattedAmount
    );

    setNewtransactionState((transactionState) => {
      return {
        ...transactionState,
        sendAmount: formattedAmount,
        receiveAmount: receivedAmount,
        hasError: !transactionState.sendWallet.validateAmount(formattedAmount),
      };
    });
    setConversionRate();
  };

  const setReceiveAmountHandler = (enteredAmount) => {
    var formattedAmount = formatEnteredAmount(enteredAmount);
    var sendAmount = convertCurrency(
      transactionState.receiveWallet.name,
      transactionState.sendWallet.name,
      formattedAmount
    );
    setNewtransactionState((transactionState) => {
      return {
        ...transactionState,
        sendAmount: sendAmount,
        receiveAmount: formattedAmount,
        hasError: !transactionState.sendWallet.validateAmount(formattedAmount),
      };
    });
    setConversionRate();
  };

  const setConversionRate = () => {
    var conversionRate = convertCurrency(
      transactionState.sendWallet.name,
      transactionState.receiveWallet.name,
      1
    );
    setNewtransactionState((transactionState) => ({
      ...transactionState,
      conversionRate: conversionRate,
    }));
  };

  const exchangeFunds = () => {
    if (!transactionState.hasError) {
      if (transactionState.receiveWallet === transactionState.sendWallet) {
        let _ = Toast.show("Currencies must be different", {
          duration: Toast.durations.LONG,
        });
      } else {
        var currentWallets = wallets;
        currentWallets = updateWalletBalance(
          transactionState.sendWallet,
          true,
          currentWallets,
          transactionState.sendAmount
        );
        currentWallets = updateWalletBalance(
          transactionState.receiveWallet,
          false,
          currentWallets,
          transactionState.receiveAmount
        );

        setNewWallets((wallets) => {
          return currentWallets;
        });

        setNewtransactionState((transactionState) => ({
          ...transactionState,
        }));

        console.log("Funds Exchanged");
      }
    }
  };

  const updateWalletBalance = (
    walletForUpdate,
    isSendWallet,
    walletArray,
    amount
  ) => {
    var foundWallet = walletArray.find((wallet) => wallet === walletForUpdate);
    var indexOfWallet = walletArray.findIndex(
      (wallet) => wallet === foundWallet
    );
    if (isSendWallet) {
      foundWallet.decreaseBalance(amount);
    } else {
      foundWallet.increaseBalance(amount);
    }
    walletArray[indexOfWallet] = foundWallet;
    return walletArray;
  };

  var chipConversionText =
    transactionState.sendWallet.symbol +
    "1=" +
    transactionState.receiveWallet.symbol +
    transactionState.conversionRate;

  return (
    <RootSiblingParent>
      <View style={styles.container}>
        <Overlay visible={isLoading}>
          <ActivityIndicator size="large" style={styles.padded} />
          <Text h4 style={styles.padded}>
            Loading exchange rates
          </Text>
        </Overlay>
        <StatusBar style="auto" />
        <Text h3 style={styles.padded}>
          Currency Converter
        </Text>
        <ExchangeItem
          walletSelection={walletSelection}
          wallet={transactionState.sendWallet}
          setWalletHandler={(value) => setSendingWallet(value)}
          onAmountChanged={setSendAmountHandler}
          isWalletToSend={true}
          amount={transactionState.sendAmount}
          hasError={transactionState.hasError}
        ></ExchangeItem>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            height: 100,
            justifyContent: "space-between",
            alignItems: "center",
            padding: 30,
          }}
        >
          <Chip title={chipConversionText} type="outline" />
          <TouchableWithoutFeedback
            onPress={() => {
              switchSendAndReceive();
            }}
          >
            <Image
              source={require("../assets/swap.png")}
              style={styles.image}
            ></Image>
          </TouchableWithoutFeedback>
        </View>
        <ExchangeItem
          walletSelection={walletSelection}
          wallet={transactionState.receiveWallet}
          setWalletHandler={(value) => setReceivingWallet(value)}
          onAmountChanged={setReceiveAmountHandler}
          isWalletToSend={false}
          amount={transactionState.receiveAmount}
        ></ExchangeItem>
        <Button
          title="Exchange"
          style={{ padding: 30 }}
          onPress={() => exchangeFunds()}
        />
      </View>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  image: {
    width: 50,
    height: 50,
  },
  padded: {
    padding: 10,
  },
});

export default Main;
