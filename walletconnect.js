// TODO: pass the coin symbol into a dictionary of coin symbols and coin id to allow passing in symbols to coinprice in coingecko
const connectButton = document.querySelector('.connect');
const errMsg = document.querySelector('.err-msg');
const overlay = document.querySelector('.overlay')
if (typeof window.ethereum !== 'undefined') {
  let web3 = window.ethereum
  connectButton.addEventListener('click', ()=> {
    getAccount();
    overlay.classList.add('overlayed')
  })
} else {
  errMsg.innerHTML = 'Install MetaMask to connect!'
};

async function getAccount() {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    let account = accounts[0].slice(0,8)+'...'
    connectButton.innerHTML = account
    // account = '0x5AA3393e361C2EB342408559309b3e873CD876d6'
    fetch('http://api.ethplorer.io/getAddressInfo/'+accounts[0]+'?apiKey=freekey')
    .then(response => response.json())
    .then(data =>
      parseData(data)
    )
    .catch(err => {
      console.log(err)
    });
};
// fetch('http://api.ethplorer.io/getAddressInfo/0x5AA3393e361C2EB342408559309b3e873CD876d6?apiKey=freekey')
//     .then(response => response.json())
//     .then(data =>
//       console.log(data)
//     );
async function parseData(data) {
  const balance = document.querySelector('.t-balance');
  let dbalance = document.querySelector('.d-balance')
  // balance.appendChild(ethBalance);
  console.log(data)
  coinList().then((coinList)=>{
    getCoins(data,coinList,dbalance)
  })
};
// map(function(value,index) {return value.id;}
// wrapper function
async function innerCoinList() {
  let coinList = await coinList()
}

async function getCoins(data,coinList,dbalance) {
  const balance = document.querySelector('.t-balance');
  let arr = []
  let totalVal = 0
  let symbols = coinList.map(function(value){return value[0].toLowerCase()})
  let ids = coinList.map(function(value){return value[1]})
  // console.log(coinList)
  // Ethereum is handled differently under the ethplorer API
  const ethBalance = document.createElement('div');
  let ethPrice = await coinPrice('ethereum')
  const ethVal = ethPrice*data.ETH.balance
  totalVal += ethVal
  ethBalance.innerHTML = 'Ethereum: ' + round(data.ETH.balance).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ($'+round(ethVal)+')';
  arr.push([ethVal,ethBalance])
  // balance.appendChild(ethBalance)
  console.log(ids)
  for (let i = 0; i < data.tokens.length; i++) {
    let name = data.tokens[i].tokenInfo.name.toLowerCase().replace(' ','-');
    if (ids.includes(name)) {
        let name = data.tokens[i].tokenInfo.name.toLowerCase().replace(' ','-');
        console.log(name)
        let token = document.createElement('div');
        let bal = data.tokens[i].balance/(10**parseInt(data.tokens[i].tokenInfo.decimals));
        await coinPrice(ids.filter(function(value){return value==name})).then(price=>{
          let val = bal * price;
            totalVal+=val
            token.innerHTML = (data.tokens[i].tokenInfo.name) +": "+ round(bal)+" ($"+round(val)+")"
            arr.push([val,token])
            dbalance.innerHTML = "$"+round(totalVal).toString()
        }).catch(err=>{return});
      }
  }
  let sortedArr = arr.sort(sort2d)
  for (let i = 0; i < arr.length; i++) {
    balance.appendChild(sortedArr[i][1])
  }
};

function round(x) {
  n = parseFloat(x.toFixed(2));
  return n.toLocaleString();
}

function sort2d(a, b) {
  if (a[0] === b[0]) {
      return 0;
  }
  else {
      return (a[0] > b[0]) ? -1 : 1;
  }
}