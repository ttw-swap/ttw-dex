window.onload = async function () {

  const TTW = "0x8f38510133788618c06D5F70a1A0EEe6CB27b55C";
  const USDT = "0x55d398326f99059fF775485246999027B3197955";
  const ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

  const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function decimals() view returns (uint8)"
  ];

  const ROUTER_ABI = [
    "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn,uint amountOutMin,address[] calldata path,address to,uint deadline) external"
  ];

  const { createWeb3Modal, defaultWagmiConfig, chains } = window.WEB3MODAL_WAGMI;
  const bsc = chains.bsc;
  const projectId = "1fbb3efa6a524903b8d72a79b44c27cb";

  const config = defaultWagmiConfig({
    chains: [bsc],
    projectId,
    metadata: { name: "TTW Swap" }
  });

  createWeb3Modal({ wagmiConfig: config, projectId });

  let provider, signer;

  const connectBtn = document.getElementById("connectBtn");
  const walletAddressDiv = document.getElementById("walletAddress");
  const approveBtn = document.getElementById("approveBtn");
  const swapBtn = document.getElementById("swapBtn");
  const statusDiv = document.getElementById("status");

  connectBtn.onclick = async () => {
    await config.connect();
    provider = new ethers.BrowserProvider(config.getProvider());
    signer = await provider.getSigner();
    walletAddressDiv.innerText = "Connected: " + await signer.getAddress();
    connectBtn.innerText = "Connected";
  };

  approveBtn.onclick = async () => {
    const token = new ethers.Contract(TTW, ERC20_ABI, signer);
    const decimals = await token.decimals();
    const max = ethers.parseUnits("1000000000", decimals);
    const tx = await token.approve(ROUTER, max);
    statusDiv.innerText = "Approving...";
    await tx.wait();
    statusDiv.innerText = "Approved ✅";
  };

  swapBtn.onclick = async () => {
    const amount = document.getElementById("amount").value;
    const token = new ethers.Contract(TTW, ERC20_ABI, signer);
    const decimals = await token.decimals();
    const amountIn = ethers.parseUnits(amount, decimals);
    const router = new ethers.Contract(ROUTER, ROUTER_ABI, signer);

    statusDiv.innerText = "Swapping...";

    const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      amountIn, 0, [TTW, USDT], await signer.getAddress(), Math.floor(Date.now()/1000)+300
    );

    await tx.wait();
    statusDiv.innerText = "Swap Complete ✅";
  };
};
