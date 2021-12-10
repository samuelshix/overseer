const connectButton = document.querySelector('.connect');
const errMsg = document.querySelector('.err-msg');
const overlay = document.querySelector('.overlay')
if (typeof window.ethereum !== 'undefined') {
  let web3 = window.ethereum
  connectButton.addEventListener('click', ()=> {
    getAccount();
    overlay.classList.add('overlayed')
    setTimeout(function(){overlay.style.display='None'},1000)
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
    getCoins(data,coinList,dbalance).then((arr)=> {
      console.log(arr)
    })
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
  
  graph(sortedArr)
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

// charting
var ctx = document.getElementById('myChart');
const data = {
  labels: [
    'Red',
    'Blue',
    'Yellow'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    hoverOffset: 4
  }]
};

const config = {
  type: 'doughnut',
  data: data,
};

function graph(arr) {
  let vals = arr.map(function(value){return value[0]})
  let labels = arr.map(function(value){return value[1].innerHTML})
  var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: labels,
        datasets: [{
            label: 'Composition',
            data: vals,
            backgroundColor: [
              'rgba(0,200,180,.8)', 'rgba(0,176,255,.8)','rgba(0,104,254,.8)', 'rgba(0,0,251,.8)', 'rgba(126,56,252,.8)', 'rgba(186,0,255,.8)', 'rgba(237,0,255,.8)'
            ].slice(0,arr.length),
            borderWidth: 0,
            borderRadius: 5,
            hoverBackgroundColor: [
              'rgba(0,255,229,1)', 'rgba(0,176,255,1)','rgba(0,104,254,1)', 'rgba(0,0,251,1)', 'rgba(126,56,252,1)', 'rgba(186,0,255,1)', 'rgba(237,0,255,1)'
          ].slice(0,arr.length),
          hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
    }
}); 
}
