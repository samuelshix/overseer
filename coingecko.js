async function coinList() {
  return fetch('https://api.coingecko.com/api/v3/coins/list')
  .then(response => {return response.json()})
  .then(data => {return data.map(function(value,index) {return value.symbol;});
})
}

async function coinPrice(coin) {
  return fetch('https://api.coingecko.com/api/v3/coins/'+coin)
  .then(response => response.json())
  .then(data => data.market_data.current_price.usd)
}

async function checkCoin(contract) {
  return fetch('https://api.coingecko.com/api/v3/coins/ethereum/contract/'+contract)
  .then(response => {
    if (!response.ok) {
      return false
    } else {
      return true
    }
  })
}