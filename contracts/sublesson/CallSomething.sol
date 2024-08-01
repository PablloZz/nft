// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// In order to call a function using only the data field of call, we need to encode:
// 1. The function name -> function selector
// 2. The parameters we want to add
// Down to the binary level

// Each contract assigns each function it has a function ID. This is known as the "function selector".
// The "function selector" is the first 4 bytes of the function signature.
// The "function signature" is a string that defines the function name & parameters.

contract CallAnything {
  address public s_someAddress;
  uint256 public s_amount;

  function transfer(address someAddress, uint256 amount) public {
    s_someAddress = someAddress;
    s_amount = amount;
  }

  // "transfer(address,uint256)" is our function signature
  // And our resulting function selector of "transfer(address,uint256)" is output from this function
  // One thing ot note here is that there shouldn't be any spaces in "transfer(address,uint256)"
  function getSelectorOne() public pure returns (bytes4 selector) {
    selector = bytes4(keccak256(bytes("transfer(address,uint256)")));
  }

  function getDataToCallTransfer(
    address someAddress,
    uint256 amount
  ) public pure returns (bytes memory) {
    return abi.encodeWithSelector(getSelectorOne(), someAddress, amount);
  }

  function callTransferFunctionDirectly(
    address someAddress,
    uint256 amount
  ) public returns (bytes4, bool) {
    (bool success, bytes memory returnData) = address(this).call(
      getDataToCallTransfer(someAddress, amount)
    );
    return (bytes4(returnData), success);
  }

  function callTransferFunctionDirectlySig(
    address someAddress,
    uint256 amount
  ) public returns (bytes4, bool) {
    (bool success, bytes memory returnData) = address(this).call(
      abi.encodeWithSignature("transfer(address,uint256)", someAddress, amount)
    );
    return (bytes4(returnData), success);
  }

  function getSelectorTwo() public view returns (bytes4 selector) {
    bytes memory functionCallData = abi.encodeWithSignature(
      "transfer(address,uint256)",
      address(this),
      123
    );
    selector = bytes4(
      bytes.concat(
        functionCallData[0],
        functionCallData[1],
        functionCallData[2],
        functionCallData[3]
      )
    );
  }

  function getSelectorThree(bytes calldata functionCallData) public pure returns (bytes4 selector) {
    assembly {
      selector := calldataload(functionCallData.offset)
    }
  }

  function getSelectorFour() public pure returns (bytes4 selector) {
    return this.transfer.selector;
  }
}

contract CallFunctionWithoutContract {
  address public s_selectorsAndSignaturesAddress;

  constructor(address selectorsAndSignaturesAddress) {
    s_selectorsAndSignaturesAddress = selectorsAndSignaturesAddress;
  }

  function callFunctionDirectly(bytes calldata callData) public returns (bytes4, bool) {
    (bool success, bytes memory returnData) = s_selectorsAndSignaturesAddress.call(
      abi.encodeWithSignature("getSelectorThree(bytes)", callData)
    );
    return (bytes4(returnData), success);
  }

  function staticCallFunctionDirectly() public view returns (bytes4, bool) {
    (bool success, bytes memory returnData) = s_selectorsAndSignaturesAddress.staticcall(
      abi.encodeWithSignature("getSelectorOne()")
    );
    return (bytes4(returnData), success);
  }

  function callTransferFunctionDirectlyThree(
    address someAddress,
    uint256 amount
  ) public returns (bytes4, bool) {
    (bool success, bytes memory returnData) = s_selectorsAndSignaturesAddress.call(
      abi.encodeWithSignature("transfer(address, uint256)", someAddress, amount)
    );
    return (bytes4(returnData), success);
  }
}
