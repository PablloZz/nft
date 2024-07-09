// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Encoding {
  function combineStrings() public pure returns (string memory) {
    return string(abi.encodePacked("Hi Mom! ", "Miss you!"));
  }

  // When we send a transaction, it is "compiled" down to bytecode and sent in a "data" object of the transaction.
  // That data object now governs how future transactions will interact with it.
  // This bytecode represents exactly the low level computer instructions to make our contract happen.
  // These low level instructions are spread into something called opcodes.

  // An opcode is going to be 2 characters that represents some special instructions, and also optionally has an input
  // This opcode reader is sometimes abstractly called the EVM - or the ethereum virtual machine.
  // The EVM basically represents all the instructions a computer needs to be able to read.
  // Any language that can compile down to bytecode with these opcodes is considered EVM compatible.
  // Which is why so many blockchains are able to do this - you just get them to be able to understand the EVM and presto! Solidity smart contracts work on those blockchains.

  function encodeNumber() public pure returns (bytes memory) {
    bytes memory number = abi.encode(1);
    return number;
  }

  function encodeString() public pure returns (bytes memory) {
    bytes memory someString = abi.encode("String");
    return someString;
  }

  function encodeStringPacked() public pure returns (bytes memory) {
    bytes memory someString = abi.encodePacked("String");
    return someString;
  }

  function encodeStringBytes() public pure returns (bytes memory) {
    bytes memory someString = bytes("String");
    return someString;
  }

  function decodeString() public pure returns (string memory) {
    string memory someString = abi.decode(encodeString(), (string));
    return someString;
  }

  function multiEncode() public pure returns (bytes memory) {
    bytes memory someString = abi.encode("String", "It's bigger!");
    return someString;
  }

  // Gas: 3057
  function multiDecode() public pure returns (string memory, string memory) {
    (string memory someString, string memory someOtherString) = abi.decode(
      multiEncode(),
      (string, string)
    );
    return (someString, someOtherString);
  }

  function multiEncodePacked() public pure returns (bytes memory) {
    bytes memory someString = abi.encodePacked("String", "It's bigger!");
    return someString;
  }

  // This doesn't work!
  function multiDecodePacked() public pure returns (string memory, string memory) {
    (string memory someString, string memory someOtherString) = abi.decode(
      multiEncodePacked(),
      (string, string)
    );
    return (someString, someOtherString);
  }

  // This does!
  // Gas: 1157
  function multiStringCastDecodePacked() public pure returns (string memory) {
    string memory someString = string(multiEncodePacked());
    return someString;
  }

  // Solidity has some more "low-level" keywords, namely "staticcall" and "call".
  // call: How we call functions to change the state of the blockchain.
  // staticcall: How (at a low level) we do our "view" or "pure" function calls, and potentially don't change the blockchain state.

  function withdraw(address recentWinner) public {
    (bool success, ) = recentWinner.call{ value: address(this).balance }("");
    require(success, "Transfer Failed");
  }

  // - In our {} we were able to pass specific fields of a transaction, like value.
  // - In our () we were able to pass data in order to call a specific function.
}
