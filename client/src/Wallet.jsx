import server from "./server";
import { useState } from "react";
import * as secp from "ethereum-cryptography/secp256k1";
import {toHex} from "ethereum-cryptography/utils"

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const inputVal = evt.target.value;
    setPrivateKey(inputVal);
    const publicKey = toHex(secp.getPublicKey(inputVal))
    setAddress(publicKey);
    if (publicKey) {
      const {
        data: { balance },
      } = await server.get(`balance/${publicKey}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>
      <label>
        Your Private Key
        <input placeholder="Type an Key, for example: 0x1" value={privateKey} onChange={onChange}></input>
      </label>
      <label>
        Wallet Address
        <div className="balance">{address || 'Your Wallet Address'}</div>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
