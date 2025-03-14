const express = require("express");
const router = express.Router();
const lightwallet = require("eth-lightwallet");
const fs = require("fs");

// TODO : lightwallet 모듈을 사용하여 랜덤한 니모닉 코드를 얻습니다.
router.post("/newMnemonic", async (req, res) => {
  try {
    const mnemonic = lightwallet.keystore.generateRandomSeed();
    return res.json({ mnemonic });
  } catch (error) {
    return res.status(500).json({ error: "Failed generating mnemonic" });
  }
});

// TODO : 니모닉 코드와 패스워드를 이용해 keystore와 address를 생성합니다.
router.post("/newWallet", async (req, res) => {
  const { mnemonic, password } = req.body;

  if (!mnemonic || !password) {
    return res
      .status(400)
      .json({ code: 998, message: "Seed phrase & password are required" });
  }

  try {
    lightwallet.keystore.createVault(
      {
        password,
        seedPhrase: mnemonic,
        hdPathString: "m/0'/0'/0'",
      },
      (err, ks) => {
        if (err) {
          console.log("err", err);
          res.status(500).json({ code: 999, message: "Vault creation failed" });
          return;
        }

        ks.keyFromPassword(password, (err, pwDerivedKey) => {
          if (err) {
            res
              .status(500)
              .json({ code: 999, message: "Key derivation failed" });
            return;
          }

          ks.generateNewAddress(pwDerivedKey, 1);

          // let address = ks.getAddresses().toString();
          let keystore = ks.serialize();

          fs.writeFile("wallet.json", keystore, (err) => {
            if (err) {
              res
                .status(500)
                .json({ code: 999, message: "Failed to save wallet file" });
            } else {
              res.json({ code: 1, message: "성공" });
            }
          });
        });
      }
    );
  } catch (exception) {
    console.log("NewWallet ==>>>> " + exception);
  }
});

module.exports = router;
