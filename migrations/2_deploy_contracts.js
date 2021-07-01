const DappToken = artifacts.require("DappToken.sol");

module.exports = function (deployer) {
  deployer.deploy(DappToken, 1000000); // 初始化参数
};
