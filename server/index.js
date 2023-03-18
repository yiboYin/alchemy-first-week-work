const express = require("express");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "04e8c8b78362e32110a1e2fbfad5d4c83c65308110c7e61e4480bf2f416232c793b4cf8ed9d74ef32a985d5bf322fd491e37844821d0163ad055d94c525465ca4f": 100,
  "047ca6a9f309059d094d654ef3bd67f4baffe4c3854dc9c245c93a36f37ceb0794af60c320a425ced3ad1d9146f443e9bbc6e495a64f8854841285bd54751d3397": 50,
  "04323fae273d6aaaa26f3e18ffbef607ebe959e970f786f070d4b86733bc521b0b18e854d2aed3d2a6d8c1aeeb8659494ad0b1da5983c79b73321bc0720569bf98": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, msgBody, sigResult, msgBody: { recipient, amount } } = req.body;
  const [sigObj, recoveryBit] = sigResult;
  const signature = new Uint8Array(Object.values(sigObj));
  const checkRes = await checkSignature(sender, msgBody, signature, recoveryBit);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (checkRes) {
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
    res.status(400).send({ message: "Not Right Signature!" });
  }

  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

async function checkSignature(sender, msgBody, signature, recoveryBit) {
  const msg = JSON.stringify(msgBody)
  const recovered = await recoverKey(msg, signature, recoveryBit);
  return toHex(recovered) === sender;
}

async function recoverKey(message, signature, recoveryBit) {
  const msgHash = keccak256(utf8ToBytes(message))
  const res = await secp.recoverPublicKey(msgHash, signature, recoveryBit)
  return res
}
