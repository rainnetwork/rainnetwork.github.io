let userAddr
let v2Addr = '0xe31DEbd7AbFF90B06bCA21010dD860d8701fd901'
let v3Addr = '0x265ba42daf2d20f3f358a7361d9f69cb4e28f0e6'
let poolAddr = '0x5088797005d8d76b45d850513e69ed8ae88fafad'

let v2
let v3
let pool

window.addEventListener('load', async function() {
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    try {
      await ethereum.enable() // Request access
      await setup()
      await interfaceLoop()
      fastLoop()
    } catch (error) {
        // User denied account access...
        console.error(error)
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    window.web3 = new Web3(web3.currentProvider);
    // Acccounts always exposed
    await setup()
    await interfaceLoop()
    fastLoop()
  }
})

async function setup() {
  try {
    // Initialize contracts
    v2 = await new web3.eth.Contract(v2Abi, v2Addr)
    v3 = await new web3.eth.Contract(v3Abi, v3Addr)
    pool = await new web3.eth.Contract(poolAbi, poolAddr)
    
  } catch(error) { console.error(error) }
}

let upgradeModalTriggered = false

let v2Bal = 0

function addCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatTokens(num) {
  return addCommas((num / 1e18).toFixed(2))
}

let g = {}

async function loadG(data) {
  for (i=0; i<data.length; i++) {
    data[i] = Number(data[i])
  }
  g['balance'] = data[0]
  g['stake'] = data[1]
  g['divs'] = data[2]
  g['allDivs'] = data[3]
  g['liqPoolTokens'] = data[4]
  g['totalSupply'] = data[5]
  g['totalStaked'] = data[6]
  g['totalBurned'] = data[7]
  g['toBurn'] = data[8]
  g['lastBurn'] = data[9]

  g['update'] = new Date().getTime()
}



/*function getBurnAmount() public view returns (uint) {
  uint _time = now - lastBurnTime;
  uint _poolAmount = balanceOf(pool);
  uint _burnAmount = (_poolAmount * burnRate * _time) / (day * 100);
  return _burnAmount;
}*/

function getBurned() {
  //let passed = (new Date().getTime() - g['update']) / 1000
  let passed = (new Date().getTime() / 1000) - g['lastBurn']
  return (g['liqPoolTokens'] * 3 * passed) / ((24*60*60)*100)
}

let ethUsd = 228.37

async function interfaceLoop() {
  try {
    let accounts = await web3.eth.getAccounts()
    userAddr = accounts[0]
    
    v2Bal = await v2.methods.balanceOf(userAddr).call()
    if (Number(v2Bal) > 0 && !upgradeModalTriggered) {
      console.log(Number(v2Bal))
      $("#swap").modal('show')
      upgradeModalTriggered = true
    }

    let data = await v3.methods.allInfoFor(userAddr).call()
    await loadG(data)

    $('.totalStaked').text(formatTokens(g['totalStaked']))
    $('.walletTokens').text(formatTokens(Number(g['balance']) + Number(g['divs'])))
    $('.stakeTokens').text(formatTokens(g['stake']))
    $('.totalDivs').text(formatTokens(Number(g['allDivs']) + Number(g['divs'])))
    $('.totalBurned').text(formatTokens(g['totalBurned']))

    let res = await pool.methods.getReserves().call()
    $('.totalEthLiq').text(formatTokens(res[1]) + ' ETH')

    setTimeout(interfaceLoop, 2000)
  } catch(error) { 
    console.log(error)
    //console.log(error.error)
    setTimeout(interfaceLoop, 2000)    
  }
}

function fastLoop () {

  // .totalSupply
  // .totalBurned
  // .toBurn
  // .burnReward

  let burned = getBurned()
  let finalBurned = burned * 0.7
  $('.totalSupply').text(formatTokens(g['totalSupply'] - finalBurned))
  $('.totalTokenLiq').text(formatTokens(g['liqPoolTokens'] - finalBurned))
  
  $('.toBurn').text(formatTokens(finalBurned))
  $('.stakingReward').text(formatTokens(burned*0.2))
  $('.burnReward').text(formatTokens(burned*0.1))

  setTimeout(fastLoop, 100)
}

function upgrade() {
  v2.methods.approveAndCall(v3Addr, v2Bal, '0x0').send({from: userAddr})
}

function burn() {
  v3.methods.burnPool().send({from: userAddr})
}

function stake() {
  let amount = web3.utils.toWei($('#stakeInput').val())
  v3.methods.stake(userAddr, amount).send({from:userAddr})
}

function unstake() {
  let amount = web3.utils.toWei($('#unstakeInput').val())
  v3.methods.unstake(amount).send({from:userAddr})
}

function transfer() {
  let amount = web3.utils.toWei($('#transferInput').val())
  v3.methods.transfer($('#transferAddr').val(), amount).send({from:userAddr})
}
