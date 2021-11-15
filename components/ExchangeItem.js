import React from "react";
import { View, StyleSheet } from "react-native";
import { Input, Badge, Card, Text } from "react-native-elements";
import SelectDropdown from "react-native-select-dropdown";

const ExchangeItem = (props) => {
  var indicator = props.isWalletToSend ? "-" : "+";
  return (
    <Card containerStyle={{ padding: 10 }}>
      <View style={StyleSheet.exchangeItem}>
        <SelectDropdown
          data={props.walletSelection}
          defaultValue={props.wallet.name}
          onSelect={(selectedItem, index) => {
            props.setWalletHandler(selectedItem);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem;
          }}
          rowTextForSelection={(item, index) => {
            return item;
          }}
        />
        <View style={{ flexDirection: "row", padding: 25 }}>
          <Text h4>Balance: </Text>
          <Text h4>{props.wallet.symbol + props.wallet.balance}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text h4>{indicator}</Text>
          <Input
            keyboardType="numeric"
            placeholder="Enter amount"
            onChangeText={props.onAmountChanged}
            value={`${props.amount}`}
          ></Input>
        </View>
        {props.hasError && props.isWalletToSend ? (
          <Badge value="EXCEEDS BALANCE" status="error" />
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  exchangeItem: {
    marginVertical: 10,
  },
});

export default ExchangeItem;
